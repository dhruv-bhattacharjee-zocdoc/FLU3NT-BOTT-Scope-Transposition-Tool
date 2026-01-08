# NPI Detection Feature

## Overview

The application now automatically detects NPI (National Provider Identifier) number columns from uploaded data files. Detected columns are highlighted and shown first in the carousel.

## What Was Added

### 1. Detection Logic (`src/utils/columnDetector.js`)

New file containing reusable detection functions:
- `detectNPIColumn()` - Finds the NPI column
- `calculateNPIConfidence()` - Scores columns by NPI likelihood
- `detectAndRankNPIColumns()` - Ranks all columns, NPI first
- `isValidNPI()` - Validates a single NPI value

### 2. Updated Carousel Component

Modified `src/folder_→_column_headers_carousel_react.jsx`:
- Imports and uses NPI detection
- Displays NPI column first
- Adds blue border and "NPI" badge to detected column
- Shows "NPI Detected" in stats section

## How It Works

### Detection Criteria

The system detects NPI columns by checking:

1. **Value Format**:
   - Exactly 10 digits: `1234567890` ✅
   - Formatted 10 digits: `123-456-7890` ✅
   - Any text or symbols: ❌

2. **Column Name**:
   - Contains "NPI" keyword: Bonus points ✅
   - Default names: Regular scoring

3. **Consistency**:
   - All examples match NPI format → High confidence
   - Mixed formats → Lower confidence
   - Non-numeric → Rejected

### Scoring System

Each column gets a confidence score (0-100):
- **+30 points**: Column name contains "NPI"
- **+70 points**: Perfect 10-digit match per example
- **+50 points**: 10 digits with formatting per example
- **-20 points**: Numeric but wrong length
- **-40 points**: Contains text/symbols

### Visual Indicators

When an NPI column is detected:
1. **Blue border** (2px solid) around the card
2. **"NPI" badge** on the card title
3. **"• Detected" label** in metadata
4. **"NPI Detected" badge** in stats section
5. **Shown first** in the carousel

## File Structure

```
src/
├── utils/
│   ├── columnDetector.js    # NPI detection logic ⭐ NEW
│   └── README.md            # Documentation ⭐ NEW
└── folder_→_column_headers_carousel_react.jsx  # Updated with NPI highlighting
```

## Testing

Upload a file with NPI numbers to see:
1. The NPI column automatically highlighted in blue
2. "NPI" badge on the detected column
3. Column shown first in the carousel
4. Stats section showing "NPI Detected" badge

## Future Enhancements

The detection system can be extended to detect:
- Email addresses
- Phone numbers  
- Dates
- Addresses
- Provider names
- Tax IDs
- License numbers

## For Development

To add new column detection types:

1. Add a new function to `columnDetector.js`:
```javascript
export function detectEmailColumn(columns) {
  // Your detection logic
}
```

2. Use it in your component:
```javascript
import { detectEmailColumn } from './utils/columnDetector';
```

3. Update the UI to highlight detected columns similarly.

