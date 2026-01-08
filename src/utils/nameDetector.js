/**
 * Name Detection Utilities
 * Detects name-related columns in uploaded data
 */

import { findMatch, addColumn } from './storageManager';

/**
 * Detects which columns contain names based on column header names only
 * 
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {Object} Object with detected name columns
 */
export function detectNameColumns(columns) {
  if (!columns || columns.length === 0) return { firstName: null, lastName: null, fullName: null };

  let firstNameCol = null;
  let lastNameCol = null;
  let fullNameCol = null;

  // First, check stored knowledge base
  for (const col of columns) {
    const nameMatch = findMatch(col.name, 'name');
    if (nameMatch) {
      if (nameMatch.subType === 'firstName') firstNameCol = col.name;
      else if (nameMatch.subType === 'lastName') lastNameCol = col.name;
      else if (nameMatch.subType === 'fullName') fullNameCol = col.name;
    }
  }

  // If stored matches found, use them
  if (firstNameCol || lastNameCol || fullNameCol) {
    return { firstName: firstNameCol, lastName: lastNameCol, fullName: fullNameCol };
  }

  // Otherwise, do keyword-based detection on column headers only
  for (const col of columns) {
    const colLower = col.name.toLowerCase();
    
    // Check for first name keywords
    const firstNameKeywords = ['first name', 'firstname', 'first_name', 'fname', 'given name', 'givenname', 'given_name', 'first'];
    if (firstNameKeywords.some(keyword => colLower === keyword || colLower.includes(keyword))) {
      const score = calculateNameConfidence(col, 'firstName');
      if (!firstNameCol || score > 50) {
        firstNameCol = col.name;
        if (!findMatch(col.name, 'name')) {
          addColumn(col.name, 'name', 'firstName', score);
          console.log(`Detected and saved First Name column: ${col.name}`);
        }
      }
    }

    // Check for last name keywords
    const lastNameKeywords = ['last name', 'lastname', 'last_name', 'lname', 'surname', 'family name', 'familyname', 'family_name'];
    if (lastNameKeywords.some(keyword => colLower === keyword || colLower.includes(keyword))) {
      const score = calculateNameConfidence(col, 'lastName');
      if (!lastNameCol || score > 50) {
        lastNameCol = col.name;
        if (!findMatch(col.name, 'name')) {
          addColumn(col.name, 'name', 'lastName', score);
          console.log(`Detected and saved Last Name column: ${col.name}`);
        }
      }
    }

    // Check for full name keywords (only if no separate first/last found)
    const fullNameKeywords = ['full name', 'fullname', 'full_name', 'name', 'patient name', 'provider name', 'provider name', 'practitioner name', 'clinician name', 'physician name'];
    if (!firstNameCol && !lastNameCol && fullNameKeywords.some(keyword => colLower === keyword || colLower.includes(keyword))) {
      const score = calculateNameConfidence(col, 'fullName');
      if (!fullNameCol || score > 50) {
        fullNameCol = col.name;
        if (!findMatch(col.name, 'name')) {
          addColumn(col.name, 'name', 'fullName', score);
          console.log(`Detected and saved Full Name column: ${col.name}`);
        }
      }
    }
  }

  return { 
    firstName: firstNameCol, 
    lastName: lastNameCol, 
    fullName: fullNameCol 
  };
}

/**
 * Calculates confidence score for a name column based on header name
 * 
 * @param {Object} column - Column object with name
 * @param {string} nameType - Type of name (firstName, lastName, fullName)
 * @returns {number} Confidence score (0-100)
 */
export function calculateNameConfidence(column, nameType) {
  let score = 0;
  const colLower = column.name.toLowerCase();

  // Strong keyword matching (exact match or main keyword)
  if (nameType === 'firstName') {
    if (colLower === 'first name' || colLower === 'firstname' || colLower.includes('first name')) score = 100;
    else if (colLower.includes('first') || colLower.includes('given')) score = 90;
    else if (colLower.includes('fname')) score = 85;
  } else if (nameType === 'lastName') {
    if (colLower === 'last name' || colLower === 'lastname' || colLower.includes('last name')) score = 100;
    else if (colLower.includes('last') || colLower.includes('surname') || colLower.includes('family')) score = 90;
    else if (colLower.includes('lname')) score = 85;
  } else if (nameType === 'fullName') {
    if (colLower === 'full name' || colLower === 'fullname' || colLower.includes('full name')) score = 100;
    else if (colLower.includes('full')) score = 90;
    else if (colLower === 'name' || colLower.includes('patient name') || colLower.includes('provider name')) score = 85;
  }

  return Math.min(Math.max(score, 0), 100);
}


/**
 * Detects all name columns and returns detailed information
 * 
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {Array} Array of { name, examples, nameType, nameConfidence, isNameColumn }
 */
export function detectAllNameColumns(columns) {
  if (!columns || columns.length === 0) return [];

  const { firstName, lastName, fullName } = detectNameColumns(columns);

  return columns.map(col => {
    let nameType = null;
    let nameConfidence = 0;
    let isNameColumn = false;

    // Check if this column matches any detected names
    if (col.name === firstName) {
      nameType = 'firstName';
      nameConfidence = 100;
      isNameColumn = true;
    } else if (col.name === lastName) {
      nameType = 'lastName';
      nameConfidence = 100;
      isNameColumn = true;
    } else if (col.name === fullName) {
      nameType = 'fullName';
      nameConfidence = 100;
      isNameColumn = true;
    } else {
      // Check for fuzzy matches in knowledge base
      const match = findMatch(col.name, 'name');
      if (match) {
        nameType = match.subType;
        nameConfidence = match.confidence;
        isNameColumn = true;
      }
    }

    return {
      name: col.name,
      examples: col.examples || [],
      nameType,
      nameConfidence,
      isNameColumn,
    };
  });
}


