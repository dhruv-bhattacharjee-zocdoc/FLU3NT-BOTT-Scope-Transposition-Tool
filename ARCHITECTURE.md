# Architecture Overview

## Tech Stack

### Frontend (React + Vite)
- **Purpose**: User interface, file upload, visualization
- **Location**: Root directory
- **Tech**: React, Tailwind CSS, Papa Parse, SheetJS
- **Port**: 5173 (Vite dev server)

### Backend (Python + Flask)
- **Purpose**: Data processing, column detection, API calls, output generation
- **Location**: `backend/` directory
- **Tech**: Flask, pandas, openpyxl, requests
- **Port**: 5000

## Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                           │
│  - User uploads Excel file                                  │
│  - Shows column preview                                     │
│  - Sends data to backend                                    │
│  - Displays results                                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP POST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   PYTHON BACKEND                            │
│  1. Receives Excel file                                     │
│  2. Detects column types (dates, numbers, text, etc.)      │
│  3. Converts to your template format                        │
│  4. Calls external APIs to enrich data                      │
│  5. Processes & transforms data                            │
│  6. Generates output Excel file                             │
│  7. Returns result to frontend                              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Response
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                           │
│  - Downloads processed Excel file                           │
│  - Shows success message                                    │
└─────────────────────────────────────────────────────────────┘
```

## How to Use

### 1. Start Frontend (React)
```bash
cd "C:\Users\dhruv.bhattacharjee\Desktop\PDO Data Transposition\TPS module_4"
npm run dev
```
Access at: http://localhost:5173

### 2. Start Backend (Python) - When Ready
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Access at: http://localhost:5000

## Development Workflow

### Phase 1: Current ✅
- ✅ React frontend with column detection carousel
- ✅ File upload and preview

### Phase 2: Next Steps
- [ ] Connect frontend to backend
- [ ] Upload Excel files to Python backend
- [ ] Implement column type detection in Python

### Phase 3: Core Features
- [ ] Template conversion logic
- [ ] API integration for data enrichment
- [ ] Data transformation pipeline

### Phase 4: Output
- [ ] Generate processed Excel files
- [ ] Download functionality
- [ ] Error handling & validation

## File Structure

```
TPS module_4/
├── src/                          # React frontend
│   ├── components/
│   ├── services/
│   │   └── api.js               # Backend API client
│   └── ...
├── backend/                        # Python backend
│   ├── app.py                    # Flask main app
│   ├── requirements.txt          # Python dependencies
│   └── [future folders]
├── package.json                   # Frontend dependencies
└── ARCHITECTURE.md                # This file
```

## Benefits of This Architecture

1. **Separation of Concerns**: Frontend handles UI, backend handles logic
2. **Python Power**: Use pandas, openpyxl, and other libraries
3. **Scalability**: Add more endpoints easily
4. **Flexibility**: Change frontend or backend independently
5. **API Integration**: Easy to add external API calls in Python

## Next Steps

1. Continue developing the React UI
2. When ready, implement column detection in Python
3. Add API integration endpoints
4. Create output generation logic

