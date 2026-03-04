// @ts-check
/* global localStorage */
import { Logger } from './Logger.js';

/**
 * Safely parses a JSON string, falling back to a default value and logging the error if parsing fails.
 * @param {string} str 
 * @param {any} fallback 
 * @returns {any}
 */
export function safeJSONParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    Logger.error('Failed to parse JSON', { error: error.message, snippet: str.substring(0, 50) });
    return fallback;
  }
}

/**
 * Safely sets an item in localStorage, catching quota exceeded errors.
 * @param {string} key 
 * @param {string} value 
 * @returns {boolean} True if successful, false otherwise.
 */
export function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    Logger.error('Failed to write to localStorage', { error: error.message, key });
    return false;
  }
}
