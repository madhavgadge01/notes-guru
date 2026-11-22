/**
 * Lightweight, high-performance in-memory cache with tag-based invalidation.
 * Eliminates redundant database round-trips for read-heavy hierarchy routes.
 */

const cacheStore = new Map();
const DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Get cached item
 */
const getCache = (key) => {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return item.value;
};

/**
 * Set item in cache with optional tags for selective group invalidation
 */
const setCache = (key, value, ttlMs = DEFAULT_TTL_MS, tags = []) => {
  cacheStore.set(key, {
    value,
    expiry: Date.now() + ttlMs,
    tags: Array.isArray(tags) ? tags : [tags],
  });
};

/**
 * Invalidate cache by key or by tag
 */
const invalidateCache = (...tagsOrKeys) => {
  if (tagsOrKeys.length === 0) {
    cacheStore.clear();
    return;
  }

  const targets = new Set(tagsOrKeys);
  for (const [key, item] of cacheStore.entries()) {
    if (targets.has(key)) {
      cacheStore.delete(key);
      continue;
    }
    const hasMatchingTag = item.tags && item.tags.some((t) => targets.has(t));
    if (hasMatchingTag) {
      cacheStore.delete(key);
    }
  }
};

module.exports = {
  getCache,
  setCache,
  invalidateCache,
};
