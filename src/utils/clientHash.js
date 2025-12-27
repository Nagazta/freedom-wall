// Generate and manage anonymous client hash for reactions
// Ensures one reaction per confession per browser

const CLIENT_HASH_KEY = 'freedom-wall-client-hash';

/**
 * Generate a random client hash
 * Uses crypto.randomUUID() for security
 */
const generateClientHash = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get or create client hash
 * Stored in localStorage to persist across sessions
 */
export const getClientHash = () => {
  try {
    let hash = localStorage.getItem(CLIENT_HASH_KEY);

    if (!hash) {
      hash = generateClientHash();
      localStorage.setItem(CLIENT_HASH_KEY, hash);
    }

    return hash;
  } catch (error) {
    console.error('Error accessing localStorage for client hash:', error);
    // Fallback to session-only hash
    return generateClientHash();
  }
};

/**
 * Clear client hash (for testing purposes)
 */
export const clearClientHash = () => {
  try {
    localStorage.removeItem(CLIENT_HASH_KEY);
  } catch (error) {
    console.error('Error clearing client hash:', error);
  }
};
