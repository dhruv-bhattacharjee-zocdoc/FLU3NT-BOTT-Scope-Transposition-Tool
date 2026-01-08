/**
 * Column Detection Utilities
 * Detects different types of columns in uploaded data
 */

import { findNPIMatch, addNPIColumn, getKnowledgeBaseStats, getKnowledgeBase } from './storageManager';
import firstNameHeaders from '../data/firstNameHeaders.json';
import lastNameHeaders from '../data/lastNameHeaders.json';
import genderHeaders from '../data/genderHeaders.json';
import professionalSuffixHeaders from '../data/professionalSuffixHeaders.json';
import professionalSuffixValues from '../data/professionalSuffixValues.json';
import headshotHeaders from '../data/headshotHeaders.json';
import additionalLanguagesHeaders from '../data/additionalLanguagesHeaders.json';
import additionalLanguagesValues from '../data/additionalLanguagesValues.json';

/**
 * Checks if a column name contains any of the header keywords (case-insensitive, partial match)
 * @param {string} columnName - The column name to check
 * @param {Array} headerList - Array of header keywords to match against
 * @returns {boolean} - True if the column name contains any keyword
 */
function columnNameMatches(columnName, headerList) {
  const normalizedName = columnName.toLowerCase().trim();
  
  // Check for exact match first
  if (headerList.some(header => normalizedName === header.toLowerCase())) {
    return true;
  }
  
  // Check for partial matches (contains)
  return headerList.some(header => normalizedName.includes(header.toLowerCase()) || header.toLowerCase().includes(normalizedName));
}

/**
 * Detects the NPI Number column from column data
 * 
 * NPI Number characteristics:
 * - 10 digits
 * - Only numbers (no text, no symbols)
 * - Consistently formatted across the data
 * 
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {string|null} - Name of the detected NPI column, or null if not found
 */
