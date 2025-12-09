/**
 * Date Formatting Utilities
 * Format: DD/MM/YYYY
 */

/**
 * Format date from database to DD/MM/YYYY HH:MM
 * @param {string} dateString - ISO date string from database
 * @returns {string} Formatted date string
 */
export function formatDateDisplay(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if valid date
  if (isNaN(date.getTime())) return '';
  
  // Extract UTC components to preserve exact stored values
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format date for date input (YYYY-MM-DD)
 * @param {string} dateString - ISO date string
 * @returns {string} Date in YYYY-MM-DD format
 */
export function formatDateForInput(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format time for time input (HH:MM)
 * @param {string} dateString - ISO date string
 * @returns {string} Time in HH:MM format
 */
export function formatTimeForInput(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Format date to DD/MM/YYYY only (without time)
 * @param {string} dateString - ISO date string
 * @returns {string} Date in DD/MM/YYYY format
 */
export function formatDateOnly(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
}

/**
 * Get current date in DD/MM/YYYY format
 * @returns {string} Current date
 */
export function getCurrentDateFormatted() {
  return formatDateOnly(new Date().toISOString());
}
