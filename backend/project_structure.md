# Project Structure (Python Backend)

## Recommended Structure

```
backend/
├── app.py                  # Flask/FastAPI main application
├── routes/
│   ├── upload.py          # File upload endpoint
│   ├── detection.py       # Column detection endpoint
│   └── processing.py      # Data processing endpoint
├── services/
│   ├── excel_service.py   # Excel handling logic
│   ├── column_detector.py # Column type detection
│   ├── api_service.py     # External API calls
│   └── template_service.py # Template conversion
├── models/
│   └── schemas.py         # Data models
├── utils/
│   └── helpers.py         # Helper functions
└── requirements.txt        # Python dependencies

frontend/ (existing React app)
└── src/
    ├── services/
    │   └── api.js         # API client for backend
    └── ...
```

## API Endpoints You'll Need

1. `POST /api/upload` - Upload Excel file
2. `POST /api/detect-columns` - Detect column types
3. `POST /api/convert` - Convert to template
4. `POST /api/process` - Process data with APIs
5. `POST /api/generate-output` - Generate output Excel

## Frontend → Backend Flow

React Upload → Python Backend → Detect Columns → 
Apply Templates → Call APIs → Transform Data → 
Generate Output → Return to React → User Downloads

