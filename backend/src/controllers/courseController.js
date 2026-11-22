const Course = require('../models/Course');
const Semester = require('../models/Semester');
const { getPricingForLevel } = require('../services/pricingDefaultsService');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

// Get courses by college
const getCoursesByCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const { includeInactive } = req.query;

    const cacheKey = `courses_${collegeId}_${includeInactive === 'true'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const query = { collegeId };
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    const courses = await Course.find(query).sort({ order: 1, name: 1 }).lean();

    const responseData = {
      success: true,
      count: courses.length,
      courses,
    };

    setCache(cacheKey, responseData, 60 * 1000, ['course', `college_${collegeId}`]);
    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get single course
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('collegeId', 'name code logo').lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.status(200).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

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

// Admin: Create Course with Automatic 6 Default Semesters or 3 Default Years
const createCourse = async (req, res, next) => {
  try {
    const { collegeId, name, code, description, durationYears, order, isActive, academicStructure } = req.body;

    if (!collegeId || !name) {
      return res.status(400).json({
        success: false,
        message: 'College ID and course name are required',
      });
    }

    const trimmedName = name.trim();
    const formattedCode = code ? code.trim().toUpperCase() : '';
    const structure = academicStructure === 'year' ? 'year' : 'semester';

    // Check if course already exists (handles retries safely)
    let course = await Course.findOne({ collegeId, name: trimmedName });

    if (!course) {
      course = await Course.create({
        collegeId,
        name: trimmedName,
        code: formattedCode,
        description: description ? description.trim() : '',
        durationYears: durationYears ? Number(durationYears) : (structure === 'year' ? 3 : 4),
        academicStructure: structure,
        order: order !== undefined ? Number(order) : 0,
        isActive: isActive !== undefined ? isActive : true,
      });
    }

    // Automatically create divisions based on academic structure:
    // If year-based: 1st Year, 2nd Year, 3rd Year (3 years)
    // If semester-based: Semester 1 to Semester 6 (6 semesters)
    const semPricing = await getPricingForLevel('semester');
    const isYear = course.academicStructure === 'year';
    const totalDivisions = isYear ? 3 : 6;
    const divisionNumbers = Array.from({ length: totalDivisions }, (_, i) => i + 1);

    const existingSemesters = await Semester.find({
      courseId: course._id,
      semesterNumber: { $in: divisionNumbers },
    }).lean();

    const existingNums = new Set(existingSemesters.map((s) => s.semesterNumber));
    const semestersToCreate = [];

    for (let divNum = 1; divNum <= totalDivisions; divNum++) {
      if (!existingNums.has(divNum)) {
        const divisionName = isYear ? getYearLabel(divNum) : `Semester ${divNum}`;
        semestersToCreate.push({
          courseId: course._id,
          collegeId: course.collegeId,
          semesterNumber: divNum,
          name: divisionName,
          price: semPricing.price,
          discountedPrice: semPricing.discountedPrice,
          packageDescription: `${divisionName} Package`,
          order: divNum,
          isActive: true,
        });
      }
    }

    if (semestersToCreate.length > 0) {
      await Semester.insertMany(semestersToCreate);
    }

    // Invalidate caches
    invalidateCache('course', 'semester', `college_${collegeId}`);

    return res.status(201).json({
      success: true,
      message: isYear
        ? 'Course and 3 default academic years created successfully'
        : 'Course and 6 default semesters created successfully',
      course,
      createdSemestersCount: semestersToCreate.length,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Course
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { name, code, description, durationYears, order, isActive, academicStructure } = req.body;

    if (name) course.name = name.trim();
    if (code !== undefined) course.code = code ? code.trim().toUpperCase() : '';
    if (description !== undefined) course.description = description ? description.trim() : '';
    if (durationYears !== undefined) course.durationYears = Number(durationYears);
    if (order !== undefined) course.order = Number(order);
    if (isActive !== undefined) course.isActive = isActive;
    if (academicStructure !== undefined && ['semester', 'year'].includes(academicStructure)) {
      course.academicStructure = academicStructure;
    }

    await course.save();

    invalidateCache('course', `college_${course.collegeId}`);

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Course
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if there are subjects under any semester in this course before allowing deletion
    const semesters = await Semester.find({ courseId: course._id }).select('_id');
    const semIds = semesters.map((s) => s._id);

    const Subject = require('../models/Subject');
    const subjectsCount = await Subject.countDocuments({ semesterId: { $in: semIds } });
    if (subjectsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course. Its semesters contain ${subjectsCount} subject(s). Please remove them first.`,
      });
    }

    // Remove empty default semesters if any, then delete the course
    await Semester.deleteMany({ courseId: course._id });
    await course.deleteOne();

    invalidateCache('course', 'semester', `college_${course.collegeId}`);

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle active status
const toggleCourseStatus = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.isActive = !course.isActive;
    await course.save();

    invalidateCache('course', `college_${course.collegeId}`);

    return res.status(200).json({
      success: true,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
      course,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoursesByCollege,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
};
