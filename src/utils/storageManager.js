/**
 * Storage Manager for Column Detection
 * Stores and retrieves detected column names for better matching in future uploads
 */

const STORAGE_KEY = 'pdo_column_knowledge_base';

/**
 * Get the knowledge base from storage
 * @returns {Object} Knowledge base object
 */
export function getKnowledgeBase() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading knowledge base:', error);
  }
  
  // Return default structure if nothing stored
  return {
    npiColumns: [],
    nameColumns: [],
    metadata: {
      lastUpdated: null,
      totalDetections: 0,
    }
  };
}

/**
 * Save the knowledge base to storage
 * @param {Object} knowledgeBase - Knowledge base object to save
 */
export function saveKnowledgeBase(knowledgeBase) {
  try {
    knowledgeBase.metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(knowledgeBase));
  } catch (error) {
    console.error('Error saving knowledge base:', error);
  }
}

/**
 * Add a detected NPI column to the knowledge base
 * @param {string} columnName - The detected column name
 * @param {number} confidence - Confidence score (0-100)
 */
export function addFirstNameToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.firstNameColumns) kb.firstNameColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.firstNameColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.firstNameColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addLastNameToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.lastNameColumns) kb.lastNameColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.lastNameColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.lastNameColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addGenderToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.genderColumns) kb.genderColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.genderColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.genderColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addProfessionalSuffixToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.professionalSuffixColumns) kb.professionalSuffixColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.professionalSuffixColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.professionalSuffixColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addHeadshotToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.headshotColumns) kb.headshotColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.headshotColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.headshotColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addAdditionalLanguagesToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.additionalLanguagesColumns) kb.additionalLanguagesColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.additionalLanguagesColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.additionalLanguagesColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addStateToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.stateColumns) kb.stateColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.stateColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.stateColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addCityToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.cityColumns) kb.cityColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.cityColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.cityColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addZipToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.zipColumns) kb.zipColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.zipColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.zipColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addAddressLine1ToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.addressLine1Columns) kb.addressLine1Columns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.addressLine1Columns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.addressLine1Columns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addAddressLine2ToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.addressLine2Columns) kb.addressLine2Columns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.addressLine2Columns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.addressLine2Columns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addPracticeIdToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.practiceIdColumns) kb.practiceIdColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.practiceIdColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.practiceIdColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addPracticeCloudIdToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.practiceCloudIdColumns) kb.practiceCloudIdColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.practiceCloudIdColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.practiceCloudIdColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addLocationIdToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.locationIdColumns) kb.locationIdColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.locationIdColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.locationIdColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addPracticeNameToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.practiceNameColumns) kb.practiceNameColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.practiceNameColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.practiceNameColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addLocationNameToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.locationNameColumns) kb.locationNameColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.locationNameColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.locationNameColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addLocationTypeRawToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.locationTypeRawColumns) kb.locationTypeRawColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.locationTypeRawColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.locationTypeRawColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addPFSToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.pfsColumns) kb.pfsColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.pfsColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.pfsColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addPatientsAcceptedToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.patientsAcceptedColumns) kb.patientsAcceptedColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.patientsAcceptedColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.patientsAcceptedColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addSpecialtyToKnowledge(columnName) {
  const kb = getKnowledgeBase();
  
  if (!kb.specialtyColumns) kb.specialtyColumns = [];
  
  // Check if already exists (case-insensitive)
  const exists = kb.specialtyColumns.some(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.specialtyColumns.push({
      name: columnName,
      addedAt: new Date().toISOString(),
      confidence: 100,
    });
    saveKnowledgeBase(kb);
    return true;
  }
  return false;
}