export function detectNPIColumn(columns) {
  if (!columns || columns.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  // First, check if any column matches previously detected NPI columns
  for (const col of columns) {
    const storedMatch = findNPIMatch(col.name);
    if (storedMatch) {
      // Found a match in knowledge base
      bestMatch = col.name;
      bestScore = storedMatch.confidence;
      console.log(`Found NPI column from knowledge base: ${col.name} (${storedMatch.matchType} match)`);
      break; // Use stored knowledge as highest priority
    }
  }

  // If no stored match, do pattern-based detection
  if (!bestMatch) {
    for (const col of columns) {
      if (!col.examples || col.examples.length === 0) continue;

      let score = 0;
      let allMatch = true;

      // Check each example value
      for (const example of col.examples) {
        const value = String(example).trim();
        
        // Check if it's exactly 10 digits
        if (/^\d{10}$/.test(value)) {
          score += 3; // Strong match
        } 
        // Check if it's mostly 10 digits (allowing some formatting)
        else if (/^[\d\s-]{10,}$/.test(value) && value.replace(/\D/g, '').length === 10) {
          score += 2; // Medium match
        }
        // Check if it's all digits but not exactly 10
        else if (/^\d+$/.test(value)) {
          score += 1; // Weak match
          allMatch = false;
        } else {
          // Contains non-numeric characters, probably not NPI
          allMatch = false;
        }
      }

      // If all examples match perfectly, it's very likely the NPI column
      if (allMatch && score >= col.examples.length * 2) {
        bestMatch = col.name;
        break; // Found a perfect match, stop searching
      }

      // Track the best score
      if (score > bestScore) {
        bestScore = score;
        bestMatch = col.name;
      }
    }
  }

  // If we detected an NPI column through pattern matching, save it to knowledge base
  if (bestMatch && bestMatch !== columns.find(c => findNPIMatch(c.name))) {
    addNPIColumn(bestMatch, bestScore);
    console.log(`Detected and saved NPI column: ${bestMatch}`);
  }

  return bestMatch;
}

/**
 * Analyzes a single column for NPI number likelihood
 * 
 * @param {string} columnName - Name of the column
 * @param {Array} examples - Example values from the column
 * @returns {number} - Confidence score (0-100)
 */
export function calculateNPIConfidence(columnName, examples) {
  if (!examples || examples.length === 0) return 0;

  let score = 0;

  // Check column name for NPI-related keywords
  const npiKeywords = /npi/i;
  if (npiKeywords.test(columnName)) {
    score += 30;
  }

  // Check examples
  for (const example of examples) {
    const value = String(example).trim();
    
    // Perfect match: exactly 10 digits
    if (/^\d{10}$/.test(value)) {
      score += 70 / examples.length;
    }
    // Close match: 10 digits with formatting
    else if (/^[\d\s-]{10,}$/.test(value)) {
      score += 50 / examples.length;
    }
    // Numeric but not 10 digits
    else if (/^\d+$/.test(value) && value.length !== 10) {
      score -= 20 / examples.length; // Penalize wrong length
    }
    // Contains text or symbols
    else {
      score -= 40 / examples.length; // Strong penalty
    }
  }

  // Cap the score between 0 and 100
  return Math.min(Math.max(score, 0), 100);
}

/**
 * Detects and ranks columns by likelihood of being the NPI column
 * 
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {Array} - Array of { name, examples, confidence, isNPIColumn } objects, sorted by confidence
 */
export function detectAndRankNPIColumns(columns) {
  if (!columns || columns.length === 0) return [];

  // Check for stored matches first
  const storedMatches = columns.filter(col => findNPIMatch(col.name));
  
  const ranked = columns.map(col => {
    const storedMatch = findNPIMatch(col.name);
    const patternConfidence = calculateNPIConfidence(col.name, col.examples);
    
    return {
      name: col.name,
      examples: col.examples || [],
      confidence: storedMatch ? Math.max(storedMatch.confidence, patternConfidence) : patternConfidence,
      isNPIColumn: false,
      matchType: storedMatch ? storedMatch.matchType : null,
    };
  });

  // Find the best match (this will also save to knowledge base if new)
  const bestMatch = detectNPIColumn(columns);
  
  // Mark the best match and sort by confidence
  ranked.forEach(col => {
    if (col.name === bestMatch) {
      col.isNPIColumn = true;
    }
  });

  // Sort: NPI column first, then by confidence (highest first)
  ranked.sort((a, b) => {
    if (a.isNPIColumn && !b.isNPIColumn) return -1;
    if (!a.isNPIColumn && b.isNPIColumn) return 1;
    return b.confidence - a.confidence;
  });

  return ranked;
}

/**
 * Validates if a value is a valid NPI number
 * 
 * @param {string|number} value - Value to validate
 * @returns {boolean} - True if valid NPI format
 */
export function isValidNPI(value) {
  const str = String(value).trim();
  
  // Remove common formatting (spaces, dashes)
  const digits = str.replace(/\D/g, '');
  
  // Must be exactly 10 digits
  return /^\d{10}$/.test(digits);
}

/**
 * Detects First Name columns based on header names
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {string|null} - Name of the detected First Name column, or null if not found
 */
export function detectFirstNameColumn(columns) {
  if (!columns || columns.length === 0) return null;

  // Get saved column names from knowledge base
  const kb = getKnowledgeBase();
  const savedFirstNames = kb.firstNameColumns || [];

  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base
    const savedMatch = savedFirstNames.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found First Name column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Then check against known header names (case-insensitive)
    if (columnNameMatches(col.name, firstNameHeaders)) {
      return col.name;
    }
  }
  
  return null;
}

/**
 * Detects Last Name columns based on header names
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {string|null} - Name of the detected Last Name column, or null if not found
 */
export function detectLastNameColumn(columns) {
  if (!columns || columns.length === 0) return null;

  // Get saved column names from knowledge base
  const kb = getKnowledgeBase();
  const savedLastNames = kb.lastNameColumns || [];

  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base
    const savedMatch = savedLastNames.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found Last Name column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Then check against known header names (case-insensitive)
    if (columnNameMatches(col.name, lastNameHeaders)) {
      return col.name;
    }
  }
  
  return null;
}

