# InfoMind AI – Intelligent Information Understanding & Processing
### Complete FastAPI Backend

InfoMind AI is an enterprise-grade document intelligence and information processing engine built with Python and FastAPI. It extracts multi-page text and tables from diverse document formats, conducts intelligent multi-document comparisons, identifies contradictions and missing compliance items, derives prioritized recommended actions, and calculates an **Information Health Score** with exact source citations (document name and page number).

---

## 🌟 Key Capabilities

- **Multi-Format Extraction & OCR**: Supports **PDF, DOCX, XLSX, TXT, CSV, JSON, JPG, and PNG** with per-page segmentation and OCR fallback.
- **Intelligent Information Extraction**: Automatically identifies submission deadlines, financial budgets, department roles, and compliance policies.
- **Natural-Language Question Answering**: Fast semantic Q&A with exact source citations (`[Document_Name.ext, Page X]`).
- **Smart Multi-Document Comparison**: Compares versions side-by-side to highlight **Changed**, **Added**, and **Unchanged** points.
- **Conflict Detection**: Uncovers discrepancies between documents (such as conflicting submission deadlines or contradictory signature policies).
- **Missing Information Detection**: Identifies critical gaps (missing direct supervisor contacts, pending approval stamps, unsigned certificates).
- **AI Recommended Actions**: Generates prioritized, sequenced next steps based on extracted insights.
- **Information Health Score (0-100)**: Assesses repository completeness, clarity, and consistency.
- **Offline / Zero-Config Realistic AI**: Operates immediately out-of-the-box using the built-in heuristic NLP engine. Simply add `OPENAI_API_KEY` or `GEMINI_API_KEY` to switch to live LLM generation.
- **Database Ready**: Runs on SQLite initially (`infomind.db`), with PostgreSQL migration DDL included (`schema_postgres.sql`).

---

## 📂 Project Structure

```
backend/
├── main.py                     # FastAPI application entrypoint with all REST endpoints
├── database.py                 # SQLite database repository & demo seeder
├── models.py                   # Data models (Document, Page, Insight, Comparison, QA)
├── schemas.py                  # Pydantic request & response schemas
├── requirements.txt            # Python dependencies
├── .env.example                # Environment template
├── .env                        # Active environment configuration
├── schema_postgres.sql         # Production PostgreSQL migration DDL
├── test_backend.py             # Complete endpoint test suite
├── infomind_api.js             # Plug-and-play frontend JavaScript client
├── services/
│   ├── __init__.py
│   ├── document_processor.py   # Multi-format parser (PDF, DOCX, XLSX, TXT, Images)
│   ├── ai_service.py           # Summarization, QA, citations, & LLM integrations
│   ├── comparison.py           # Side-by-side multi-document comparator
│   └── analyzer.py             # Conflict & missing info detector, action generator
└── uploads/                    # Physical document file storage
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (tested with Python 3.14.2)
- Pip

### 2. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 3. Configure `.env`
Copy `.env.example` to `.env` (already created for you):
```ini
HOST=0.0.0.0
PORT=8000
DEBUG=True

DATABASE_URL=sqlite:///./infomind.db
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=50

# Optional: Add your OpenAI or Gemini key to enable live LLM generation
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# Optional: Tesseract executable path if installed on Windows
TESSERACT_PATH=
CORS_ORIGINS=*
```

### 4. Start the FastAPI Server
From the `backend/` directory:
```bash
uvicorn main:app --reload
```
The server will start at: **`http://localhost:8000`**

- **Interactive Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **System Health Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Running the Verification Test Suite

Run the automated test suite to verify all 12 endpoints:
```bash
python test_backend.py
```

Expected output:
```
[PASS] test_root passed
[PASS] test_health passed
[PASS] test_get_documents passed: 3 documents returned
[PASS] test_get_analytics passed: Health Score = 82.3
[PASS] test_get_insights passed: 14 insights returned
[PASS] test_ask passed: Answer = 'Based on the project documentation...'
[PASS] test_summarize passed: 4 key points, Health Score = 90.0
[PASS] test_compare passed: 1 changed, 1 added
[PASS] test_conflicts passed: 2 conflicts detected
[PASS] test_missing passed: 3 missing items identified
[PASS] test_actions passed: 5 actions generated
[PASS] test_upload passed: Created document ID 5
[PASS] test_process passed: Processed document successfully
[PASS] test_delete passed: Cleaned up test document

>>> ALL 12 ENDPOINT TESTS PASSED SUCCESSFULLY! <<<
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload one or multiple files (`multipart/form-data`) |
| `POST` | `/api/process` | Trigger deep extraction & insights on documents |
| `POST` | `/api/ask` | Natural-language Q&A with source citations |
| `POST` | `/api/summarize` | Executive summary + key points + health score |
| `POST` | `/api/compare` | Multi-document comparison (changed, added, unchanged) |
| `POST` | `/api/conflicts` | Detect cross-document contradictions & discrepancies |
| `POST` | `/api/missing` | Detect missing information, approvals, & contacts |
| `POST` | `/api/actions` | Generate prioritized recommended action steps |
| `GET` | `/api/documents` | List all documents with file sizes and health score |
| `GET` | `/api/documents/{id}` | Retrieve document details with per-page content |
| `DELETE`| `/api/documents/{id}` | Delete a document and disk file |
| `GET` | `/api/insights` | Retrieve all insights (supports `?insight_type=...`) |
| `GET` | `/api/analytics` | High-level dashboard metrics & health score |
| `GET` | `/api/health` | Service health status and active AI engine mode |

---

## 🔗 Connecting to the InfoMind AI Frontend

The backend includes `CORS_ORIGINS=*` so your HTML/React frontend can immediately communicate with the server.

### Option A: Using the Provided `infomind_api.js` Client
Add this tag to your `info.html` right before `</body>`:
```html
<script src="http://localhost:8000/infomind_api.js"></script>
```

### Option B: Direct `fetch()` Examples

#### 1. Upload Documents
```javascript
const formData = new FormData();
for (const file of fileInput.files) {
    formData.append("files", file);
}

const response = await fetch("http://localhost:8000/api/upload", {
    method: "POST",
    body: formData
});
const data = await response.json();
```

#### 2. Natural Language Question Answering
```javascript
const response = await fetch("http://localhost:8000/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: "What is the submission deadline?" })
});
const data = await response.json();
console.log(data.answer, data.sources);
```

#### 3. Multi-Document Comparison
```javascript
const response = await fetch("http://localhost:8000/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc1_id: 1, doc2_id: 2 })
});
const comparison = await response.json();
```

---

## 🗄️ PostgreSQL Migration

When ready to switch from SQLite to PostgreSQL:

1. Create a PostgreSQL database (e.g., `infomind_db`).
2. Run the provided schema script:
   ```bash
   psql -U postgres -d infomind_db -f schema_postgres.sql
   ```
3. Update `.env`:
   ```ini
   DATABASE_URL=postgresql://postgres:password@localhost:5432/infomind_db
   ```
4. Restart Uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