export function addNPIColumn(columnName, confidence = 100) {
  const kb = getKnowledgeBase();
  
  // Check if it already exists
  const exists = kb.npiColumns.find(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (!exists) {
    kb.npiColumns.push({
      name: columnName,
      confidence: confidence,
      detectedAt: new Date().toISOString(),
      detectionCount: 1,
    });
    kb.metadata.totalDetections += 1;
  } else {
    // Update existing: increment count, update confidence if higher
    exists.detectionCount += 1;
    if (confidence > exists.confidence) {
      exists.confidence = confidence;
    }
    exists.lastDetectedAt = new Date().toISOString();
  }
  
  saveKnowledgeBase(kb);
}

/**
 * Check if a column name matches any known NPI column names
 * Uses exact and fuzzy matching
 * @param {string} columnName - Column name to check
 * @returns {Object|null} Match information or null
 */
export function findNPIMatch(columnName) {
  const kb = getKnowledgeBase();
  
  if (kb.npiColumns.length === 0) return null;
  
  const lowerColumnName = columnName.toLowerCase();
  
  // Check for exact match first
  const exactMatch = kb.npiColumns.find(col => 
    col.name.toLowerCase() === lowerColumnName
  );
  
  if (exactMatch) {
    return {
      matchedColumn: exactMatch.name,
      confidence: exactMatch.confidence,
      matchType: 'exact',
      detectionCount: exactMatch.detectionCount,
    };
  }
  
  // Check for partial/fuzzy match
  let bestMatch = null;
  let bestScore = 0;
  
  for (const storedCol of kb.npiColumns) {
    const lowerStored = storedCol.name.toLowerCase();
    
    // Check if one contains the other
    if (lowerColumnName.includes(lowerStored) || lowerStored.includes(lowerColumnName)) {
      const score = storedCol.confidence * 0.5; // Partial match gets lower confidence
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          matchedColumn: storedCol.name,
          confidence: Math.min(score, storedCol.confidence),
          matchType: 'fuzzy',
          detectionCount: storedCol.detectionCount,
        };
      }
    }
    
    // Check for word matches
    const columnWords = lowerColumnName.split(/[\s_-]+/);
    const storedWords = lowerStored.split(/[\s_-]+/);
    const commonWords = columnWords.filter(word => storedWords.includes(word));
    
    if (commonWords.length > 0 && commonWords.length >= Math.min(columnWords.length, storedWords.length) * 0.5) {
      const score = storedCol.confidence * 0.3 * commonWords.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          matchedColumn: storedCol.name,
          confidence: Math.min(score, storedCol.confidence),
          matchType: 'fuzzy',
          detectionCount: storedCol.detectionCount,
        };
      }
    }
  }
  
  // Only return fuzzy match if confidence is high enough
  if (bestMatch && bestMatch.confidence >= 20) {
    return bestMatch;
  }
  
  return null;
}

/**
 * Export knowledge base to JSON file
 * @returns {string} JSON string
 */
export function exportKnowledgeBase() {
  const kb = getKnowledgeBase();
  return JSON.stringify(kb, null, 2);
}

/**
 * Import knowledge base from JSON
 * @param {string} jsonString - JSON string to import
 */
export function importKnowledgeBase(jsonString) {
  try {
    const kb = JSON.parse(jsonString);
    if (kb.npiColumns && kb.metadata) {
      saveKnowledgeBase(kb);
      return true;
    }
  } catch (error) {
    console.error('Error importing knowledge base:', error);
  }
  return false;
}

/**
 * Clear the knowledge base
 */
export function clearKnowledgeBase() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing knowledge base:', error);
    return false;
  }
}

/**
 * Remove a specific column from the knowledge base
 * @param {string} columnName - Column name to remove
 * @param {string} columnType - Type of column ('npi' or 'name')
 */
export function removeColumn(columnName, columnType) {
  const kb = getKnowledgeBase();
  const targetArray = columnType === 'npi' ? kb.npiColumns : (kb.nameColumns || []);
  
  const index = targetArray.findIndex(col => col.name.toLowerCase() === columnName.toLowerCase());
  
  if (index !== -1) {
    targetArray.splice(index, 1);
    
    if (columnType === 'npi') {
      kb.npiColumns = targetArray;
    } else {
      kb.nameColumns = targetArray;
    }
    
    saveKnowledgeBase(kb);
    return true;
  }
  
  return false;
}

/**
 * Get all stored columns with their details
 * @returns {Object} All stored columns grouped by type
 */
