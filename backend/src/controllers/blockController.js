const Block = require('../models/Block');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Purchase = require('../models/Purchase');
const mongoose = require('mongoose');
const { getPricingForLevel, updatePricingForLevel } = require('../services/pricingDefaultsService');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

// Get blocks by subject (optimized with batch queries instead of N+1 database queries)
const getBlocksBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { includeInactive } = req.query;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid Subject ID' });
    }

    const cacheKey = `blocks_${subjectId}_${includeInactive === 'true'}_${req.user?._id || 'anon'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const subject = await Subject.findById(subjectId)
      .populate('semesterId', 'name semesterNumber')
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code')
      .lean();

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const query = { subjectId };
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    const blocks = await Block.find(query).sort({ blockNumber: 1, order: 1 }).lean();

    if (blocks.length === 0) {
      const emptyRes = {
        success: true,
        subject: {
          _id: subject._id,
          name: subject.name,
          code: subject.code,
          description: subject.description,
          semester: subject.semesterId,
          course: subject.courseId,
          college: subject.collegeId,
          isPurchased: req.user?.role === 'admin',
        },
        count: 0,
        blocks: [],
      };
      setCache(cacheKey, emptyRes, 60 * 1000, ['block', `subject_${subjectId}`]);
      return res.status(200).json(emptyRes);
    }

    const blockIds = blocks.map((b) => b._id);

    // Parallel batch queries: purchases, units under all blocks, notes under all blocks
    const [purchases, allUnits, allNotes] = await Promise.all([
      req.user && req.user.role !== 'admin'
        ? Purchase.find({
            userId: req.user._id,
            $or: [
              { itemType: 'semester', itemId: subject.semesterId?._id },
              { itemType: 'subject', itemId: subject._id },
              { itemType: 'block', itemId: { $in: blockIds } },
            ],
          }).lean()
        : Promise.resolve([]),

      Unit.find({ blockId: { $in: blockIds }, isPublished: true })
        .sort({ unitNumber: 1, order: 1 })
        .lean(),

      Note.find({
        blockId: { $in: blockIds },
        status: 'published',
        isPublished: true,
      })
        .select('blockId title type previewPageCount pageCount')
        .lean(),
    ]);

    let hasFullAccess = req.user?.role === 'admin';
    const purchasedBlockIds = new Set();
    purchases.forEach((p) => {
      if (p.itemType === 'semester' || p.itemType === 'subject') hasFullAccess = true;
      if (p.itemType === 'block') purchasedBlockIds.add(p.itemId.toString());
    });

    const unitsByBlock = new Map();
    allUnits.forEach((u) => {
      const bId = u.blockId.toString();
      if (!unitsByBlock.has(bId)) unitsByBlock.set(bId, []);
      unitsByBlock.get(bId).push(u);
    });

    const notesByBlock = new Map();
    allNotes.forEach((n) => {
      const bId = n.blockId.toString();
      if (!notesByBlock.has(bId)) notesByBlock.set(bId, []);
      notesByBlock.get(bId).push(n);
    });

    const enrichedBlocks = blocks.map((b) => {
      const bIdStr = b._id.toString();
      const bUnits = unitsByBlock.get(bIdStr) || [];
      const bNotes = notesByBlock.get(bIdStr) || [];
      const isPurchased = hasFullAccess || purchasedBlockIds.has(bIdStr);

      return {
        ...b,
        unitsCount: bUnits.length,
        units: bUnits,
        blockNotes: bNotes,
        isPurchased,
      };
    });

    const responseData = {
      success: true,
      subject: {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        description: subject.description,
        semester: subject.semesterId,
        course: subject.courseId,
        college: subject.collegeId,
        isPurchased: hasFullAccess,
      },
      count: enrichedBlocks.length,
      blocks: enrichedBlocks,
    };

    setCache(cacheKey, responseData, 60 * 1000, ['block', `subject_${subjectId}`]);
    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get single block details with its units and notes
const getBlockById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Block ID' });
    }

    const block = await Block.findById(req.params.id)
      .populate('subjectId', 'name code price discountedPrice')
      .populate('semesterId', 'name price discountedPrice')
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code')
      .lean();

    if (!block) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    let isPurchased = req.user?.role === 'admin';
    const purchasedUnitIds = new Set();

    if (req.user && !isPurchased) {
      const purchases = await Purchase.find({
        userId: req.user._id,
        $or: [
          { itemType: 'semester', itemId: block.semesterId?._id },
          { itemType: 'subject', itemId: block.subjectId?._id },
          { itemType: 'block', itemId: block._id },
          { itemType: 'unit' },
        ],
      }).lean();

      purchases.forEach((p) => {
        if (p.itemType === 'semester' || p.itemType === 'subject' || p.itemType === 'block') {
          isPurchased = true;
        }
        if (p.itemType === 'unit') {
          purchasedUnitIds.add(p.itemId.toString());
        }
      });
    }

    const units = await Unit.find({ blockId: block._id, isPublished: true })
      .sort({ unitNumber: 1, order: 1 })
      .lean();

    const unitIds = units.map((u) => u._id);
    const notes = await Note.find({
      $or: [{ blockId: block._id }, { unitId: { $in: unitIds } }],
      status: 'published',
      isPublished: true,
    })
      .select('unitId blockId title type price discountedPrice previewPageCount pageCount status')
      .lean();

    const enrichedUnits = units.map((u) => {
      const uNotes = notes.filter((n) => n.unitId && n.unitId.toString() === u._id.toString());
      const unitPurchased = isPurchased || purchasedUnitIds.has(u._id.toString());
      return {
        ...u,
        isPurchased: unitPurchased,
        notes: uNotes,
        notesCount: uNotes.length,
      };
    });

    const directBlockNotes = notes.filter(
      (n) => n.blockId && n.blockId.toString() === block._id.toString() && !n.unitId
    );

    return res.status(200).json({
      success: true,
      block: {
        ...block,
        isPurchased,
      },
      units: enrichedUnits,
      directBlockNotes,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Block
const createBlock = async (req, res, next) => {
  try {
    const { subjectId, blockNumber, name, description, price, discountedPrice, order, isActive } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid Subject ID provided' });
    }

    const parsedNum = parseInt(blockNumber, 10);
    if (isNaN(parsedNum) || parsedNum <= 0) {
      return res.status(400).json({ success: false, message: 'Block number must be a positive integer (e.g. 1, 2, 3...)' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Block name is required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Parent Subject not found in database' });
    }

    // Check collision
    const existing = await Block.findOne({ subjectId: subject._id, blockNumber: parsedNum });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Block number ${parsedNum} already exists under "${subject.name}". Please choose another block number.`,
      });
    }

    const defaultPricing = await getPricingForLevel('block');
    const blkPrice = price !== undefined && price !== '' ? Math.max(0, Number(price)) : defaultPricing.price;
    const blkDiscPrice = discountedPrice !== undefined && discountedPrice !== '' ? Math.max(0, Number(discountedPrice)) : defaultPricing.discountedPrice;

    // Remember block pricing (Requirement 4)
    if (price !== undefined || discountedPrice !== undefined) {
      await updatePricingForLevel('block', blkPrice, blkDiscPrice);
    }

    const block = await Block.create({
      subjectId: subject._id,
      semesterId: subject.semesterId,
      courseId: subject.courseId,
      collegeId: subject.collegeId,
      blockNumber: parsedNum,
      name: name.trim(),
      description: description ? description.trim() : '',
      price: blkPrice,
      discountedPrice: blkDiscPrice,
      order: order !== undefined && order !== '' ? Number(order) : parsedNum,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    invalidateCache('block', `subject_${subjectId}`);

    return res.status(201).json({
      success: true,
      message: 'Block created successfully',
      block,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Block
const updateBlock = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Block ID' });
    }

    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    const { blockNumber, name, description, price, discountedPrice, order, isActive } = req.body;

    if (blockNumber !== undefined && blockNumber !== '') {
      const parsedNum = parseInt(blockNumber, 10);
      if (isNaN(parsedNum) || parsedNum <= 0) {
        return res.status(400).json({ success: false, message: 'Block number must be a positive integer.' });
      }

      if (parsedNum !== block.blockNumber) {
        const collision = await Block.findOne({ subjectId: block.subjectId, blockNumber: parsedNum });
        if (collision) {
          return res.status(400).json({
            success: false,
            message: `Block ${parsedNum} already exists under this subject.`,
          });
        }
        block.blockNumber = parsedNum;
      }
    }

    if (name !== undefined) block.name = name.trim();
    if (description !== undefined) block.description = description.trim();
    if (price !== undefined && price !== '') block.price = Math.max(0, Number(price));
    if (discountedPrice !== undefined && discountedPrice !== '') block.discountedPrice = Math.max(0, Number(discountedPrice));
    if (order !== undefined && order !== '') block.order = Number(order);
    if (isActive !== undefined) block.isActive = !!isActive;

    await block.save();

    // Remember block pricing (Requirement 4)
    if (price !== undefined || discountedPrice !== undefined) {
      await updatePricingForLevel('block', block.price, block.discountedPrice);
    }

    invalidateCache('block', `subject_${block.subjectId}`);

    return res.status(200).json({
      success: true,
      message: 'Block updated successfully',
      block,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Block
const deleteBlock = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Block ID' });
    }

    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    const notesCount = await Note.countDocuments({ blockId: block._id });
    if (notesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete block. It contains ${notesCount} note(s). Please remove them first.`,
      });
    }

    // Detach units from this block rather than deleting them
    await Unit.updateMany({ blockId: block._id }, { $set: { blockId: null } });
    await block.deleteOne();

    invalidateCache('block', 'unit', `subject_${block.subjectId}`);

    return res.status(200).json({
      success: true,
      message: 'Block deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle active status
const toggleBlockStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Block ID' });
    }

    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    block.isActive = !block.isActive;
    await block.save();

    invalidateCache('block', `subject_${block.subjectId}`);

    return res.status(200).json({
      success: true,
      message: `Block ${block.isActive ? 'activated' : 'deactivated'} successfully`,
      block,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlocksBySubject,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
  toggleBlockStatus,
};
