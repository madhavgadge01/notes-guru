const College = require('../models/College');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Note = require('../models/Note');

// Global search API
const searchGlobal = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        results: { colleges: [], courses: [], subjects: [], notes: [] },
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [colleges, courses, subjects, notes] = await Promise.all([
      College.find({ isActive: true, $or: [{ name: regex }, { code: regex }] }).limit(5),
      Course.find({ isActive: true, $or: [{ name: regex }, { code: regex }] })
        .populate('collegeId', 'name code')
        .limit(5),
      Subject.find({ isActive: true, $or: [{ name: regex }, { code: regex }, { description: regex }] })
        .populate('courseId', 'name')
        .populate('collegeId', 'name')
        .populate('semesterId', 'name')
        .limit(8),
      Note.find({
        status: 'published',
        isPublished: true,
        $or: [{ title: regex }, { description: regex }],
      })
        .select('-pages.contentHtml')
        .populate('subjectId', 'name code')
        .populate('unitId', 'title unitNumber')
        .limit(8),
    ]);

    return res.status(200).json({
      success: true,
      query: q,
      results: {
        colleges,
        courses,
        subjects,
        notes,
        total: colleges.length + courses.length + subjects.length + notes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchGlobal,
};
