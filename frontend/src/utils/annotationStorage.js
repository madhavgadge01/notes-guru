/**
 * GenZNotes Client-Side Temporary Annotation Storage (IndexedDB + In-Memory Fallback)
 * 
 * Strict Privacy & Zero-Cloud:
 * - Stored purely inside the user's browser (IndexedDB).
 * - Keyed by noteId so annotations never bleed across different notes.
 * - Handles automatic expiration timestamps (7 days for highlights, 30 min for idle drawings).
 * - Safe fallback to in-memory Map if IndexedDB is full, blocked, or unavailable.
 * - Zero network requests, zero backend database overhead.
 */

const DB_NAME = 'NotesGuruAnnotationsDB';
const DB_VERSION = 1;
const STORE_NAME = 'note_annotations';

// In-memory fallback if IndexedDB is blocked (e.g. strict private browsing)
const memoryStore = new Map();

/**
 * Open or upgrade the client-side IndexedDB database
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'noteId' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
      request.onblocked = () => reject(new Error('IndexedDB blocked'));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Load saved annotations for a specific note with expiration checks
 * @param {string} noteId
 * @returns {Promise<{ highlights: Array, drawings: Object }>}
 */
export async function getStoredAnnotations(noteId) {
  if (!noteId) return { highlights: [], drawings: {} };

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(noteId);

        req.onsuccess = () => {
          const record = req.result;
          if (!record) {
            return resolve(memoryStore.get(noteId) || { highlights: [], drawings: {} });
          }

          const now = Date.now();
          const HIGHLIGHT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
          const DRAWING_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes for drawings

          // Highlights: retain for 7 days
          let validHighlights = {};
          if (record.highlights) {
            if (!record.updatedAt || (now - record.updatedAt < HIGHLIGHT_EXPIRY_MS)) {
              validHighlights = record.highlights;
            }
          }

          // Drawings: keep only if updated recently
          let validDrawings = {};
          if (record.drawings) {
            if (record.updatedAt && (now - record.updatedAt < DRAWING_EXPIRY_MS)) {
              validDrawings = record.drawings;
            }
          }

          resolve({
            highlights: validHighlights,
            drawings: validDrawings,
          });
        };

        req.onerror = () => {
          resolve(memoryStore.get(noteId) || { highlights: [], drawings: {} });
        };
      } catch {
        resolve(memoryStore.get(noteId) || { highlights: [], drawings: {} });
      }
    });
  } catch {
    return memoryStore.get(noteId) || { highlights: [], drawings: {} };
  }
}

/**
 * Persist current annotations locally for a specific note
 * @param {string} noteId
 * @param {{ highlights?: Array, drawings?: Object }} data
 */
export async function saveStoredAnnotations(noteId, { highlights = [], drawings = {} } = {}) {
  if (!noteId) return;

  const payload = {
    noteId,
    highlights,
    drawings,
    updatedAt: Date.now(),
  };

  // Always keep in memory fallback
  memoryStore.set(noteId, payload);

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(payload);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    // Fail silently, memoryStore already populated
  }
}

/**
 * Remove all stored annotations for a specific note
 * @param {string} noteId
 */
export async function clearStoredAnnotations(noteId) {
  if (!noteId) return;

  memoryStore.delete(noteId);

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(noteId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    // Fail silently
  }
}
