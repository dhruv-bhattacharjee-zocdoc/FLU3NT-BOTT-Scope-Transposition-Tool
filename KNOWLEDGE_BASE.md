# Knowledge Base System

## Overview

The application now stores detected NPI column names to improve future detection accuracy. It uses browser localStorage to persist this knowledge base.

## How It Works

### 1. Automatic Storage

When you upload files and the app detects an NPI column:
- The column name is automatically saved to the knowledge base
- Detection confidence is stored
- Detection count is tracked
- Timestamps are recorded

### 2. Improved Detection

On future uploads:
1. **First check**: Exact match with stored column names
2. **Second check**: Fuzzy/partial match with stored names
3. **Fallback**: Pattern-based detection (10-digit numbers)

**Priority**: Stored matches take precedence over pattern detection

### 3. Fuzzy Matching

The system supports multiple matching types:

#### Exact Match
- Column name exactly matches a stored NPI column name
- Highest confidence (100% if previously detected)
- Example: "NPI Number" → stored as "NPI Number"

#### Partial Match
- One column name contains the other
- Medium confidence (50% of stored confidence)
- Example: "Provider NPI" → matches "NPI Number"

#### Word Match
- Common words between column names
- Lower confidence (30% × word count)
- Example: "Provider NPI Identifier" → matches "NPI Number"

## Storage Structure

The knowledge base is stored in `localStorage` with this structure:

```json
{
  "npiColumns": [
    {
      "name": "NPI Number",
      "confidence": 90,
      "detectedAt": "2024-01-15T10:30:00.000Z",
      "lastDetectedAt": "2024-01-16T14:20:00.000Z",
      "detectionCount": 5
    }
  ],
  "metadata": {
    "lastUpdated": "2024-01-16T14:20:00.000Z",
    "totalDetections": 5
  }
}
```

## Export Functionality

### Export Knowledge Base

Click the **"Export"** button in the header to download your knowledge base as a JSON file.

Features:
- File name: `npi_knowledge_base_YYYY-MM-DD.json`
- Contains all stored NPI column names
- Can be shared with others
- Can be imported (future feature)

### When to Export

- Before clearing browser data
- To share detection knowledge with team
- To backup your detection history
- To use in different environments

## Display in UI

The UI shows knowledge base statistics:

- **"X NPI column(s) stored"** - Shows count of stored columns
- **Export button** - Appears when knowledge base has data
- Automatically saves new detections

## Match Type Display

When a column is detected using stored knowledge:
- Console logs show: `Found NPI column from knowledge base: ColumnName (exact/fuzzy match)`
- Higher confidence scores for stored matches
- Faster detection (no pattern analysis needed)

## Benefits

1. **Smarter Detection**: Learns from previous uploads
2. **Faster Processing**: Stored matches detected instantly
3. **Improved Accuracy**: Historical confidence scores
4. **Consistent Results**: Same column names always detected
5. **Team Knowledge**: Export/share detection patterns

## Console Logging

Check browser console to see:
- `Detected and saved NPI column: ColumnName` - New detection saved
- `Found NPI column from knowledge base: ColumnName (exact match)` - Using stored match
- `Found NPI column from knowledge base: ColumnName (fuzzy match)` - Partial match

## Manual Management

### View Stored Data

Open browser DevTools → Application → Local Storage → Look for key: `pdo_column_knowledge_base`

### Clear Knowledge Base

Use the browser console:
```javascript
localStorage.removeItem('pdo_column_knowledge_base');
```

Or contact me to add a UI button for this feature.

## Future Enhancements

- Import knowledge base from JSON
- Manual column detection override
- Clear/reset knowledge base button
- Detection history timeline
- Multiple knowledge bases (by project)
- Confidence threshold settings

## API Reference

### Functions (from `src/utils/storageManager.js`)

#### `getKnowledgeBase()`
Returns the complete knowledge base object

#### `saveKnowledgeBase(knowledgeBase)`
Saves the knowledge base to localStorage

#### `addNPIColumn(columnName, confidence)`
Adds a new NPI column or updates existing

#### `findNPIMatch(columnName)`
Finds match for a column name (exact/fuzzy)
Returns: `{ matchedColumn, confidence, matchType, detectionCount }` or `null`

#### `exportKnowledgeBase()`
Exports knowledge base as JSON string

#### `importKnowledgeBase(jsonString)`
Imports knowledge base from JSON string

#### `clearKnowledgeBase()`
Clears all stored knowledge

#### `getKnowledgeBaseStats()`
Returns statistics object:
```javascript
{
  totalNPIColumns: 3,
  totalDetections: 15,
  lastUpdated: "2024-01-16T...",
  mostDetectedColumns: [...]
}
```

## Technical Details

### Browser Compatibility

Uses localStorage which is supported by all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

### Storage Limits

- Browser limit: ~5-10MB
- Typical knowledge base: <1KB
- Can store thousands of column patterns

### Persistence

- Survives browser restarts
- Survives page reloads
- Lost when browser data is cleared
- **Recommendation**: Export before clearing data

## Example Usage

```javascript
import { addNPIColumn, findNPIMatch, exportKnowledgeBase } from './utils/storageManager';

// Save a detection
addNPIColumn("Provider NPI", 95);

// Check if a column matches
const match = findNPIMatch("NPI Number");
if (match) {
  console.log(`Found ${match.matchType} match with ${match.confidence}% confidence`);
}

// Export for backup
const json = exportKnowledgeBase();
console.log(json);
```