export function getAllStoredColumns() {
  const kb = getKnowledgeBase();
  return {
    npiColumns: kb.npiColumns || [],
    nameColumns: kb.nameColumns || [],
    firstNameColumns: kb.firstNameColumns || [],
    practiceCloudIdColumns: kb.practiceCloudIdColumns || [],
    lastNameColumns: kb.lastNameColumns || [],
    genderColumns: kb.genderColumns || [],
    professionalSuffixColumns: kb.professionalSuffixColumns || [],
    headshotColumns: kb.headshotColumns || [],
    additionalLanguagesColumns: kb.additionalLanguagesColumns || [],
    stateColumns: kb.stateColumns || [],
    cityColumns: kb.cityColumns || [],
    zipColumns: kb.zipColumns || [],
    addressLine1Columns: kb.addressLine1Columns || [],
    addressLine2Columns: kb.addressLine2Columns || [],
    practiceIdColumns: kb.practiceIdColumns || [],
    practiceNameColumns: kb.practiceNameColumns || [],
    locationIdColumns: kb.locationIdColumns || [],
    locationNameColumns: kb.locationNameColumns || [],
    locationTypeRawColumns: kb.locationTypeRawColumns || [],
    pfsColumns: kb.pfsColumns || [],
    patientsAcceptedColumns: kb.patientsAcceptedColumns || [],
    specialtyColumns: kb.specialtyColumns || [],
  };
}

/**
 * Get all column mappings
 * @returns {Array} Array of { columnName, detectedAs } objects
 * detectedAs is always returned as an array
 */
export function getMappings() {
  const kb = getKnowledgeBase();
  const mappings = kb.mappings || [];
  
  // Ensure detectedAs is always an array for backwards compatibility
  return mappings.map(m => ({
    ...m,
    detectedAs: Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs]
  }));
}

/**
 * Save a column mapping
 * @param {string} columnName - Column name
 * @param {string} detectedAs - What it's detected as ('npi', 'firstName', 'lastName')
 */
