# CalShare - AI-Powered Calendar Sharing

A web application that accepts calendar information in **any format** — images, PDFs, spreadsheets, text files, or standard ICS files — and uses AI (Claude) with OCR to extract events and create shareable calendar links.

## Features

### AI-Powered Event Extraction
- **Any File Format**: Upload photos of schedules, PDFs, Excel files, Word docs, text files, or standard ICS calendar files
- **OCR for Images & Scanned PDFs**: Uses Tesseract OCR to extract text from images and scanned documents
- **Claude AI Parsing**: Uses Claude to intelligently parse unstructured text into structured calendar events
- **Vision Analysis**: For images, sends them directly to Claude for visual analysis in addition to OCR

### Easy Sharing
- **Custom URLs**: Create memorable URLs like `/c/soccer-team-2024`
- **QR Codes**: Automatically generated QR codes for mobile sharing
- **Multi-Platform**: Works with Google Calendar, Apple Calendar, Outlook, and any ICS-compatible app
- **Device Detection**: Provides platform-specific instructions for adding events

### Event Management
- **Category Filtering**: Organize events by type (practice, game, meeting, etc.)
- **Selective Download**: Users can download all events or filter by category
- **Manual Entry**: Add or edit events manually with a form interface
- **Text Paste**: Paste schedule text directly for AI extraction

## Supported File Formats

| Format | Description |
|--------|-------------|
| **Images** | PNG, JPG, JPEG, GIF, BMP, WEBP, TIFF |
| **Documents** | PDF (text and scanned), DOC, DOCX, RTF |
| **Spreadsheets** | XLS, XLSX, CSV |
| **Text** | TXT, JSON |
| **Calendar** | ICS, ICAL |

## 🚀 Quick Deploy

**Want to deploy this app?** See [QUICK_START.md](QUICK_START.md) for a 5-minute deployment guide to Render.com or Railway.

## Installation

### Prerequisites
- Python 3.8+
- Tesseract OCR (for image/PDF text extraction)
- Anthropic API key (for AI parsing)

### Install Tesseract

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**macOS:**
```bash
brew install tesseract
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### Setup

1. Clone or download this project

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set your Anthropic API key:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

4. Run the application:
```bash
python app.py
```

5. Open http://localhost:5000

## Usage

### Creating a Calendar

1. **Add Calendar Details**: Enter a name and optional description
2. **Upload a File**: Drag and drop any supported file, or click to browse
3. **Or Paste Text**: Paste schedule information directly
4. **Or Enter Manually**: Click "Add Event" to create events one by one
5. **Review Events**: The AI-extracted events appear for review and editing
6. **Create**: Click "Create Shareable Calendar" to get your unique URL

### Sharing Your Calendar

Recipients can:
- **Download ICS**: Works with all calendar apps
- **Google Calendar**: One-click subscribe
- **Apple Calendar**: Uses webcal:// protocol
- **Outlook**: Direct import link
- **Filter by Category**: Download only specific event types (e.g., just games)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Home page |
| `/create` | GET | Calendar creation page |
| `/create` | POST | Create new calendar (JSON) |
| `/upload` | POST | Upload and parse file |
| `/parse-text` | POST | Parse text with AI |
| `/c/<slug>` | GET | View calendar |
| `/c/<slug>/download.ics` | GET | Download ICS file |
| `/c/<slug>/qr` | GET | Get QR code image |
| `/api/calendars/<slug>` | GET | Get calendar JSON |

### Example: Upload API

```bash
curl -X POST -F "file=@schedule.png" http://localhost:5000/upload
```

Response:
```json
{
  "success": true,
  "events": [
    {
      "title": "Practice",
      "start_time": "2024-12-01T09:00:00",
      "end_time": "2024-12-01T11:00:00",
      "location": "Main Field",
      "category": "practice"
    }
  ],
  "message": "Successfully extracted 5 events"
}
```

## Project Structure

```
calendar-share/
├── app.py              # Main Flask application with AI parsing
├── requirements.txt    # Python dependencies
├── uploads/            # Temporary upload storage
├── templates/
│   ├── base.html       # Base template
│   ├── index.html      # Home page
│   ├── create.html     # Calendar creation page
│   ├── view.html       # Calendar view page
│   ├── 404.html        # Not found page
│   └── 500.html        # Error page
└── static/
    ├── css/
    │   └── style.css   # Stylesheet
    └── js/
        ├── main.js     # Shared JavaScript
        └── create.js   # Create page JavaScript
```

## How AI Parsing Works

1. **File Detection**: Determines file type (image, PDF, text, etc.)
2. **Text Extraction**: 
   - For images: Uses Tesseract OCR
   - For PDFs: Extracts text directly, uses OCR for scanned pages
   - For documents: Parses with appropriate library
3. **AI Analysis**: Sends extracted text (and image for vision) to Claude
4. **Event Structuring**: Claude returns structured JSON with events
5. **Validation**: Dates are parsed and validated, UIDs assigned

## Event Categories

- `general` - Default
- `practice` - Training sessions
- `game` - Games/matches
- `meeting` - Team meetings
- `event` - Special events
- `deadline` - Important deadlines

## Production Deployment

For production:

1. Use a production WSGI server:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. Set up HTTPS with nginx reverse proxy

3. Use a production database (PostgreSQL)

4. Set proper environment variables:
```bash
export ANTHROPIC_API_KEY="your-key"
export FLASK_ENV="production"
```

## Troubleshooting

**OCR not working:**
- Ensure Tesseract is installed: `tesseract --version`
- Check PATH includes Tesseract binary

**AI parsing fails:**
- Verify ANTHROPIC_API_KEY is set
- Check API quota/limits

**Events not extracted:**
- Try clearer images
- Use higher resolution PDFs
- Paste text directly as alternative

## License

MIT License
