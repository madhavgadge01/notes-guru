const sanitizeHtml = require('sanitize-html');
const Note = require('../models/Note');
const Unit = require('../models/Unit');
const Block = require('../models/Block');
const { checkNoteEntitlement } = require('../services/entitlementService');

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'span', 'div', 'hr', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'mark', 'kbd', 'sub', 'sup',
    'section', 'article', 'header', 'footer', 'aside', 'figure', 'figcaption', 'details', 'summary'
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['style', 'class', 'id', 'data-*'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    a: ['href', 'name', 'target', 'rel'],
  },
};

// Get notes by unit (summary for listing)
const getNotesByUnit = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { includeDrafts } = req.query;

    const query = { unitId };
    if (includeDrafts !== 'true' || req.user?.role !== 'admin') {
      query.status = 'published';
      query.isPublished = true;
    }

    const notes = await Note.find(query)
      .select('-pages.contentHtml') // Don't send page contents in summary list
      .sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// Get notes by block (summary for listing, including direct block notes)
const getNotesByBlock = async (req, res, next) => {
  try {
    const { blockId } = req.params;
    const { includeDrafts } = req.query;

    const query = { blockId };
    if (includeDrafts !== 'true' || req.user?.role !== 'admin') {
      query.status = 'published';
      query.isPublished = true;
    }

    const notes = await Note.find(query)
      .select('-pages.contentHtml')
      .populate('unitId', 'title unitNumber')
      .sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// Get single note by ID with SECURE AUTHORIZATION and PREVIEW FILTERING
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('unitId', 'title unitNumber price discountedPrice')
      .populate('blockId', 'name blockNumber price discountedPrice')
      .populate('subjectId', 'name code price discountedPrice')
      .populate('semesterId', 'name price discountedPrice packageDescription')
      .populate('courseId', 'name code')
      .populate('collegeId', 'name code');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Check if user is entitled to view all pages
    const { isEntitled, source } = await checkNoteEntitlement(req.user, note);

    const previewLimit = Math.max(0, note.previewPageCount !== undefined ? note.previewPageCount : 2);

    // Filter pages securely:
    // If entitled, return full HTML content.
    // If NOT entitled: only return HTML for pages <= previewLimit; strip HTML for locked pages!
    const securePages = note.pages.map((page) => {
      const isPageFree = page.pageNumber <= previewLimit;

      if (isEntitled || isPageFree) {
        return {
          _id: page._id,
          pageNumber: page.pageNumber,
          title: page.title,
          contentHtml: page.contentHtml,
          isLocked: false,
          isFreePreview: isPageFree,
        };
      } else {
        // CONTENT PROTECTION RULE: Locked page HTML is NEVER sent across the wire!
        return {
          _id: page._id,
          pageNumber: page.pageNumber,
          title: page.title || `Locked Page ${page.pageNumber}`,
          contentHtml: null, // Stripped!
          isLocked: true,
          isFreePreview: false,
        };
      }
    });

    // Generate dynamic watermark if user is logged in
    let watermark = null;
    if (req.user) {
      const maskedEmail = req.user.getMaskedEmail ? req.user.getMaskedEmail() : req.user.email;
      const userRef = req.user._id.toString().substring(18);
      watermark = {
        text: `GenZNotes • Protected Material • User: ${maskedEmail} [${userRef}]`,
        subText: 'Exclusively licensed to registered student • Unauthorized sharing prohibited',
        identifier: maskedEmail,
      };
    }

    // Build purchase pricing dynamically based on hierarchy
    const purchasePricing = {
      note: {
        id: note._id,
        price: note.discountedPrice || note.price,
        originalPrice: note.price,
        title: note.title,
      },
    };

    if (note.unitId) {
      purchasePricing.unit = {
        id: note.unitId._id,
        price: note.unitId.discountedPrice || note.unitId.price,
        originalPrice: note.unitId.price,
        title: `Unit ${note.unitId.unitNumber}: ${note.unitId.title}`,
      };
    }

    if (note.blockId) {
      purchasePricing.block = {
        id: note.blockId._id,
        price: note.blockId.discountedPrice || note.blockId.price,
        originalPrice: note.blockId.price,
        title: `Block ${note.blockId.blockNumber}: ${note.blockId.name}`,
      };
    }

    if (note.subjectId) {
      purchasePricing.subject = {
        id: note.subjectId._id,
        price: note.subjectId.discountedPrice || note.subjectId.price,
        originalPrice: note.subjectId.price,
        title: note.subjectId.name,
      };
    }

    if (note.semesterId) {
      purchasePricing.semester = {
        id: note.semesterId._id,
        price: note.semesterId.discountedPrice || note.semesterId.price,
        originalPrice: note.semesterId.price,
        title: note.semesterId.name,
      };
    }

    return res.status(200).json({
      success: true,
      note: {
        _id: note._id,
        title: note.title,
        type: note.type,
        description: note.description,
        price: note.price,
        discountedPrice: note.discountedPrice,
        previewPageCount: previewLimit,
        totalPages: note.pages.length,
        status: note.status,
        isPublished: note.isPublished,
        unit: note.unitId,
        block: note.blockId,
        subject: note.subjectId,
        semester: note.semesterId,
        course: note.courseId,
        college: note.collegeId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
      pages: securePages,
      entitlement: {
        isEntitled,
        source, // 'semester', 'subject', 'block', 'unit', 'note', or 'admin'
        previewPageCount: previewLimit,
        lockedPagesCount: isEntitled ? 0 : Math.max(0, note.pages.length - previewLimit),
      },
      watermark,
      purchasePricing,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Note
const createNote = async (req, res, next) => {
  try {
    const {
      unitId,
      blockId,
      title,
      type,
      description,
      price,
      discountedPrice,
      previewPageCount,
      pages,
      status,
      order,
    } = req.body;

    if ((!unitId && !blockId) || !title) {
      return res.status(400).json({
        success: false,
        message: 'Unit ID or Block ID and note title are required',
      });
    }

    let unit = null;
    let block = null;
    let subjectId, semesterId, courseId, collegeId;
    let resolvedBlockId = blockId || null;
    let resolvedUnitId = unitId || null;

    if (unitId) {
      unit = await Unit.findById(unitId);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'Parent Unit not found' });
      }
      subjectId = unit.subjectId;
      semesterId = unit.semesterId;
      courseId = unit.courseId;
      collegeId = unit.collegeId;
      if (blockId) {
        block = await Block.findById(blockId);
        if (block && unit.blockId && unit.blockId.toString() !== block._id.toString()) {
          return res.status(400).json({ success: false, message: 'Selected Unit does not belong to the selected Block' });
        }
        if (block && !unit.blockId) {
          unit.blockId = block._id;
          await unit.save();
        }
        resolvedBlockId = block ? block._id : unit.blockId;
      } else {
        resolvedBlockId = unit.blockId || null;
      }
    } else if (blockId) {
      block = await Block.findById(blockId);
      if (!block) {
        return res.status(404).json({ success: false, message: 'Parent Block not found' });
      }
      subjectId = block.subjectId;
      semesterId = block.semesterId;
      courseId = block.courseId;
      collegeId = block.collegeId;
    }

    // Sanitize HTML in pages
    const sanitizedPages = Array.isArray(pages)
      ? pages.map((p, index) => ({
          pageNumber: index + 1,
          title: p.title || `Page ${index + 1}`,
          contentHtml: sanitizeHtml(p.contentHtml || '<p>Page content...</p>', sanitizeOptions),
          isLockedPreview: p.isLockedPreview || false,
        }))
      : [
          {
            pageNumber: 1,
            title: 'Introduction',
            contentHtml: '<p>Welcome to this note.</p>',
            isLockedPreview: false,
          },
        ];

    const noteType = type === 'quick' ? 'quick' : 'normal';
    const defaultPreviewCount = noteType === 'quick' ? 0 : 2;

    const note = await Note.create({
      unitId: resolvedUnitId,
      blockId: resolvedBlockId,
      subjectId,
      semesterId,
      courseId,
      collegeId,
      title,
      type: noteType,
      description: description || '',
      price: price !== undefined ? Number(price) : (noteType === 'quick' ? 15 : 25),
      discountedPrice: discountedPrice !== undefined ? Number(discountedPrice) : (noteType === 'quick' ? 9 : 19),
      previewPageCount: previewPageCount !== undefined ? Number(previewPageCount) : defaultPreviewCount,
      pages: sanitizedPages,
      pageCount: sanitizedPages.length,
      status: status || 'published',
      isPublished: status !== 'draft',
      order: order !== undefined ? Number(order) : 0,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Note
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const {
      title,
      type,
      description,
      price,
      discountedPrice,
      previewPageCount,
      pages,
      status,
      isPublished,
      order,
      blockId,
      unitId,
    } = req.body;

    if (title) note.title = title;
    if (type) note.type = type;
    if (description !== undefined) note.description = description;
    if (price !== undefined) note.price = Number(price);
    if (discountedPrice !== undefined) note.discountedPrice = Number(discountedPrice);
    if (previewPageCount !== undefined) note.previewPageCount = Number(previewPageCount);
    if (unitId !== undefined && unitId) {
      const u = await Unit.findById(unitId);
      if (u) {
        note.unitId = u._id;
        note.subjectId = u.subjectId;
        note.semesterId = u.semesterId;
        note.courseId = u.courseId;
        note.collegeId = u.collegeId;
        if (blockId) {
          note.blockId = blockId;
        } else if (u.blockId) {
          note.blockId = u.blockId;
        }
      }
    } else if (blockId !== undefined && blockId) {
      const b = await Block.findById(blockId);
      if (b) {
        note.blockId = b._id;
        note.subjectId = b.subjectId;
        note.semesterId = b.semesterId;
        note.courseId = b.courseId;
        note.collegeId = b.collegeId;
        if (unitId === null) {
          note.unitId = null;
        }
      }
    }
    if (status) {
      note.status = status;
      note.isPublished = status === 'published';
    }
    if (isPublished !== undefined) note.isPublished = isPublished;
    if (order !== undefined) note.order = Number(order);

    if (pages && Array.isArray(pages)) {
      note.pages = pages.map((p, index) => ({
        pageNumber: index + 1,
        title: p.title || `Page ${index + 1}`,
        contentHtml: sanitizeHtml(p.contentHtml || '', sanitizeOptions),
        isLockedPreview: p.isLockedPreview || false,
      }));
      note.pageCount = note.pages.length;
    }

    note.updatedBy = req.user._id;
    await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Note
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await note.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotesByUnit,
  getNotesByBlock,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
