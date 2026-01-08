# Name Detection Feature

## Overview

The application now automatically detects name-related columns in uploaded files. It can identify First Name, Last Name, and Full Name columns, and stores this information in the knowledge base for faster future detection.

## Types of Name Detection

### 1. First Name Detection
- **Keywords**: "first name", "fname", "firstname", "given name", "givenname"
- **Pattern**: Usually single word (e.g., "John", "Mary")
- **Visual**: Green-600 badge, labeled "First"

### 2. Last Name Detection
- **Keywords**: "last name", "lname", "lastname", "surname", "family name", "familyname"
- **Pattern**: 1-2 words (e.g., "Smith", "van der Berg")
- **Visual**: Green-700 badge, labeled "Last"

### 3. Full Name Detection
- **Keywords**: "full name", "fullname", "name", "patient name", "provider name", "practitioner name"
- **Pattern**: 2-4 words (e.g., "John Smith", "Mary Jane Watson")
- **Visual**: Green-500 badge, labeled "Name"

## How It Works

### Detection Process

1. **Knowledge Base Check** (First Priority)
   - Checks stored column names from previous uploads
   - Uses exact/fuzzy matching
   - Returns immediately if match found

2. **Keyword Matching**
   - Searches column names for name-related keywords
   - Matches against pattern library
   - Calculates confidence scores

3. **Pattern Analysis**
   - Analyzes example values
   - Validates name-like patterns (letters, spaces, hyphens, apostrophes)
   - Checks word count for First/Last/Full name

4. **Knowledge Base Storage**
   - Saves detected column names automatically
   - Tracks detection count
   - Stores confidence scores

### Storage Structure

Name columns are stored in the knowledge base:

```json
{
  "nameColumns": [
    {
      "name": "First Name",
      "columnType": "name",
      "subType": "firstName",
      "confidence": 95,
      "detectedAt": "2024-01-15T10:30:00.000Z",
      "detectionCount": 3
    },
    {
      "name": "Last Name",
      "columnType": "name",
      "subType": "lastName",
      "confidence": 90,
      "detectedAt": "2024-01-15T10:30:00.000Z",
      "detectionCount": 2
    },
    {
      "name": "Provider Name",
      "columnType": "name",
      "subType": "fullName",
      "confidence": 85,
      "detectedAt": "2024-01-15T10:30:00.000Z",
      "detectionCount": 1
    }
  ]
}
```

## Visual Indicators

### Column Cards

Name columns are highlighted with:
- **Green border** (different shades for First/Last/Full)
- **Badge** showing "First", "Last", or "Name"
- **Metadata** showing detection type

### Sorting Priority

Columns are sorted in this order:
1. NPI columns (blue, first)
2. Name columns (green, second)
3. Other columns (alphabetically)

### Stats Display

Knowledge base stats show:
- Number of stored NPI columns
- Number of stored Name columns

## Pattern Recognition

### Valid Name Patterns

```
✅ First Name: "John", "Mary", "Robert"
✅ Last Name: "Smith", "van der Berg", "O'Connor"
✅ Full Name: "John Smith", "Mary Jane Watson", "Robert L. Johnson"
❌ Numbers: "12345", "9876"
❌ Mixed: "John123", "Name-2024"
```

### Name Validation

Names are considered valid if they:
- Contain 2-50 characters
- Only contain letters, spaces, hyphens, and apostrophes
- Match expected word count for type

## Detection Examples

### Example 1: Separate First/Last Name Columns

**File has columns:**
- "First Name" → Detected as First Name ✅
- "Last Name" → Detected as Last Name ✅
- "NPI" → Detected as NPI ✅

**Result**: First Name column gets green-600 border and "First" badge. Last Name gets green-700 border and "Last" badge.

### Example 2: Combined Full Name Column

**File has columns:**
- "Provider Name" → Detected as Full Name ✅
- "NPI Number" → Detected as NPI ✅

**Result**: Full Name column gets green-500 border and "Name" badge.

### Example 3: Future Uploads

**After first upload, knowledge base stores:**
- "Provider First Name" as firstName
- "Provider Last Name" as lastName

**Second upload has:**
- "Clinician First" → Fuzzy match to "Provider First Name" ✅
- "Clinician Last" → Fuzzy match to "Provider Last Name" ✅

**Result**: Instant detection using knowledge base, no pattern analysis needed.

## API Reference

### Functions (from `src/utils/nameDetector.js`)

#### `detectNameColumns(columns)`
Detects First/Last/Full Name columns
- **Parameters**: Array of `{ name, examples }`
- **Returns**: `{ firstName, lastName, fullName }` - Column names

#### `calculateNameConfidence(column, nameType)`
Calculates confidence score for name column
- **Parameters**: `column` object, `nameType` ('firstName'|'lastName'|'fullName')
- **Returns**: 0-100 confidence score

#### `detectAllNameColumns(columns)`
Returns detailed information for all columns
- **Parameters**: Array of columns
- **Returns**: Array with name detection details

#### `isValidName(value)`
Validates if a value looks like a valid name
- **Parameters**: Value to validate
- **Returns**: Boolean

### Functions (from `src/utils/storageManager.js`)

#### `findMatch(columnName, columnType)`
Finds match for any column type including names
- **Parameters**: Column name, type ('npi'|'name')
- **Returns**: Match info with subType

#### `addColumn(columnName, columnType, subType, confidence)`
Adds detected column to knowledge base
- **Parameters**: Column name, type, subtype, confidence
- **Subtypes**: 'firstName'|'lastName'|'fullName' for name type

## Console Logging

Check browser console to see:
- `Detected and saved First Name column: ColumnName`
- `Detected and saved Last Name column: ColumnName`
- `Detected and saved Full Name column: ColumnName`

## Benefits

1. **Automatic Detection**: Finds name columns without manual configuration
2. **Flexible**: Handles First, Last, or Full Name in one or two columns
3. **Intelligent**: Uses knowledge base for faster future detection
4. **Visual Feedback**: Clear indicators with badges and borders
5. **Exportable**: Knowledge base can be exported and shared

## Future Enhancements

- Support for middle names/initials
- Organization/company name detection
- Multi-lingual name support
- Configurable name patterns
- Name parsing (extract First/Last from Full Name)

