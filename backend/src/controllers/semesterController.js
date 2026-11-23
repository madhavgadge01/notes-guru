const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const mongoose = require('mongoose');
const { getPricingForLevel, updatePricingForLevel } = require('../services/pricingDefaultsService');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

// Helper to format year labels: 1st Year, 2nd Year, 3rd Year, 4th Year, etc.
const getYearLabel = (num) => {
  const n = parseInt(num, 10);
  const j = n % 10;
  const k = n % 100;
  let suffix = 'th';
  if (j === 1 && k !== 11) suffix = 'st';
  else if (j === 2 && k !== 12) suffix = 'nd';
  else if (j === 3 && k !== 13) suffix = 'rd';
  return `${n}${suffix} Year`;
};

// Get semesters by course
const getSemestersByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { includeInactive } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid Course ID provided' });
    }

    const cacheKey = `semesters_${courseId}_${includeInactive === 'true'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const course = await Course.findById(courseId).select('name code academicStructure collegeId').lean();

    const query = { courseId };
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    const semesters = await Semester.find(query).sort({ semesterNumber: 1, order: 1 }).lean();

    const responseData = {
      success: true,
      count: semesters.length,
      academicStructure: course?.academicStructure || 'year',
      course,
      semesters,
    };

    setCache(cacheKey, responseData, 60 * 1000, ['semester', `course_${courseId}`]);
    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get single semester
const getSemesterById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Semester ID' });
    }

    const semester = await Semester.findById(req.params.id)
      .populate('courseId', 'name code academicStructure')
      .populate('collegeId', 'name code')
      .lean();

    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }

    return res.status(200).json({ success: true, semester });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Semester
const createSemester = async (req, res, next) => {
  try {
    const { courseId, semesterNumber, name, price, discountedPrice, packageDescription, order, isActive } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a parent Course for this semester.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Course identifier provided.',
      });
    }

    const parsedSemNum = parseInt(semesterNumber, 10);
    if (isNaN(parsedSemNum) || parsedSemNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Semester number must be a positive number (e.g. 1, 2, 3...).',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Parent Course not found in database.' });
    }

    const isYear = course.academicStructure === 'year';
    const termLabel = isYear ? 'Year' : 'Semester';

    // Check if this semester number already exists for this course
    const existing = await Semester.findOne({ courseId: course._id, semesterNumber: parsedSemNum });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `${termLabel} ${parsedSemNum} already exists under "${course.name}". Please choose a different ${termLabel.toLowerCase()} number.`,
      });
    }

    // Get remembered default pricing for semester if not provided
    const defaultPricing = await getPricingForLevel('semester');
    const semPrice = price !== undefined && price !== '' ? Math.max(0, Number(price)) : defaultPricing.price;
    const semDiscPrice = discountedPrice !== undefined && discountedPrice !== '' ? Math.max(0, Number(discountedPrice)) : defaultPricing.discountedPrice;

    // Remember pricing for future semester creations (Requirement 4)
    if (price !== undefined || discountedPrice !== undefined) {
      await updatePricingForLevel('semester', semPrice, semDiscPrice);
    }

    const defaultName = isYear ? getYearLabel(parsedSemNum) : `Semester ${parsedSemNum}`;
    const defaultPackageDesc = isYear ? `${getYearLabel(parsedSemNum)} Package` : `Semester ${parsedSemNum} Package`;

    const semester = await Semester.create({
      courseId: course._id,
      collegeId: course.collegeId,
      semesterNumber: parsedSemNum,
      name: name?.trim() ? name.trim() : defaultName,
      price: semPrice,
      discountedPrice: semDiscPrice,
      packageDescription: packageDescription ? packageDescription.trim() : defaultPackageDesc,
      order: order !== undefined && order !== '' ? Number(order) : parsedSemNum,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    invalidateCache('semester', `course_${courseId}`);

    return res.status(201).json({
      success: true,
      message: 'Semester created successfully',
      semester,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Semester
const updateSemester = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Semester ID' });
    }

    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }

    const { name, semesterNumber, price, discountedPrice, packageDescription, order, isActive } = req.body;

    if (semesterNumber !== undefined && semesterNumber !== '') {
      const parsedNum = parseInt(semesterNumber, 10);
      if (isNaN(parsedNum) || parsedNum <= 0) {
        return res.status(400).json({ success: false, message: 'Semester number must be a positive integer.' });
      }

      // Check collision if changed
      if (parsedNum !== semester.semesterNumber) {
        const collision = await Semester.findOne({ courseId: semester.courseId, semesterNumber: parsedNum });
        if (collision) {
          return res.status(400).json({
            success: false,
            message: `Semester ${parsedNum} already exists under this course.`,
          });
        }
        semester.semesterNumber = parsedNum;
      }
    }

    if (name !== undefined) semester.name = name.trim();
    if (price !== undefined && price !== '') semester.price = Math.max(0, Number(price));
    if (discountedPrice !== undefined && discountedPrice !== '') semester.discountedPrice = Math.max(0, Number(discountedPrice));
    if (packageDescription !== undefined) semester.packageDescription = packageDescription.trim();
    if (order !== undefined && order !== '') semester.order = Number(order);
    if (isActive !== undefined) semester.isActive = !!isActive;

    await semester.save();

    // Remember pricing if updated
    if (price !== undefined || discountedPrice !== undefined) {
      await updatePricingForLevel('semester', semester.price, semester.discountedPrice);
    }

    invalidateCache('semester', `course_${semester.courseId}`);

    return res.status(200).json({
      success: true,
      message: 'Semester updated successfully',
      semester,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Semester
const deleteSemester = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Semester ID' });
    }

    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }

    const subjectsCount = await Subject.countDocuments({ semesterId: semester._id });
    if (subjectsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete semester. It contains ${subjectsCount} active subject(s). Please remove them first or deactivate the semester.`,
      });
    }

    await semester.deleteOne();

    invalidateCache('semester', `course_${semester.courseId}`);

    return res.status(200).json({
      success: true,
      message: 'Semester deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle active status
const toggleSemesterStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Semester ID' });
    }

    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }

    semester.isActive = !semester.isActive;
    await semester.save();

    invalidateCache('semester', `course_${semester.courseId}`);

    return res.status(200).json({
      success: true,
      message: `Semester ${semester.isActive ? 'activated' : 'deactivated'} successfully`,
      semester,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSemestersByCourse,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
  toggleSemesterStatus,
};
