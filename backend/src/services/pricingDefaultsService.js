const mongoose = require('mongoose');
const Setting = require('../models/Setting');

// Standard fallback pricing defaults
const INITIAL_DEFAULTS = {
  semester: { price: 199, discountedPrice: 99 },
  subject: { price: 79, discountedPrice: 49 },
  block: { price: 39, discountedPrice: 25 },
  unit: { price: 29, discountedPrice: 19 },
};

const SETTING_KEY = 'pricing_defaults';

// In-memory cache for ultra-fast 0ms access
let inMemoryPricingCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL fallback

/**
 * Get all persistent pricing defaults across hierarchy levels
 */
const getPricingDefaults = async () => {
  const now = Date.now();
  if (inMemoryPricingCache && now - lastFetchTime < CACHE_TTL_MS) {
    return { ...inMemoryPricingCache };
  }

  // If database is not connected, fail-fast to memory defaults immediately
  if (mongoose.connection.readyState !== 1) {
    inMemoryPricingCache = inMemoryPricingCache || { ...INITIAL_DEFAULTS };
    return { ...inMemoryPricingCache };
  }

  try {
    let setting = await Setting.findOne({ key: SETTING_KEY }).lean();

    if (!setting || !setting.value) {
      // Initialize setting in DB if not present
      setting = await Setting.findOneAndUpdate(
        { key: SETTING_KEY },
        {
          key: SETTING_KEY,
          value: INITIAL_DEFAULTS,
          description: 'Persistent default pricing for Semester, Subject, Block, and Unit',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();
    }

    // Merge with INITIAL_DEFAULTS in case any level is missing
    const resolved = {
      semester: { ...INITIAL_DEFAULTS.semester, ...(setting?.value?.semester || {}) },
      subject: { ...INITIAL_DEFAULTS.subject, ...(setting?.value?.subject || {}) },
      block: { ...INITIAL_DEFAULTS.block, ...(setting?.value?.block || {}) },
      unit: { ...INITIAL_DEFAULTS.unit, ...(setting?.value?.unit || {}) },
    };

    inMemoryPricingCache = resolved;
    lastFetchTime = now;
    return resolved;
  } catch (error) {
    console.error('[pricingDefaultsService] Error fetching defaults:', error.message);
    return inMemoryPricingCache || { ...INITIAL_DEFAULTS };
  }
};

/**
 * Get pricing defaults for a specific hierarchy level ('semester' | 'subject' | 'block' | 'unit')
 */
const getPricingForLevel = async (level) => {
  const allDefaults = await getPricingDefaults();
  const normalizedLevel = (level || '').toLowerCase().trim();
  return allDefaults[normalizedLevel] || INITIAL_DEFAULTS[normalizedLevel] || { price: 99, discountedPrice: 49 };
};

/**
 * Remember and update the persistent pricing for a specific hierarchy level
 */
const updatePricingForLevel = async (level, price, discountedPrice) => {
  const normalizedLevel = (level || '').toLowerCase().trim();
  if (!['semester', 'subject', 'block', 'unit'].includes(normalizedLevel)) {
    return null;
  }

  const currentDefaults = await getPricingDefaults();

  const newRegular = price !== undefined && price !== '' && !isNaN(price)
    ? Math.max(0, Number(price))
    : currentDefaults[normalizedLevel].price;

  const newDiscounted = discountedPrice !== undefined && discountedPrice !== '' && !isNaN(discountedPrice)
    ? Math.max(0, Number(discountedPrice))
    : currentDefaults[normalizedLevel].discountedPrice;

  // Update in-memory copy
  currentDefaults[normalizedLevel] = {
    price: newRegular,
    discountedPrice: newDiscounted,
  };
  inMemoryPricingCache = { ...currentDefaults };
  lastFetchTime = Date.now();

  // If DB is connected, persist to MongoDB
  if (mongoose.connection.readyState === 1) {
    try {
      await Setting.findOneAndUpdate(
        { key: SETTING_KEY },
        {
          key: SETTING_KEY,
          value: currentDefaults,
          description: 'Persistent default pricing for Semester, Subject, Block, and Unit',
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`[pricingDefaultsService] Failed to persist pricing for level ${normalizedLevel}:`, error.message);
    }
  }

  return currentDefaults[normalizedLevel];
};

module.exports = {
  getPricingDefaults,
  getPricingForLevel,
  updatePricingForLevel,
};
