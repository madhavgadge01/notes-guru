const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Block = require('../models/Block');
const mongoose = require('mongoose');
const { getPricingForLevel, updatePricingForLevel } = require('../services/pricingDefaultsService');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

// Get units by subject or block
const getUnitsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { includeUnpublished, blockId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid Subject ID' });
    }

    const cacheKey = `units_${subjectId}_${blockId || 'all'}_${includeUnpublished === 'true'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const query = { subjectId };
    if (blockId && mongoose.Types.ObjectId.isValid(blockId)) {
      query.blockId = blockId;
    }
    if (includeUnpublished !== 'true') {
      query.isPublished = true;
    }

    const units = await Unit.find(query)
      .populate('blockId', 'name blockNumber')
      .sort({ unitNumber: 1, order: 1 })
      .lean();

    const responseData = {
      success: true,
      count: units.length,
      units,
    };

    setCache(cacheKey, responseData, 60 * 1000, ['unit', `subject_${subjectId}`]);
    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get units specifically by Block
const getUnitsByBlock = async (req, res, next) => {
  try {
    const { blockId } = req.params;
    const { includeUnpublished } = req.query;

    if (!mongoose.Types.ObjectId.isValid(blockId)) {
      return res.status(400).json({ success: false, message: 'Invalid Block ID' });
    }

    const cacheKey = `units_block_${blockId}_${includeUnpublished === 'true'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const query = { blockId };
    if (includeUnpublished !== 'true') {
      query.isPublished = true;
    }

    const units = await Unit.find(query).sort({ unitNumber: 1, order: 1 }).lean();

    const responseData = {
      success: true,
      count: units.length,
      units,
    };

    setCache(cacheKey, responseData, 60 * 1000, ['unit', `block_${blockId}`]);
    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get single unit
const getUnitById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Unit ID' });
    }

    const unit = await Unit.findById(req.params.id)
      .populate('blockId', 'name blockNumber')
      .populate('subjectId', 'name code')
      .populate('semesterId', 'name')
      .populate('courseId', 'name')
      .populate('collegeId', 'name')
      .lean();

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    return res.status(200).json({ success: true, unit });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Unit
const createUnit = async (req, res, next) => {
  try {
    const { subjectId, blockId, unitNumber, title, description, price, discountedPrice, order, isPublished } =
      req.body;

    const parsedNum = parseInt(unitNumber, 10);
    if (isNaN(parsedNum) || parsedNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Unit number must be a positive integer (e.g. 1, 2, 3...)',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Unit title is required',
      });
    }

    let parentSubject = null;
    let parentBlock = null;

    if (blockId && mongoose.Types.ObjectId.isValid(blockId)) {
      parentBlock = await Block.findById(blockId);
      if (parentBlock) {
        parentSubject = await Subject.findById(parentBlock.subjectId);
      }
    }

    if (!parentSubject && subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      parentSubject = await Subject.findById(subjectId);
    }

    if (!parentSubject) {
      return res.status(404).json({ success: false, message: 'Parent Subject or Block not found' });
    }

    // Check unit collision within block or subject
    const collisionQuery = parentBlock
      ? { blockId: parentBlock._id, unitNumber: parsedNum }
      : { subjectId: parentSubject._id, unitNumber: parsedNum };

    const existing = await Unit.findOne(collisionQuery);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Unit ${parsedNum} already exists in this ${parentBlock ? 'block' : 'subject'}.`,
      });
    }

    const defaultPricing = await getPricingForLevel('unit');
    const uPrice = price !== undefined && price !== '' ? Math.max(0, Number(price)) : defaultPricing.price;
    const uDiscPrice = discountedPrice !== undefined && discountedPrice !== '' ? Math.max(0, Number(discountedPrice)) : defaultPricing.discountedPrice;

    // Remember unit pricing (Requirement 4)
    if (price !== undefined || discountedPrice !== undefined) {
      await updatePricingForLevel('unit', uPrice, uDiscPrice);
    }

    const unit = await Unit.create({
      blockId: parentBlock ? parentBlock._id : null,
      subjectId: parentSubject._id,
      semesterId: parentSubject.semesterId,
      courseId: parentSubject.courseId,
      collegeId: parentSubject.collegeId,
      unitNumber: parsedNum,
      title: title.trim(),
      description: description ? description.trim() : '',
      price: uPrice,
      discountedPrice: uDiscPrice,
      order: order !== undefined && order !== '' ? Number(order) : parsedNum,
      isPublished: isPublished !== undefined ? !!isPublished : true,
    });

    invalidateCache('unit', `subject_${parentSubject._id}`);

    return res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      unit,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Unit (supports Option 1: Apply to this unit, and Option 2: Apply to all units in this subject)
const updateUnit = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Unit ID' });
    }

    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    const {
      blockId,
      unitNumber,
      title,
      description,
      price,
      discountedPrice,
      order,
      isPublished,
      applyToAllInSubject,
    } = req.body;

    if (unitNumber !== undefined && unitNumber !== '') {
      const parsedNum = parseInt(unitNumber, 10);
      if (isNaN(parsedNum) || parsedNum <= 0) {
        return res.status(400).json({ success: false, message: 'Unit number must be a positive integer.' });
      }

      if (parsedNum !== unit.unitNumber) {
        const query = unit.blockId
          ? { blockId: unit.blockId, unitNumber: parsedNum }
          : { subjectId: unit.subjectId, unitNumber: parsedNum };

        const collision = await Unit.findOne(query);
        if (collision) {
          return res.status(400).json({
            success: false,
            message: `Unit ${parsedNum} already exists in this container.`,
          });
        }
        unit.unitNumber = parsedNum;
      }
    }

    if (blockId !== undefined) {
      unit.blockId = blockId && mongoose.Types.ObjectId.isValid(blockId) ? blockId : null;
    }
    if (title !== undefined) unit.title = title.trim();
    if (description !== undefined) unit.description = description.trim();
    if (price !== undefined && price !== '') unit.price = Math.max(0, Number(price));
    if (discountedPrice !== undefined && discountedPrice !== '') unit.discountedPrice = Math.max(0, Number(discountedPrice));
    if (order !== undefined && order !== '') unit.order = Number(order);
    if (isPublished !== undefined) unit.isPublished = !!isPublished;

    await unit.save();

    let updatedAllCount = 0;
    // Requirement 5: Option 2 - Apply to all units in this subject
    if (applyToAllInSubject && unit.subjectId) {
      const result = await Unit.updateMany(
        { subjectId: unit.subjectId },
        {
          $set: {
            price: unit.price,
            discountedPrice: unit.discountedPrice,
          },
        }
      );
      updatedAllCount = result.modifiedCount;
    }

    // Remember unit pricing (Requirement 4)
    if (price !== undefined || discountedPrice !== undefined) {
      await updatePricingForLevel('unit', unit.price, unit.discountedPrice);
    }

    invalidateCache('unit', `subject_${unit.subjectId}`);

    return res.status(200).json({
      success: true,
      message: applyToAllInSubject
        ? `Pricing updated and applied to all units in this subject (${updatedAllCount} updated)`
        : 'Unit updated successfully',
      unit,
      appliedToAllInSubject: !!applyToAllInSubject,
      updatedCount: updatedAllCount,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Bulk update unit pricing for all units in a subject (Requirement 5)
const updateSubjectUnitsPricing = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { price, discountedPrice } = req.body;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid Subject ID' });
    }

    if (price === undefined && discountedPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Price or discounted price required' });
    }

    const updateFields = {};
    if (price !== undefined && price !== '') updateFields.price = Math.max(0, Number(price));
    if (discountedPrice !== undefined && discountedPrice !== '') updateFields.discountedPrice = Math.max(0, Number(discountedPrice));

    const result = await Unit.updateMany({ subjectId }, { $set: updateFields });

    // Remember unit pricing
    if (updateFields.price !== undefined || updateFields.discountedPrice !== undefined) {
      await updatePricingForLevel('unit', updateFields.price, updateFields.discountedPrice);
    }

    invalidateCache('unit', `subject_${subjectId}`);

    return res.status(200).json({
      success: true,
      message: `Updated pricing for ${result.modifiedCount} unit(s) in this subject`,
      modifiedCount: result.modifiedCount,
      pricing: updateFields,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Unit
const deleteUnit = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Unit ID' });
    }

    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    const notesCount = await Note.countDocuments({ unitId: unit._id });
    if (notesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete unit. It contains ${notesCount} note(s). Please delete or move them first.`,
      });
    }

    await unit.deleteOne();

    invalidateCache('unit', `subject_${unit.subjectId}`);

    return res.status(200).json({
      success: true,
      message: 'Unit deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle publish
const toggleUnitPublish = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Unit ID' });
    }

    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    unit.isPublished = !unit.isPublished;
    await unit.save();

    invalidateCache('unit', `subject_${unit.subjectId}`);

    return res.status(200).json({
      success: true,
      message: `Unit ${unit.isPublished ? 'published' : 'unpublished'} successfully`,
      unit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUnitsBySubject,
  getUnitsByBlock,
  getUnitById,
  createUnit,
  updateUnit,
  updateSubjectUnitsPricing,
  deleteUnit,
  toggleUnitPublish,
};
