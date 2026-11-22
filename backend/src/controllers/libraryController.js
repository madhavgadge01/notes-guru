const Purchase = require('../models/Purchase');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const ReadingProgress = require('../models/ReadingProgress');

// Get all library purchases grouped and structured
const getMyLibrary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all user purchases
    const purchases = await Purchase.find({ userId }).sort({ purchasedAt: -1 });

    const semesterPurchases = purchases.filter((p) => p.itemType === 'semester');
    const subjectPurchases = purchases.filter((p) => p.itemType === 'subject');
    const unitPurchases = purchases.filter((p) => p.itemType === 'unit');
    const notePurchases = purchases.filter((p) => p.itemType === 'note');

    // Populate semester packages
    const populatedSemesters = await Semester.find({
      _id: { $in: semesterPurchases.map((p) => p.itemId) },
    })
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code');

    // Populate subjects
    const populatedSubjects = await Subject.find({
      _id: { $in: subjectPurchases.map((p) => p.itemId) },
    })
      .populate('semesterId', 'name semesterNumber')
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code');

    // Populate units
    const populatedUnits = await Unit.find({
      _id: { $in: unitPurchases.map((p) => p.itemId) },
    })
      .populate('subjectId', 'name code')
      .populate('semesterId', 'name')
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code');

    // Populate notes
    const populatedNotes = await Note.find({
      _id: { $in: notePurchases.map((p) => p.itemId) },
    })
      .select('-pages.contentHtml')
      .populate('unitId', 'title unitNumber')
      .populate('subjectId', 'name code')
      .populate('semesterId', 'name')
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code');

    // Also get reading progress for all notes to display progress bars
    const progressDocs = await ReadingProgress.find({ userId });
    const progressMap = {};
    progressDocs.forEach((pr) => {
      progressMap[pr.noteId.toString()] = {
        lastReadPage: pr.lastReadPage,
        totalPages: pr.totalPages,
        lastReadAt: pr.lastReadAt,
      };
    });

    return res.status(200).json({
      success: true,
      library: {
        semesters: populatedSemesters,
        subjects: populatedSubjects,
        units: populatedUnits,
        notes: populatedNotes.map((n) => ({
          ...n.toObject(),
          progress: progressMap[n._id.toString()] || null,
        })),
        totalPurchases: purchases.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Continue Reading notes
const getContinueReading = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const progressList = await ReadingProgress.find({ userId })
      .sort({ lastReadAt: -1 })
      .limit(5)
      .populate({
        path: 'noteId',
        select: 'title type pageCount description unitId subjectId semesterId',
        populate: [
          { path: 'unitId', select: 'title unitNumber' },
          { path: 'subjectId', select: 'name code' },
          { path: 'semesterId', select: 'name' },
        ],
      });

    const activeList = progressList.filter((p) => p.noteId);

    return res.status(200).json({
      success: true,
      continueReading: activeList.map((item) => ({
        noteId: item.noteId._id,
        title: item.noteId.title,
        type: item.noteId.type,
        unitTitle: item.noteId.unitId?.title,
        unitNumber: item.noteId.unitId?.unitNumber,
        subjectName: item.noteId.subjectId?.name,
        semesterName: item.noteId.semesterId?.name,
        lastReadPage: item.lastReadPage,
        totalPages: item.totalPages || item.noteId.pageCount || 1,
        percent: Math.min(
          100,
          Math.round((item.lastReadPage / (item.totalPages || item.noteId.pageCount || 1)) * 100)
        ),
        lastReadAt: item.lastReadAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Update reading progress
const updateReadingProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { noteId, pageNumber, totalPages } = req.body;

    if (!noteId || !pageNumber) {
      return res.status(400).json({
        success: false,
        message: 'Note ID and current page number are required',
      });
    }

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, noteId },
      {
        userId,
        noteId,
        lastReadPage: Number(pageNumber),
        totalPages: totalPages ? Number(totalPages) : 1,
        $addToSet: { completedPages: Number(pageNumber) },
        lastReadAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyLibrary,
  getContinueReading,
  updateReadingProgress,
};
