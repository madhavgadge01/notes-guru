const College = require('../models/College');
const Course = require('../models/Course');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

// Get all active colleges (Student & Admin)
const getColleges = async (req, res, next) => {
  try {
    const { includeInactive, search } = req.query;

    const cacheKey = `colleges_${includeInactive === 'true'}_${search || 'all'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const query = {};

    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const colleges = await College.find(query).sort({ order: 1, name: 1 }).lean();

    const responseData = {
      success: true,
      count: colleges.length,
      colleges,
    };

    setCache(cacheKey, responseData, 60 * 1000, ['college']);
    return res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get single college
const getCollegeById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id).lean();
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }
    return res.status(200).json({ success: true, college });
  } catch (error) {
    next(error);
  }
};

// Admin: Create College
const createCollege = async (req, res, next) => {
  try {
    const { name, code, description, logo, location, order, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'College name is required' });
    }

    const college = await College.create({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : '',
      description: description ? description.trim() : '',
      logo: logo || '',
      location: location ? location.trim() : '',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    invalidateCache('college');

    return res.status(201).json({
      success: true,
      message: 'College created successfully',
      college,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update College
const updateCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const { name, code, description, logo, location, order, isActive } = req.body;

    if (name) college.name = name.trim();
    if (code !== undefined) college.code = code ? code.trim().toUpperCase() : '';
    if (description !== undefined) college.description = description ? description.trim() : '';
    if (logo !== undefined) college.logo = logo;
    if (location !== undefined) college.location = location ? location.trim() : '';
    if (order !== undefined) college.order = Number(order);
    if (isActive !== undefined) college.isActive = isActive;

    await college.save();

    invalidateCache('college');

    return res.status(200).json({
      success: true,
      message: 'College updated successfully',
      college,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete College (with safety check for dependent courses)
const deleteCollege = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Safety check: Prevent accidental deletion if courses exist
    const coursesCount = await Course.countDocuments({ collegeId: college._id });
    if (coursesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete college. It contains ${coursesCount} active course(s). Please remove or reassign them first, or deactivate the college instead.`,
      });
    }

    await college.deleteOne();

    invalidateCache('college');

    return res.status(200).json({
      success: true,
      message: 'College deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle active status
const toggleCollegeStatus = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }
    college.isActive = !college.isActive;
    await college.save();

    invalidateCache('college');

    return res.status(200).json({
      success: true,
      message: `College ${college.isActive ? 'activated' : 'deactivated'} successfully`,
      college,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  toggleCollegeStatus,
};