/**
 * Detects the Gender column based on header name and data values
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {string|null} - Name of the detected Gender column, or null if not found
 */
export function detectGenderColumn(columns) {
  if (!columns || columns.length === 0) return null;

  // Get saved column names from knowledge base (Smart Learning)
  const kb = getKnowledgeBase();
  const savedGenders = kb.genderColumns || [];

  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base (Smart Learning priority)
    const savedMatch = savedGenders.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found Gender column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Then check against known header names (case-insensitive)
    if (columnNameMatches(col.name, genderHeaders)) {
      return col.name;
    }
    
    // Finally check data values - look for M/F or Male/Female patterns
    if (col.examples && col.examples.length > 0) {
      let genderValues = 0;
      let totalValues = 0;
      
      for (const example of col.examples) {
        const value = String(example).trim().toLowerCase();
        totalValues++;
        
        // Check for gender values
        if (value === 'm' || value === 'f' || value === 'male' || value === 'female' || 
            value === 'm.' || value === 'f.') {
          genderValues++;
        }
      }
      
      // If 50% or more values are gender values, likely a gender column
      if (totalValues > 0 && genderValues / totalValues >= 0.5) {
        return col.name;
      }
    }
  }
  
  return null;
}

/**
 * Detects Professional Suffix columns based on header name and data values
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {string|null} - Name of the detected Professional Suffix column, or null if not found
 */
export function detectProfessionalSuffixColumn(columns) {
  if (!columns || columns.length === 0) return null;

  // Get saved column names from knowledge base (Smart Learning)
  const kb = getKnowledgeBase();
  const savedSuffixes = kb.professionalSuffixColumns || [];

  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base (Smart Learning priority)
    const savedMatch = savedSuffixes.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found Professional Suffix column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Then check against known header names (case-insensitive)
    if (columnNameMatches(col.name, professionalSuffixHeaders)) {
      return col.name;
    }
    
    // Finally check data values against known professional suffix values
    if (col.examples && col.examples.length > 0) {
      let suffixMatches = 0;
      let totalValues = 0;
      
      for (const example of col.examples) {
        const value = String(example).trim();
        if (!value) continue;
        
        totalValues++;
        
        // Split by common delimiters (comma, semicolon, space)
        const parts = value.split(/[,;\s]+/).map(p => p.trim()).filter(p => p);
        
        // Check if any part matches known suffixes (case-insensitive)
        for (const part of parts) {
          if (professionalSuffixValues.some(suffix => 
            part.toLowerCase() === suffix.toLowerCase() || 
            part.toLowerCase().replace(/[^a-z0-9]/gi, '') === suffix.toLowerCase().replace(/[^a-z0-9]/gi, '')
          )) {
            suffixMatches++;
            break; // Count each example value only once
          }
        }
      }
      
      // If 40% or more values contain professional suffixes, likely a suffix column
      if (totalValues > 0 && suffixMatches / totalValues >= 0.4) {
        return col.name;
      }
    }
  }
  
  return null;
}

/**
 * Detects headshot link columns
 * @param {Array} columns - Array of column objects with name and examples
 * @returns {string|null} - Column name if detected, null otherwise
 */
export function detectHeadshotColumn(columns) {
  if (!columns || columns.length === 0) return null;
  
  // Get saved column names from knowledge base (Smart Learning)
  const kb = getKnowledgeBase();
  const savedHeadshots = kb.headshotColumns || [];
  
  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base (Smart Learning priority)
    const savedMatch = savedHeadshots.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found Headshot column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Then check against known headshot headers
    if (columnNameMatches(col.name, headshotHeaders)) {
      return col.name;
    }
    
    // Check data patterns if examples exist
    if (col.examples && col.examples.length > 0) {
      let headshotValues = 0;
      let totalValues = 0;
      
      for (const example of col.examples) {
        const value = String(example).trim().toLowerCase();
        totalValues++;
        
        // Check for URL patterns
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('www.')) {
          headshotValues++;
        }
        // Check for image file extensions
        else if (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || 
                 value.endsWith('.gif') || value.endsWith('.bmp') || value.endsWith('.webp')) {
          headshotValues++;
        }
        // Check for common image hosting patterns
        else if (value.includes('image') || value.includes('photo') || value.includes('picture') || 
                 value.includes('headshot') || value.includes('avatar') || value.includes('portrait')) {
          headshotValues++;
        }
      }
      
      // If 50% or more values match headshot patterns, consider it a headshot column
      if (totalValues > 0 && headshotValues / totalValues >= 0.5) {
        return col.name;
      }
    }
  }
  
  return null;
}

