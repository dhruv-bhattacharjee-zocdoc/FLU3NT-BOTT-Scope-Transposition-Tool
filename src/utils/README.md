# Column Detection Utilities

This folder contains reusable logic for detecting and processing different types of columns in uploaded data.

## Files

### columnDetector.js

Contains detection algorithms for identifying specific column types.

#### Functions

##### `detectNPIColumn(columns)`
Detects which column contains NPI (National Provider Identifier) numbers.

**Parameters:**
- `columns` (Array): Array of `{ name, examples }` objects

**Returns:** `string|null` - Name of the detected NPI column

**Detection Criteria:**
- Values are exactly 10 digits (e.g., "1234567890")
- No text or special characters
- Consistent formatting across examples

##### `calculateNPIConfidence(columnName, examples)`
Calculates a confidence score (0-100) for how likely a column is to contain NPI numbers.

**Parameters:**
- `columnName` (string): Name of the column
- `examples` (Array): Example values from the column

**Returns:** `number` - Confidence score (0-100)

**Scoring:**
- +30: Column name contains "NPI" keyword
- +70 each: Example is exactly 10 digits
- +50 each: Example is 10 digits with formatting
- -20 each: Example is numeric but wrong length
- -40 each: Example contains text/symbols

##### `detectAndRankNPIColumns(columns)`
Detects and ranks all columns by NPI likelihood.

**Parameters:**
- `columns` (Array): Array of `{ name, examples }` objects

**Returns:** Array of columns with additional properties:
- `confidence` (number): 0-100 confidence score
- `isNPIColumn` (boolean): Whether this is detected as NPI column
- Columns sorted: NPI column first, then by confidence

##### `isValidNPI(value)`
Validates if a single value is a valid NPI number.

**Parameters:**
- `value` (string|number): Value to validate

**Returns:** `boolean` - True if valid NPI format

## Usage

```javascript
import { detectNPIColumn, detectAndRankNPIColumns } from './utils/columnDetector';

// Detect NPI column in your data
const columns = [
  { name: "Provider ID", examples: ["1234567890", "0987654321"] },
  { name: "Provider Name", examples: ["Dr. Smith", "Dr. Jones"] },
];

const npiColumn = detectNPIColumn(columns);
console.log(npiColumn); // "Provider ID"

// Or get ranked columns with confidence scores
const ranked = detectAndRankNPIColumns(columns);
// Returns columns sorted with NPI column first
```

## Extending Detection Logic

To add detection for other column types, follow the same pattern:

1. Create a new detection function (e.g., `detectEmailColumn`)
2. Create a confidence calculator
3. Add to the ranking function or create a new one
4. Export from this file
5. Import and use in your components

## Future Additions

Possible column types to detect:
- Email addresses
- Phone numbers
- Dates
- Addresses
- Provider names
- Tax IDs
- License numbers

