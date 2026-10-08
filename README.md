# InfoMind AI – Intelligent Information Understanding & Processing

> **Tagline**: *“Don’t Search Through Information. Let Information Understand Itself.”*  
> **Main Innovation**: Convert scattered enterprise information into clear, reliable, and actionable insights.

---

## 🚀 Overview

**InfoMind AI** is a next-generation cognitive intelligence platform designed for hackathons and production enterprise environments. Instead of treating documents as disconnected strings of text or basic keyword vectors, InfoMind AI structures ingestion around a 4-phase cognitive pipeline:

```
[ PHASE 01: FIND ] ➔ [ PHASE 02: UNDERSTAND ] ➔ [ PHASE 03: ORGANIZE ] ➔ [ PHASE 04: USE ]
  Discovery & Vector      Cognitive Synthesis     Cross-Doc Alignment       Decision Execution
      Ingestion               & Grounding            & Conflicts              & AI Actions
```

---

## 🌟 Key Features

### 1. Universal Multi-Format Ingestion
- Ingest **PDF, DOCX, XLSX, Images (PNG/JPG with simulated OCR), and TXT**.
- Drag-and-drop zone with instant text token extraction, AST structural segmentation, and metadata classification.
- Real client-side file reading with fallbacks for immediate exploration.

### 2. AI Document Summarization
- **Executive TL;DR**: Plain-language synthesis of dense multi-page contracts, audits, and clinical protocols.
- **Key Strategic Takeaways**: Bulleted covenants with direct audit verification links.

### 3. Smart Natural-Language Search
- Semantic query bar answering high-level questions (e.g., *"What is the agreed purchase price?"*, *"Are there payment term conflicts?"*).
- Instant answer card with **match confidence rating (e.g., 97%)**, document citation, and page index.

### 4. Important Information Extraction
- Named Entity Classification across 4 categories:
  - 💰 **Financial Figures**: Valuation, indemnity caps, basket amounts, billing rates.
  - 📅 **Key Dates**: Closing dates, notice windows, termination deadlines.
  - 👥 **Parties & Signatories**: Buyers, vendors, regulatory officers.
  - ⚖️ **Obligations & Covenants**: Exclusivity terms, SLAs, warranty requirements.
- Click any entity badge to jump to its **Source-Based Evidence**.

### 5. Multi-Document Comparison Matrix
- Side-by-side comparative grid mapping documents against standard deal dimensions:
  - Baseline Revenue, Effective Dates, Payment Terms, Termination Liabilities, and Intellectual Property warranties.
  - Highlighted status tags: `⚠️ Contradiction`, `🔍 Missing Exhibit`, `✓ Aligned`.

### 6. Conflict & Contradiction Detection Engine
- Surfaces contradictory facts across disparate sources (e.g., Board Memo claiming **$14.2M** revenue vs. Internal Audit showing **$13.5M** after a **$700K warranty reserve**).
- Side-by-side quote comparison diff box with severity indicators (**CRITICAL**, **HIGH**, **MEDIUM**).
- **1-Click Resolution**: Click **"✓ Apply Resolution"** to resolve the conflict and watch your Information Health Score automatically recalibrate!

### 7. Missing Information & Gap Analysis
- Detects omitted schedules (e.g. *Missing Schedule B IP Patent Inventory*), unverified officer certificates, or missing hazardous material inspections.
- 1-click trigger to initiate a request draft.

### 8. Source/Page-Based Evidence Modal
- Transparent, audit-ready provenance. Every extracted insight links to the exact document, page number, and original quote with semantic confidence percentages.

### 9. Information Health Score (5 Pillars)
A holistic reliability metric calculated on a 100-point scale:
1. **Completeness** (e.g., 86%): Measures presence of mandatory exhibits and schedules.
2. **Consistency** (e.g., 68%): Penalized by cross-document contradictions.
3. **Accuracy** (e.g., 94%): Benchmarked against verifiable external figures.
4. **Recency** (e.g., 91%): Assesses freshness of source documents.
5. **Actionability** (e.g., 79%): Measures readiness for operational decision-making.

