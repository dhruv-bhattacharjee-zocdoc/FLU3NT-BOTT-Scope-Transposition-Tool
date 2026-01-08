/**
 * Location Table Display Utilities
 * Contains logic for displaying and processing Location table data
 */

/**
 * Get unique count of Practice IDs from the uploaded file data
 * @param {File} file - The uploaded file
 * @param {string} practiceIdColumnName - Name of the column mapped to Practice ID
 * @returns {Promise<number>} - Number of unique Practice IDs found
 */
export async function getUniquePracticeIdCount(file, practiceIdColumnName) {
  if (!file || !practiceIdColumnName) {
    return 0;
  }

  try {
    const fileName = file.name.toLowerCase();
    let allPracticeIds = [];

    if (fileName.endsWith('.csv') || fileName.endsWith('.tsv') || fileName.endsWith('.txt')) {
      // Parse CSV/TSV file
      const Papa = (await import('papaparse')).default;
      const text = await file.text();
      
      return new Promise((resolve) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          worker: true,
          complete: (results) => {
            const practiceIds = new Set();
            results.data.forEach((row) => {
              const value = row[practiceIdColumnName];
              if (value !== undefined && value !== null && value !== '') {
                // Normalize the value (remove .0 suffix if present, convert to string)
                const normalizedValue = String(value).replace(/\.0$/, '').trim();
                if (normalizedValue) {
                  practiceIds.add(normalizedValue);
                }
              }
            });
            resolve(practiceIds.size);
          },
          error: () => resolve(0),
        });
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel file
      const XLSX = (await import('xlsx')).default;
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const firstSheetName = workbook.SheetNames[0];
      
      if (!firstSheetName) {
        return 0;
      }
      
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (jsonData.length === 0) {
        return 0;
      }
      
      // Find the column index for Practice ID
      const headers = jsonData[0].map((v) => String(v || '').trim());
      const practiceIdColumnIndex = headers.findIndex((h) => h === practiceIdColumnName);
      
      if (practiceIdColumnIndex === -1) {
        return 0;
      }
      
      // Collect all unique Practice IDs
      const practiceIds = new Set();
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const value = row[practiceIdColumnIndex];
        if (value !== undefined && value !== null && value !== '') {
          // Normalize the value (remove .0 suffix if present, convert to string)
          const normalizedValue = String(value).replace(/\.0$/, '').trim();
          if (normalizedValue) {
            practiceIds.add(normalizedValue);
          }
        }
      }
      
      return practiceIds.size;
    }
    
    return 0;
  } catch (error) {
    console.error('Error counting unique Practice IDs:', error);
    return 0;
  }
}

/**
 * Get display configuration for Location table
 * This file will be expanded to include more display logic in the future
 */
export const locationTableConfig = {
  // Future: Add more configuration options here
  // e.g., which columns to show, sorting options, etc.
};

