const Purchase = require('../models/Purchase');

/**
 * Check whether a user is entitled to view the full content of a note.
 * Checks inheritance: Semester -> Subject -> Unit -> Note
 */
const checkNoteEntitlement = async (user, note) => {
  if (!user) {
    return { isEntitled: false, source: null };
  }

  // Admins have full access to everything
  if (user.role === 'admin') {
    return { isEntitled: true, source: 'admin' };
  }

  // Check all potential purchase levels (Semester -> Subject -> Block -> Unit -> Note)
  const orConditions = [
    { itemType: 'note', itemId: note._id },
    { itemType: 'subject', itemId: note.subjectId },
    { itemType: 'semester', itemId: note.semesterId },
  ];

  if (note.unitId) {
    orConditions.push({ itemType: 'unit', itemId: note.unitId });
  }

  if (note.blockId) {
    orConditions.push({ itemType: 'block', itemId: note.blockId });
  }

  const purchaseQuery = {
    userId: user._id,
    $or: orConditions,
  };

  const purchase = await Purchase.findOne(purchaseQuery);

  if (purchase) {
    return { isEntitled: true, source: purchase.itemType };
  }

  return { isEntitled: false, source: null };
};

/**
 * Check whether a user has purchased a specific entity (semester, subject, or unit)
 */
const checkEntityEntitlement = async (userId, itemType, itemId) => {
  if (!userId) return false;

  const purchase = await Purchase.findOne({
    userId,
    itemType,
    itemId,
  });

  return !!purchase;
};

/**
 * Get all active entitlements for a student to quickly badge items in the UI
 */
const getUserEntitlementIds = async (userId) => {
  if (!userId) {
    return {
      semesters: [],
      subjects: [],
      blocks: [],
      units: [],
      notes: [],
    };
  }

  const purchases = await Purchase.find({ userId });

  const result = {
    semesters: [],
    subjects: [],
    blocks: [],
    units: [],
    notes: [],
  };

  purchases.forEach((p) => {
    const idStr = p.itemId.toString();
    if (p.itemType === 'semester') result.semesters.push(idStr);
    else if (p.itemType === 'subject') result.subjects.push(idStr);
    else if (p.itemType === 'block') result.blocks.push(idStr);
    else if (p.itemType === 'unit') result.units.push(idStr);
    else if (p.itemType === 'note') result.notes.push(idStr);
  });

  return result;
};

module.exports = {
  checkNoteEntitlement,
  checkEntityEntitlement,
  getUserEntitlementIds,
};