/**
 * Detects Additional Languages Spoken columns based on header name and data values
 * @param {Array} columns - Array of column objects with name and examples
 * @returns {string|null} - Column name if detected, null otherwise
 */
export function detectAdditionalLanguagesColumn(columns) {
  if (!columns || columns.length === 0) return null;
  
  // Get saved column names from knowledge base (Smart Learning)
  const kb = getKnowledgeBase();
  const savedLanguages = kb.additionalLanguagesColumns || [];
  
  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base (Smart Learning priority)
    const savedMatch = savedLanguages.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found Additional Languages column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Then check against known additional languages headers
    if (columnNameMatches(col.name, additionalLanguagesHeaders)) {
      return col.name;
    }
    
    // Check data patterns if examples exist
    if (col.examples && col.examples.length > 0) {
      let languageValues = 0;
      let totalValues = 0;
      
      for (const example of col.examples) {
        const value = String(example).trim();
        if (!value) continue;
        
        totalValues++;
        
        // Split by common delimiters (comma, semicolon, plus sign)
        const parts = value.split(/[,;+]/).map(p => p.trim()).filter(p => p);
        
        // Check if any part matches known languages (case-insensitive)
        let hasLanguageMatch = false;
        for (const part of parts) {
          if (additionalLanguagesValues.some(language => 
            part.toLowerCase() === language.toLowerCase() || 
            part.toLowerCase().replace(/[^a-z0-9]/gi, '') === language.toLowerCase().replace(/[^a-z0-9]/gi, '')
          )) {
            hasLanguageMatch = true;
            break;
          }
        }
        
        if (hasLanguageMatch) {
          languageValues++;
        }
      }
      
      // If 40% or more values contain language names, consider it an additional languages column
      if (totalValues > 0 && languageValues / totalValues >= 0.4) {
        return col.name;
      }
    }
  }
  
  return null;
}

/**
 * US State abbreviations (all 50 states + DC)
 */
const US_STATE_ABBREVIATIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC'
];

/**
 * Detects State columns based on header name and data values
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {string|null} - Name of the detected State column, or null if not found
 */
export function detectStateColumn(columns) {
  if (!columns || columns.length === 0) return null;

  // Get saved column names from knowledge base (Smart Learning)
  const kb = getKnowledgeBase();
  const savedStates = kb.stateColumns || [];

  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base (Smart Learning priority)
    const savedMatch = savedStates.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found State column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Pattern 1: Check column header for state-related keywords
    // Check for "State", "St", "St.", "ST", "ST." or abbreviations
    const stateHeaderPatterns = [
      /^state$/i,
      /^st\.?$/i,
      /\bstate\b/i,
      /\bst\.?\b/i,
    ];
    
    let headerMatch = false;
    for (const pattern of stateHeaderPatterns) {
      if (pattern.test(col.name)) {
        headerMatch = true;
        console.log(`Found State column by header name: ${col.name}`);
        return col.name;
      }
    }
    
    // Pattern 2: If header didn't match, check data values for 2-letter state abbreviations
    if (col.examples && col.examples.length > 0) {
      let stateAbbrevMatches = 0;
      let totalValues = 0;
      
      for (const example of col.examples) {
        const value = String(example).trim().toUpperCase();
        if (!value) continue;
        
        totalValues++;
        
        // Check if value is a 2-letter state abbreviation
        if (US_STATE_ABBREVIATIONS.includes(value)) {
          stateAbbrevMatches++;
        }
      }
      
      // If 50% or more values are state abbreviations, likely a state column
      if (totalValues > 0 && stateAbbrevMatches / totalValues >= 0.5) {
        console.log(`Found State column by data pattern: ${col.name} (${stateAbbrevMatches}/${totalValues} matches)`);
        return col.name;
      }
    }
  }
  
  return null;
}

