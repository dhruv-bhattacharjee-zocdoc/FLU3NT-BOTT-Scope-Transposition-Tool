# Python Backend

This backend handles:
- Excel file processing
- Column type detection
- Template conversion
- API integrations
- Output generation

## Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file
PORT=5000
DEBUG=True

# Run the server
python app.py
```

## Endpoints (To Be Implemented)

- `GET /api/health` - Health check (✅ implemented)
- `POST /api/upload` - Upload Excel file
- `POST /api/detect-columns` - Detect column types
- `POST /api/convert` - Convert to template
- `POST /api/process` - Process data with APIs
- `POST /api/generate-output` - Generate output Excel

## Development

Add your endpoints and logic incrementally as you develop the features.

