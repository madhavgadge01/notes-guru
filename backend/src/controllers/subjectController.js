const Subject = require('../models/Subject');
const Block = require('../models/Block');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Semester = require('../models/Semester');
const Purchase = require('../models/Purchase');
const mongoose = require('mongoose');
const { getPricingForLevel, updatePricingForLevel } = require('../services/pricingDefaultsService');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

// Get subjects by semester (optimized: batch aggregations instead of N+1 database queries)
const getSubjectsBySemester = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const { includeInactive } = req.query;

    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ success: false, message: 'Invalid Semester ID provided' });
    }

    const cacheKey = `subjects_${semesterId}_${includeInactive === 'true'}_${req.user?._id || 'anon'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const semester = await Semester.findById(semesterId)
      .populate('courseId', 'name code academicStructure')
      .populate('collegeId', 'name code')
      .lean();

    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }

    const query = { semesterId };
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    const subjects = await Subject.find(query).sort({ order: 1, name: 1 }).lean();

    if (subjects.length === 0) {
      const emptyRes = {
        success: true,
        semester: {
          id: semester._id,
          name: semester.name,
          semesterNumber: semester.semesterNumber,
          price: semester.price,
          discountedPrice: semester.discountedPrice,
          packageDescription: semester.packageDescription,
          isPurchased: req.user?.role === 'admin',
          course: semester.courseId,
          college: semester.collegeId,
        },
        count: 0,
        subjects: [],
      };
      setCache(cacheKey, emptyRes, 60 * 1000, ['subject', `semester_${semesterId}`]);
      return res.status(200).json(emptyRes);
    }

    const subjectIds = subjects.map((s) => s._id);

    // Run purchase check, unit count aggregation, and note count aggregation in parallel
    const [purchases, unitAgg, noteAgg] = await Promise.all([
      req.user && req.user.role !== 'admin'
        ? Purchase.find({
            userId: req.user._id,
            $or: [
              { itemType: 'semester', itemId: semesterId },
              { itemType: 'subject', itemId: { $in: subjectIds } },
            ],
          }).lean()
        : Promise.resolve([]),

      // Single aggregation for units count
      Unit.aggregate([
        { $match: { subjectId: { $in: subjectIds }, isPublished: true } },
        { $group: { _id: '$subjectId', count: { $sum: 1 } } },
      ]),

      // Single aggregation for notes count
      Note.aggregate([
        { $match: { subjectId: { $in: subjectIds }, status: 'published', isPublished: true } },
        {
          $group: {
            _id: '$subjectId',
            totalNotes: { $sum: 1 },
            quickNotes: { $sum: { $cond: [{ $eq: ['$type', 'quick'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    let userSemesterPurchased = req.user?.role === 'admin';
    const purchasedSubjectIds = new Set();
    purchases.forEach((p) => {
      if (p.itemType === 'semester') userSemesterPurchased = true;
      if (p.itemType === 'subject') purchasedSubjectIds.add(p.itemId.toString());
    });

    const unitCountMap = new Map();
    unitAgg.forEach((u) => unitCountMap.set(u._id.toString(), u.count));

    const noteCountMap = new Map();
    noteAgg.forEach((n) => noteCountMap.set(n._id.toString(), n));

    const enrichedSubjects = subjects.map((subj) => {
      const sIdStr = subj._id.toString();
      const nStats = noteCountMap.get(sIdStr) || { totalNotes: 0, quickNotes: 0 };
      const isPurchased =
        userSemesterPurchased || purchasedSubjectIds.has(sIdStr);

      return {
        ...subj,
        unitsCount: unitCountMap.get(sIdStr) || 0,
        notesCount: nStats.totalNotes,
        hasQuickNotes: nStats.quickNotes > 0,
        quickNotesCount: nStats.quickNotes,
        isPurchased,
      };
    });

    const responseData = {
      success: true,
      semester: {
        id: semester._id,
        name: semester.name,
        semesterNumber: semester.semesterNumber,
        price: semester.price,
        discountedPrice: semester.discountedPrice,
        packageDescription: semester.packageDescription,
        isPurchased: userSemesterPurchased,
        course: semester.courseId,
        college: semester.collegeId,
      },
      count: enrichedSubjects.length,
      subjects: enrichedSubjects,
    };

    setCache(cacheKey, responseData, 60 * 1000, ['subject', `semester_${semesterId}`]);
    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get single subject details
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('semesterId')
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code')
      .lean();

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    let isPurchased = req.user?.role === 'admin';
    const purchasedUnitIds = new Set();

    if (req.user && !isPurchased) {
      const purchases = await Purchase.find({
        userId: req.user._id,
        $or: [
          { itemType: 'semester', itemId: subject.semesterId?._id },
          { itemType: 'subject', itemId: subject._id },
          { itemType: 'unit' },
        ],
      }).lean();

      purchases.forEach((p) => {
        if (p.itemType === 'semester' || p.itemType === 'subject') isPurchased = true;
        if (p.itemType === 'unit') purchasedUnitIds.add(p.itemId.toString());
      });
    }

    const units = await Unit.find({ subjectId: subject._id, isPublished: true })
      .sort({ unitNumber: 1, order: 1 })
      .lean();

    const unitIds = units.map((u) => u._id);
    const notes = await Note.find({
      unitId: { $in: unitIds },
      status: 'published',
      isPublished: true,
    })
      .select('unitId title type price discountedPrice previewPageCount pageCount status')
      .lean();

    const notesByUnit = new Map();
    notes.forEach((n) => {
      const uId = n.unitId.toString();
      if (!notesByUnit.has(uId)) notesByUnit.set(uId, []);
      notesByUnit.get(uId).push(n);
    });

    const enrichedUnits = units.map((unit) => {
      const unitNotes = notesByUnit.get(unit._id.toString()) || [];
      const unitPurchased = isPurchased || purchasedUnitIds.has(unit._id.toString());
      return {
        ...unit,
        isPurchased: unitPurchased,
        notes: unitNotes,
        notesCount: unitNotes.length,
      };
    });

    return res.status(200).json({
      success: true,
      subject: {
        ...subject,
        isPurchased,
      },
      units: enrichedUnits,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Subject with Automatic 1 Default Block and 5 Default Units
const createSubject = async (req, res, next) => {
  try {
    const { semesterId, name, code, description, thumbnail, price, discountedPrice, order, isActive } =
      req.body;

    if (!semesterId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Semester ID and subject name are required',
      });
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Parent Semester not found' });
    }

    // Retrieve remembered pricing for subject, block, and unit (Requirement 4)
    const [subDefaultPricing, blockDefaultPricing, unitDefaultPricing] = await Promise.all([
      getPricingForLevel('subject'),
      getPricingForLevel('block'),
      getPricingForLevel('unit'),
    ]);

    const finalSubPrice = price !== undefined && price !== '' ? Math.max(0, Number(price)) : subDefaultPricing.price;
    const finalSubDiscPrice = discountedPrice !== undefined && discountedPrice !== '' ? Math.max(0, Number(discountedPrice)) : subDefaultPricing.discountedPrice;

    // Remember subject pricing for future entries (Requirement 4)
    if (price !== undefined || discountedPrice !== undefined) {
      await updatePricingForLevel('subject', finalSubPrice, finalSubDiscPrice);
    }

    const trimmedName = name.trim();

    // Check if subject with this name already exists under this semester (idempotency/retry safety)
    let subject = await Subject.findOne({ semesterId, name: trimmedName });

    if (!subject) {
      subject = await Subject.create({
        semesterId,
        courseId: semester.courseId,
        collegeId: semester.collegeId,
        name: trimmedName,
        code: code ? code.trim().toUpperCase() : '',
        description: description ? description.trim() : '',
        thumbnail: thumbnail || '',
        price: finalSubPrice,
        discountedPrice: finalSubDiscPrice,
        order: order !== undefined ? Number(order) : 0,
        isActive: isActive !== undefined ? isActive : true,
      });
    }

    // Requirement 3: Automatically create 1 default Block
    // Block Number: 1, Block Name / Title: Use the subject name as the default title
    let block = await Block.findOne({ subjectId: subject._id, blockNumber: 1 });
    if (!block) {
      block = await Block.create({
        subjectId: subject._id,
        semesterId: subject.semesterId,
        courseId: subject.courseId,
        collegeId: subject.collegeId,
        blockNumber: 1,
        name: trimmedName, // Requirement: Subject name as default title
        description: `Block 1 for ${trimmedName}`,
        price: blockDefaultPricing.price,
        discountedPrice: blockDefaultPricing.discountedPrice,
        order: 1,
        isActive: true,
      });
    }

    // Requirement 3: Automatically create 5 default Units inside that Block
    // Units 1 to 5, Unit Number: 1..5, Name/Title: Subject name, Price: default unit pricing
    const existingUnits = await Unit.find({
      subjectId: subject._id,
      unitNumber: { $in: [1, 2, 3, 4, 5] },
    }).lean();

    const existingUnitNums = new Set(existingUnits.map((u) => u.unitNumber));
    const unitsToCreate = [];

    for (let uNum = 1; uNum <= 5; uNum++) {
      if (!existingUnitNums.has(uNum)) {
        unitsToCreate.push({
          blockId: block._id,
          subjectId: subject._id,
          semesterId: subject.semesterId,
          courseId: subject.courseId,
          collegeId: subject.collegeId,
          unitNumber: uNum,
          title: trimmedName, // Requirement: Name / Title should be set to the subject name by default
          description: `Unit ${uNum} - ${trimmedName}`,
          price: unitDefaultPricing.price,
          discountedPrice: unitDefaultPricing.discountedPrice,
          order: uNum,
          isPublished: true,
        });
      }
    }

    if (unitsToCreate.length > 0) {
      await Unit.insertMany(unitsToCreate);
    }

    // Invalidate caches
    invalidateCache('subject', 'block', 'unit', `semester_${semesterId}`);

    return res.status(201).json({
      success: true,
      message: 'Subject, 1 default block, and 5 default units created successfully',
      subject,
      block,
      createdUnitsCount: unitsToCreate.length,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Subject
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const { name, code, description, thumbnail, price, discountedPrice, order, isActive } = req.body;

    if (name) subject.name = name.trim();
    if (code !== undefined) subject.code = code ? code.trim().toUpperCase() : '';
    if (description !== undefined) subject.description = description ? description.trim() : '';
    if (thumbnail !== undefined) subject.thumbnail = thumbnail;
    if (price !== undefined && price !== '') subject.price = Math.max(0, Number(price));
    if (discountedPrice !== undefined && discountedPrice !== '') subject.discountedPrice = Math.max(0, Number(discountedPrice));
    if (order !== undefined) subject.order = Number(order);
    if (isActive !== undefined) subject.isActive = isActive;

    await subject.save();

    // Remember pricing if updated
    if (price !== undefined || discountedPrice !== undefined) {
      await updatePricingForLevel('subject', subject.price, subject.discountedPrice);
    }

    invalidateCache('subject', `semester_${subject.semesterId}`);

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      subject,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Subject
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Check if there are notes under this subject before deleting
    const notesCount = await Note.countDocuments({ subjectId: subject._id });
    if (notesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subject. It contains ${notesCount} note(s). Please remove or reassign them first.`,
      });
    }

    // Clean up units and blocks belonging to this subject
    await Unit.deleteMany({ subjectId: subject._id });
    await Block.deleteMany({ subjectId: subject._id });
    await subject.deleteOne();

    invalidateCache('subject', 'block', 'unit', `semester_${subject.semesterId}`);

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle active status
const toggleSubjectStatus = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    subject.isActive = !subject.isActive;
    await subject.save();

    invalidateCache('subject', `semester_${subject.semesterId}`);

    return res.status(200).json({
      success: true,
      message: `Subject ${subject.isActive ? 'activated' : 'deactivated'} successfully`,
      subject,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjectsBySemester,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus,
};
