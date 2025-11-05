import { type StateCreator } from 'zustand';

// Simple debounced save to IndexedDB
// Save current state whenever it changes (debounced to avoid excessive writes)

// TODO: Implement persistMiddleware
// This middleware will wrap Zustand stores to automatically persist state to IndexedDB
// Currently a placeholder for future implementation

export const persistMiddleware = <T>(
  _storeName: string,
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => {
  // For now, just return the original config without persistence
  // TODO: Implement IndexedDB persistence
  return config;
};

// TODO: Add function to load state from IndexedDB
// import { db } from '../lib/db';
// export const loadFromDb = async (sessionId: string) => {
//   return await db.wizardSessions.get(sessionId);
// };

// TODO: Add function to clear persisted data
// export const clearPersistedData = async (sessionId: string) => {
//   return await db.wizardSessions.delete(sessionId);
// };

// TODO: Implement debounced save helper
// let saveTimeout: NodeJS.Timeout;
// const debouncedSave = (saveFunc: () => void, delay = 500) => {
//   clearTimeout(saveTimeout);
//   saveTimeout = setTimeout(saveFunc, delay);
// };