/**
 * Detects Practice Cloud ID columns based on data values
 * A column is detected as Practice Cloud ID if values start with 'pt_'
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {string|null} - Name of the detected Practice Cloud ID column, or null if not found
 */
export function detectPracticeCloudIdColumn(columns) {
  if (!columns || columns.length === 0) return null;

  // Get saved column names from knowledge base (Smart Learning)
  const kb = getKnowledgeBase();
  const savedPracticeCloudIds = kb.practiceCloudIdColumns || [];

  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base (Smart Learning priority)
    const savedMatch = savedPracticeCloudIds.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found Practice Cloud ID column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Check data values - look for values starting with 'pt_'
    if (col.examples && col.examples.length > 0) {
      let practiceCloudIdMatches = 0;
      let totalValues = 0;
      
      for (const example of col.examples) {
        const value = String(example).trim();
        if (!value) continue;
        
        totalValues++;
        
        // Check if value starts with 'pt_'
        if (value.toLowerCase().startsWith('pt_')) {
          practiceCloudIdMatches++;
        }
      }
      
      // If 50% or more values start with 'pt_', likely a Practice Cloud ID column
      if (totalValues > 0 && practiceCloudIdMatches / totalValues >= 0.5) {
        console.log(`Found Practice Cloud ID column by data pattern: ${col.name} (${practiceCloudIdMatches}/${totalValues} matches)`);
        return col.name;
      }
    }
  }
  
  return null;
}

/**
 * Detects Patients Accepted columns based on data values
 * A column is detected as Patients Accepted if values contain 'Adult', 'Both', or 'Pediatric'
 * @param {Array} columns - Array of { name, examples } objects
 * @returns {string|null} - Name of the detected Patients Accepted column, or null if not found
 */
export function detectPatientsAcceptedColumn(columns) {
  if (!columns || columns.length === 0) return null;

  // Get saved column names from knowledge base (Smart Learning)
  const kb = getKnowledgeBase();
  const savedPatientsAccepted = kb.patientsAcceptedColumns || [];

  // Valid values for Patients Accepted
  const validValues = ['adult', 'both', 'pediatric'];

  for (const col of columns) {
    const normalizedName = col.name.toLowerCase().trim();
    
    // First check saved column names from knowledge base (Smart Learning priority)
    const savedMatch = savedPatientsAccepted.find(saved => saved.name.toLowerCase() === normalizedName);
    if (savedMatch) {
      console.log(`Found Patients Accepted column from knowledge base: ${col.name}`);
      return col.name;
    }
    
    // Check data values - look for 'Adult', 'Both', or 'Pediatric' (case-insensitive)
    if (col.examples && col.examples.length > 0) {
      let patientsAcceptedMatches = 0;
      let totalValues = 0;
      
      for (const example of col.examples) {
        const value = String(example).trim().toLowerCase();
        if (!value) continue;
        
        totalValues++;
        
        // Check if value matches any of the valid values
        // Also handle comma-separated values (e.g., "Adult, Pediatric" or "Both, Adult")
        const parts = value.split(/[,;]/).map(p => p.trim()).filter(p => p);
        let hasMatch = false;
        
        for (const part of parts) {
          if (validValues.includes(part)) {
            hasMatch = true;
            break;
          }
        }
        
        if (hasMatch) {
          patientsAcceptedMatches++;
        }
      }
      
      // If 40% or more values contain valid Patients Accepted values, likely a Patients Accepted column
      if (totalValues > 0 && patientsAcceptedMatches / totalValues >= 0.4) {
        console.log(`Found Patients Accepted column by data pattern: ${col.name} (${patientsAcceptedMatches}/${totalValues} matches)`);
        return col.name;
      }
    }
  }
  
  return null;
}