export function saveMapping(columnName, detectedAs) {
  const kb = getKnowledgeBase();
  
  if (!kb.mappings) kb.mappings = [];
  
  // Validation: NPI can only be assigned to 1 column
  if (detectedAs === 'npi') {
    const existingNPIMappings = kb.mappings.filter(m => {
      const mapping = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
      return mapping.includes('npi') && m.columnName !== columnName;
    });
    
    if (existingNPIMappings.length > 0) {
      console.warn(`Cannot assign NPI to ${columnName}. Already assigned to: ${existingNPIMappings[0].columnName}`);
      return false;
    }
  }
  
  // Check if mapping already exists
  const existingIndex = kb.mappings.findIndex(m => m.columnName === columnName);
  
  if (existingIndex !== -1) {
    // Update existing mapping
    const mapping = kb.mappings[existingIndex];
    
    // If detectedAs is already in the array, remove it (toggle off)
    if (Array.isArray(mapping.detectedAs)) {
      if (mapping.detectedAs.includes(detectedAs)) {
        mapping.detectedAs = mapping.detectedAs.filter(d => d !== detectedAs);
        // If array becomes empty, remove the mapping
        if (mapping.detectedAs.length === 0) {
          kb.mappings.splice(existingIndex, 1);
        }
      } else {
        // Validate before adding
        if (detectedAs === 'npi') {
          // Check if another column has NPI
          const otherNPIMappings = kb.mappings.filter(m => {
            const arr = Array.isArray(m.detectedAs) ? m.detectedAs : [m.detectedAs];
            return arr.includes('npi') && m.columnName !== columnName;
          });
          if (otherNPIMappings.length > 0) {
            console.warn(`Cannot add NPI to ${columnName}. Already assigned to: ${otherNPIMappings[0].columnName}`);
            return false;
          }
        }
        // Add to array
        mapping.detectedAs.push(detectedAs);
      }
    } else {
      // Convert to array and add
      mapping.detectedAs = [mapping.detectedAs, detectedAs];
    }
    
    mapping.updatedAt = new Date().toISOString();
  } else {
    // Add new mapping
    kb.mappings.push({
      columnName,
      detectedAs: [detectedAs],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  saveKnowledgeBase(kb);
  return true;
}

/**
 * Remove a mapping
 * @param {string} columnName - Column name to remove
 */
export function removeMapping(columnName) {
  const kb = getKnowledgeBase();
  
  if (kb.mappings) {
    kb.mappings = kb.mappings.filter(m => m.columnName !== columnName);
    saveKnowledgeBase(kb);
  }
}

/**
 * Get statistics about the knowledge base
 * @returns {Object} Statistics
 */
export function getKnowledgeBaseStats() {
  const kb = getKnowledgeBase();
  return {
    totalNPIColumns: (kb.npiColumns || []).length,
    totalNameColumns: (kb.nameColumns || []).length,
    totalDetections: kb.metadata.totalDetections,
    lastUpdated: kb.metadata.lastUpdated,
    mostDetectedColumns: [...(kb.npiColumns || [])]
      .sort((a, b) => b.detectionCount - a.detectionCount)
      .slice(0, 5),
  };
}

/**
 * Find a match for any column type
 * @param {string} columnName - Column name to check
 * @param {string} columnType - Type of column (e.g., 'npi', 'name')
 * @returns {Object|null} Match information or null
 */
export function findMatch(columnName, columnType) {
  const kb = getKnowledgeBase();
  const columnArray = columnType === 'npi' ? (kb.npiColumns || []) : (kb.nameColumns || []);
  
  if (columnArray.length === 0) return null;
  
  const lowerColumnName = columnName.toLowerCase();
  
  // Check for exact match first
  const exactMatch = columnArray.find(col => 
    col.name.toLowerCase() === lowerColumnName
  );
  
  if (exactMatch) {
    return {
      matchedColumn: exactMatch.name,
      confidence: exactMatch.confidence,
      matchType: 'exact',
      detectionCount: exactMatch.detectionCount,
      subType: exactMatch.subType,
    };
  }
  
  // Check for partial/fuzzy match
  let bestMatch = null;
  let bestScore = 0;
  
  for (const storedCol of columnArray) {
    const lowerStored = storedCol.name.toLowerCase();
    
    // Check if one contains the other
    if (lowerColumnName.includes(lowerStored) || lowerStored.includes(lowerColumnName)) {
      const score = storedCol.confidence * 0.5;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          matchedColumn: storedCol.name,
          confidence: Math.min(score, storedCol.confidence),
          matchType: 'fuzzy',
          detectionCount: storedCol.detectionCount,
          subType: storedCol.subType,
        };
      }
    }
    
    // Check for word matches
    const columnWords = lowerColumnName.split(/[\s_-]+/);
    const storedWords = lowerStored.split(/[\s_-]+/);
    const commonWords = columnWords.filter(word => storedWords.includes(word));
    
    if (commonWords.length > 0 && commonWords.length >= Math.min(columnWords.length, storedWords.length) * 0.5) {
      const score = storedCol.confidence * 0.3 * commonWords.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          matchedColumn: storedCol.name,
          confidence: Math.min(score, storedCol.confidence),
          matchType: 'fuzzy',
          detectionCount: storedCol.detectionCount,
          subType: storedCol.subType,
        };
      }
    }
  }
  
  // Only return fuzzy match if confidence is high enough
  if (bestMatch && bestMatch.confidence >= 20) {
    return bestMatch;
  }
  
  return null;
}

/**
 * Add a detected column to the knowledge base
 * @param {string} columnName - The detected column name
 * @param {string} columnType - Type of column (e.g., 'npi', 'name')
 * @param {string} subType - Sub-type (e.g., 'firstName', 'lastName', 'fullName' for name type)
 * @param {number} confidence - Confidence score (0-100)
 */
export function addColumn(columnName, columnType, subType, confidence = 100) {
  const kb = getKnowledgeBase();
  
  // Initialize arrays if they don't exist
  if (!kb.nameColumns) kb.nameColumns = [];
  
  const targetArray = columnType === 'npi' ? kb.npiColumns : kb.nameColumns;
  
  // Check if it already exists
  const exists = targetArray.find(col => 
    col.name.toLowerCase() === columnName.toLowerCase() && 
    (!subType || col.subType === subType)
  );
  
  if (!exists) {
    const newColumn = {
      name: columnName,
      columnType,
      confidence,
      detectedAt: new Date().toISOString(),
      detectionCount: 1,
    };
    
    if (subType) {
      newColumn.subType = subType;
    }
    
    targetArray.push(newColumn);
    kb.metadata.totalDetections += 1;
  } else {
    // Update existing: increment count, update confidence if higher
    exists.detectionCount += 1;
    if (confidence > exists.confidence) {
      exists.confidence = confidence;
    }
    if (subType && !exists.subType) {
      exists.subType = subType;
    }
    exists.lastDetectedAt = new Date().toISOString();
  }
  
  saveKnowledgeBase(kb);
}