### 10. Interactive Knowledge & Relationship Map
- Dynamic **HTML5 Canvas physics-based neural map**.
- Renders **Documents (Blue)**, **Conflicts (Red)**, **Missing Gaps (Purple)**, and **Key Entities (Emerald)**.
- Full physics simulation: drag nodes, hover to highlight relationships, zoom controls, and click to inspect.

### 11. AI-Generated Recommended Actions
- Prioritized operational workflows (**HIGH, MEDIUM, LOW**).
- **1-Click Execution Modal**:
  - *Generate Financial Reconciliation Memo* (Audit memo ready for CFO review).
  - *Draft Notice Email to Seller Counsel* (Outbound email with citation links).
  - *AP Adjustment Notice* (ERP adjustment directive).
- Full Markdown/Text export, clipboard copying, and celebration confetti.

### 12. Analytics Dashboard & Enterprise ROI Calculator
- Chart.js Radar chart comparing current Information Health against industry benchmarks.
- Risk distribution bar chart across Legal, Financial, and Operational categories.
- Real-time time-savings calculator showing hours saved and economic value unlocked.

### 13. Pre-Loaded Enterprise Demo Scenarios
1. **M&A Due Diligence & Vendor Dispute**: $42.5M corporate buyout with $700K revenue conflict and missing IP schedule.
2. **Clinical Trial & Regulatory Compliance Audit**: Phase III CardioVax protocol with FDA 50mg dosage cap contradiction.
3. **Enterprise Cloud SLA & FinOps Audit**: 99.82% uptime breach qualifying enterprise for $142,000 rebate.

---

## 🛠 Tech Stack

- **Frontend**: Vite, Modern Vanilla JS (ES Modules), Vanilla CSS (Custom Design System with clean Blue/White AI theme, Glassmorphism, Responsive Grid), Chart.js, Canvas-Confetti, Lucide SVGs.
- **Backend**: Python 3.14 / FastAPI, Uvicorn, Pydantic, Python-Multipart.
- **Architecture**: The frontend connects to FastAPI on `http://127.0.0.1:8000`, loads persisted documents from SQLite, sends uploads to the backend, and uses the backend AI question endpoint for semantic queries. When the backend is unavailable, the in-browser demo engine remains available; browser-only uploads are not saved to SQLite.

---

## ⚡ Quick Start

### 1. Run the Frontend (Vite)
```bash
npm run dev
# Or on custom port:
npx vite --port 5177 --host
```
Open [http://localhost:5177](http://localhost:5177) in your browser.

### 2. Run the FastAPI Backend (Required for database persistence)
```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```
The backend initializes and stores data in `backend/infomind.db`. With both servers running, the frontend loads database documents, saves uploaded files and their extracted content, and sends natural-language questions to the backend. Check backend health at [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health).

---

## 🏆 Hackathon Presentation Script

1. **The Problem**: *"Enterprises are drowning in fragmented documents—contracts, spreadsheets, board memos. Today, teams waste 40+ hours per deal cross-referencing information and miss critical discrepancies."*
2. **The Innovation**: *"InfoMind AI shifts the paradigm from searching through information to letting information understand itself. We structure this through our 4-stage pipeline: FIND, UNDERSTAND, ORGANIZE, and USE."*
3. **Live Demo Walkthrough**:
   - **FIND**: Show universal file ingestion and run a semantic query.
   - **UNDERSTAND**: Demonstrate Executive TL;DR, Entity extraction, and the 5-pillar Health Score.
   - **ORGANIZE**: Reveal the $700K revenue conflict between the Board Memo and the Audit Report, resolve it with 1 click, and explore the interactive physics Knowledge Graph.
   - **USE**: Click "Generate Financial Reconciliation Memo", copy the draft, and export the Executive Audit Dossier.
4. **Closing Pitch**: *"InfoMind AI turns scattered documents into reliable, verifiable, and executable intelligence."*
