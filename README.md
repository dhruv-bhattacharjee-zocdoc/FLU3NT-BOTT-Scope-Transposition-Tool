# Files → Columns Carousel

A React application that aggregates column headers from multiple CSV/TSV/XLSX files and displays them in a horizontal carousel.

## Features

- Upload one or more data files (CSV, TSV, XLSX, XLS)
- **Automatic NPI Number detection** - Detects NPI columns (10-digit numbers) automatically
- **Automatic Name detection** - Detects First Name, Last Name, and Full Name columns
- **Highlighted detection** - NPI columns shown first (blue border), Name columns second (green border)
- **Knowledge base storage** - Remembers detected columns for faster future detection
- **Export knowledge base** - Save detection patterns as JSON
- Aggregates column names across all files
- Shows example values per column
- Horizontal carousel with arrow controls + mouse wheel scrolling
- Search/filter columns
- No backend required - runs entirely in the browser

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   The app will be available at `http://localhost:5173` (or another port if 5173 is taken)

## Build for Production

```bash
npm run build
```

The output will be in the `dist` folder.

## Technologies Used

- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- PapaParse (CSV/TSV parsing)
- SheetJS (Excel file parsing)
- Lucide React (icons)

## Usage

1. Click the "Upload Files" button
2. Select one or more CSV, TSV, XLS, or XLSX files
3. Wait for the files to be parsed
4. **NPI columns are automatically detected and shown first** with a blue border
5. View all column headers in the horizontal carousel
6. Hover over any column card to see 2-3 example values
7. Use the search box to filter columns
8. Use arrow buttons or mouse wheel to scroll through columns

## Detection Features

### NPI Detection

The app automatically detects NPI (National Provider Identifier) number columns by analyzing:
- 10-digit numeric values
- Consistent formatting across examples
- Column names containing "NPI" keyword

Detected NPI columns are:
- Shown first in the carousel
- Highlighted with a blue border and "NPI" badge
- Saved to knowledge base for future uploads

### Name Detection

The app automatically detects name-related columns:
- **First Name**: "first name", "fname", "firstname", "given name"
- **Last Name**: "last name", "lname", "lastname", "surname", "family name"
- **Full Name**: "full name", "name", "patient name", "provider name"

Detected Name columns are:
- Shown second in the carousel (after NPI)
- Highlighted with a green border and badge (shades vary by type)
- Badges show: "First", "Last", or "Name"
- Saved to knowledge base with sub-types for future detection

### Knowledge Base

The app learns from each upload:
- Stores detected NPI and Name column names
- Uses fuzzy matching for similar column names
- Improves detection accuracy over time
- Export as JSON for backup or sharing
