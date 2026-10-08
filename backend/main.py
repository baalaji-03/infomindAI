import os
import uuid
import json
from time import perf_counter
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models
import schemas
from database import get_db, init_db, DatabaseSession
from services.document_processor import DocumentProcessor
from services.ai_service import AIService
from services.comparison import DocumentComparator
from services.analyzer import DocumentAnalyzer

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))

ai_service = AIService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle startup and shutdown handler."""
    print("[InfoMind AI] Initializing database and services...")
    init_db()
    print("[InfoMind AI] System ready on http://localhost:8000 (Swagger docs at /docs)")
    yield
    print("[InfoMind AI] System shutting down.")


app = FastAPI(
    title="InfoMind AI API",
    description=(
        "Intelligent Information Understanding & Processing REST API. "
        "Supports document extraction (PDF, DOCX, XLSX, TXT, Images), AI summarization, "
        "Q&A with exact source references, comparison, conflict & missing data detection, "
        "and prioritized recommended actions."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - enables seamless communication with frontend (HTML/React)
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env.strip() == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import FileResponse

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/infomind_api.js", include_in_schema=False)
def serve_client_script():
    js_path = BASE_DIR / "infomind_api.js"
    if js_path.exists():
        return FileResponse(js_path, media_type="application/javascript")
    raise HTTPException(status_code=404, detail="Script not found")


# ==========================================
# Root & System Health
# ==========================================
@app.get("/", tags=["System"])
def root():
    return {
        "project": "InfoMind AI – Intelligent Information Understanding & Processing",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }


@app.get("/api/health", tags=["System"])
def health_check(db: DatabaseSession = Depends(get_db)):
    analytics = db.get_analytics()
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "documents_indexed": analytics["documents_count"],
        "ai_engine": "live_llm" if ai_service.has_live_ai else "intelligent_heuristic_nlp",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ==========================================
# 1. Document Upload (POST /api/upload)
# ==========================================
@app.post(
    "/api/upload",
    response_model=schemas.UploadResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Documents"],
    summary="Upload documents (PDF, DOCX, XLSX, TXT, JPG, PNG)"
)
async def upload_documents(
    files: List[UploadFile] = File(...),
    db: DatabaseSession = Depends(get_db)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    saved_documents: List[schemas.DocumentResponse] = []
    failed_files = []

    for file in files:
        original_name = file.filename or "unnamed_document"
        try:
            content = await file.read()
            file_size = len(content)

            if file_size == 0:
                failed_files.append({"filename": original_name, "error": "Empty file."})
                continue

            file_type = DocumentProcessor.validate_file(original_name, file_size, MAX_FILE_SIZE_MB)

            # Generate disk filename
            unique_prefix = uuid.uuid4().hex[:8]
            clean_filename = f"{unique_prefix}_{Path(original_name).name}"
            destination_path = UPLOAD_DIR / clean_filename

            with open(destination_path, "wb") as f_out:
                f_out.write(content)

            # Extract text and page segmentation
            extracted = DocumentProcessor.extract_text(str(destination_path), original_name)
            page_count = extracted.get("page_count", 1)
            raw_text = extracted.get("full_text", "")
            pages_data = extracted.get("pages", [])

            health_score = ai_service.calculate_health_score([{
                "raw_text": raw_text,
                "page_count": page_count,
                "original_filename": original_name
            }])

            # Create document in database
            new_doc = models.Document(
                filename=clean_filename,
                original_filename=original_name,
                file_type=file_type,
                file_size=file_size,
                file_path=f"uploads/{clean_filename}",
                status="processed",
                page_count=page_count,
                health_score=health_score,
                raw_text=raw_text,
                upload_timestamp=datetime.now(timezone.utc)
            )
            saved_doc = db.create_document(new_doc)

            # Create pages in database
            pages_to_create = [
                models.DocumentPage(
                    document_id=saved_doc.id,
                    page_number=p.get("page_number", 1),
                    content=p.get("content", ""),
                    char_count=p.get("char_count", 0)
                )
                for p in pages_data
            ]
            db.create_pages(pages_to_create)

            # Create initial important detail insight
            db.create_insight(models.Insight(
                document_id=saved_doc.id,
                insight_type="important_detail",
                title=f"Extracted: {original_name}",
                content=f"Extracted {page_count} page(s) and {len(raw_text)} characters.",
                severity="low",
                confidence=0.99,
                source_reference=f"{original_name}, Page 1"
            ))

            preview = (raw_text[:200] + "...") if raw_text and len(raw_text) > 200 else raw_text
            saved_documents.append(schemas.DocumentResponse(
                id=saved_doc.id,
                filename=saved_doc.filename,
                original_filename=saved_doc.original_filename,
                file_type=saved_doc.file_type,
                file_size=saved_doc.file_size,
                file_size_formatted=saved_doc.file_size_formatted,
                status=saved_doc.status,
                page_count=saved_doc.page_count,
                health_score=saved_doc.health_score,
                upload_timestamp=saved_doc.upload_timestamp,
                preview_text=preview
            ))

        except Exception as e:
            failed_files.append({"filename": original_name, "error": str(e)})

    return schemas.UploadResponse(
        message=f"Successfully processed {len(saved_documents)} document(s).",
        documents=saved_documents,
        failed_files=failed_files
    )


# ==========================================
# 2. Document Processing (POST /api/process)
# ==========================================
@app.post(
    "/api/process",
    response_model=schemas.ProcessResponse,
    tags=["Processing"],
    summary="Trigger deep processing & insights generation for documents"
)
async def process_documents(
    payload: schemas.DocumentProcessRequest = schemas.DocumentProcessRequest(),
    db: DatabaseSession = Depends(get_db)
):
    docs = db.list_documents(ids=payload.document_ids)
    if not docs:
        docs = db.list_documents()

    results = []
    for doc in docs:
        file_path = BASE_DIR / doc.file_path
        if file_path.exists():
            extracted = DocumentProcessor.extract_text(str(file_path), doc.original_filename)
            doc.raw_text = extracted.get("full_text", "")
            doc.page_count = extracted.get("page_count", 1)
            doc.status = "processed"

            # Sync pages
            db.delete_pages(doc.id)
            pages_to_add = [
                models.DocumentPage(
                    document_id=doc.id,
                    page_number=p.get("page_number", 1),
                    content=p.get("content", ""),
                    char_count=p.get("char_count", 0)
                )
                for p in extracted.get("pages", [])
            ]
            db.create_pages(pages_to_add)

            doc.health_score = ai_service.calculate_health_score([{
                "raw_text": doc.raw_text,
                "page_count": doc.page_count,
                "original_filename": doc.original_filename
            }])
            db.update_document(doc)

        insights = db.list_insights(document_id=doc.id)
        results.append(schemas.ProcessResultItem(
            document_id=doc.id,
            filename=doc.original_filename,
            status=doc.status,
            pages_extracted=doc.page_count,
            insights_generated=len(insights),
            health_score=doc.health_score
        ))

    return schemas.ProcessResponse(
        message=f"Deep processing completed for {len(results)} document(s).",
        processed_count=len(results),
        results=results
    )


# ==========================================
# 3. Question Answering (POST /api/ask)
# ==========================================
@app.post(
    "/api/ask",
    response_model=schemas.AskResponse,
    tags=["AI Features"],
    summary="Ask natural language questions across documents with source citations"
)
async def ask_question(
    payload: schemas.AskRequest,
    db: DatabaseSession = Depends(get_db)
):
    started_at = perf_counter()
    docs = db.list_documents(ids=payload.document_ids)
    if not docs:
        docs = db.list_documents()

    docs_data = []
    for d in docs:
        pages_resp = [{"page_number": p.page_number, "content": p.content} for p in d.pages]
        docs_data.append({
            "id": d.id,
            "original_filename": d.original_filename,
            "raw_text": d.raw_text or "",
            "pages": pages_resp
        })

    qa_res = await ai_service.answer_question(payload.question, docs_data)

    # Save to QA History
    try:
        db.create_qa_history(models.QAHistory(
            question=payload.question,
            answer=qa_res.get("answer", ""),
            sources_json=json.dumps(qa_res.get("sources", []))
        ))
    except Exception as e:
        print(f"[QA History] Warning: {e}")

    db.create_search_entry(models.SearchHistory(
        query=payload.question,
        search_type="semantic",
        result_count=len(qa_res.get("sources", [])),
        execution_time_ms=(perf_counter() - started_at) * 1000
    ))

    return schemas.AskResponse(
        question=qa_res["question"],
        answer=qa_res["answer"],
        sources=[schemas.SourceReference(**s) for s in qa_res.get("sources", [])],
        confidence_score=qa_res.get("confidence_score", 0.95)
    )


# ==========================================
# 4. Summarization (POST /api/summarize)
# ==========================================
@app.post(
    "/api/summarize",
    response_model=schemas.SummarizeResponse,
    tags=["AI Features"],
    summary="Generate executive summary and Information Health Score"
)
async def summarize(
    payload: schemas.SummarizeRequest = schemas.SummarizeRequest(),
    db: DatabaseSession = Depends(get_db)
):
    if payload.document_id:
        doc = db.get_document(payload.document_id)
        docs = [doc] if doc else []
    elif payload.document_ids:
        docs = db.list_documents(ids=payload.document_ids)
    else:
        docs = db.list_documents()

    if not docs:
        docs = db.list_documents()

    docs_data = [{
        "id": d.id,
        "original_filename": d.original_filename,
        "raw_text": d.raw_text or "",
        "page_count": d.page_count
    } for d in docs]

    summary_result = await ai_service.summarize_documents(docs_data, payload.summary_type or "executive")

    return schemas.SummarizeResponse(
        overview=summary_result["overview"],
        key_points=summary_result["key_points"],
        health_score=summary_result["health_score"],
        source_references=[schemas.SourceReference(**s) for s in summary_result["source_references"]]
    )


# ==========================================
# 5. Multi-Document Comparison (POST /api/compare)
# ==========================================
@app.post(
    "/api/compare",
    response_model=schemas.CompareResponse,
    tags=["AI Features"],
    summary="Compare two documents to detect changed, added, and unchanged points"
)
async def compare_documents(
    payload: schemas.CompareRequest,
    db: DatabaseSession = Depends(get_db)
):
    doc1 = db.get_document(payload.doc1_id)
    doc2 = db.get_document(payload.doc2_id)

    if not doc1 or not doc2:
        all_docs = db.list_documents()
        if len(all_docs) >= 2:
            doc1, doc2 = all_docs[0], all_docs[1]
        else:
            raise HTTPException(status_code=404, detail="Requires at least 2 documents in database to compare.")

    d1_data = {"id": doc1.id, "original_filename": doc1.original_filename, "raw_text": doc1.raw_text or ""}
    d2_data = {"id": doc2.id, "original_filename": doc2.original_filename, "raw_text": doc2.raw_text or ""}

    comparison_res = DocumentComparator.compare(d1_data, d2_data)

    # Save to comparison records
    try:
        db.create_comparison(models.ComparisonRecord(
            doc1_id=doc1.id,
            doc2_id=doc2.id,
            summary=comparison_res["summary"],
            diff_data=json.dumps({
                "changed": comparison_res["changed_points"],
                "added": comparison_res["added_points"],
                "unchanged": comparison_res["unchanged_points"]
            })
        ))
    except Exception as e:
        print(f"[Comparison] Warning: {e}")

    return schemas.CompareResponse(
        doc1_name=comparison_res["doc1_name"],
        doc2_name=comparison_res["doc2_name"],
        changed_points=[schemas.ComparisonPoint(**p) for p in comparison_res["changed_points"]],
        added_points=[schemas.ComparisonPoint(**p) for p in comparison_res["added_points"]],
        unchanged_points=[schemas.ComparisonPoint(**p) for p in comparison_res["unchanged_points"]],
        summary=comparison_res["summary"]
    )


# ==========================================
# 6. Conflict Detection (POST /api/conflicts)
# ==========================================
@app.post(
    "/api/conflicts",
    response_model=schemas.ConflictsResponse,
    tags=["AI Features"],
    summary="Detect contradictions and discrepancies across documents"
)
async def detect_conflicts(
    payload: schemas.ConflictsRequest = schemas.ConflictsRequest(),
    db: DatabaseSession = Depends(get_db)
):
    docs = db.list_documents(ids=payload.document_ids) if payload.document_ids else db.list_documents()
    docs_data = [{"id": d.id, "original_filename": d.original_filename, "raw_text": d.raw_text or ""} for d in docs]

    conflicts_list = DocumentAnalyzer.detect_conflicts(docs_data)

    formatted = []
    for c in conflicts_list:
        sources = [schemas.SourceReference(**s) for s in c.get("conflicting_sources", [])]
        formatted.append(schemas.ConflictItem(
            id=c.get("id"),
            title=c["title"],
            description=c["description"],
            severity=c.get("severity", "medium"),
            conflicting_sources=sources,
            suggestion=c.get("suggestion", "")
        ))

    return schemas.ConflictsResponse(
        conflicts=formatted,
        total_conflicts=len(formatted)
    )


# ==========================================
# 7. Missing Information Detection (POST /api/missing)
# ==========================================
@app.post(
    "/api/missing",
    response_model=schemas.MissingInfoResponse,
    tags=["AI Features"],
    summary="Identify missing information, signatures, contacts, and compliance gaps"
)
async def detect_missing(
    payload: schemas.MissingInfoRequest = schemas.MissingInfoRequest(),
    db: DatabaseSession = Depends(get_db)
):
    docs = db.list_documents(ids=payload.document_ids) if payload.document_ids else db.list_documents()
    docs_data = [{"id": d.id, "original_filename": d.original_filename, "raw_text": d.raw_text or ""} for d in docs]

    missing_items = DocumentAnalyzer.detect_missing_info(docs_data)

    return schemas.MissingInfoResponse(
        missing_items=[schemas.MissingInfoItem(**m) for m in missing_items],
        total_missing=len(missing_items)
    )


# ==========================================
# 8. Recommended Actions (POST /api/actions)
# ==========================================
@app.post(
    "/api/actions",
    response_model=schemas.ActionsResponse,
    tags=["AI Features"],
    summary="Generate prioritized recommended next steps and actions"
)
async def generate_actions(
    payload: schemas.ActionsRequest = schemas.ActionsRequest(),
    db: DatabaseSession = Depends(get_db)
):
    docs = db.list_documents(ids=payload.document_ids) if payload.document_ids else db.list_documents()
    docs_data = [{"id": d.id, "original_filename": d.original_filename, "raw_text": d.raw_text or ""} for d in docs]

    conflicts = DocumentAnalyzer.detect_conflicts(docs_data)
    missing = DocumentAnalyzer.detect_missing_info(docs_data)

    actions = DocumentAnalyzer.generate_recommended_actions(conflicts, missing, docs_data)

    return schemas.ActionsResponse(
        actions=[schemas.ActionItem(**a) for a in actions],
        total_actions=len(actions)
    )


# ==========================================
# 9. Documents Listing & Details (GET /api/documents)
# ==========================================
@app.get(
    "/api/documents",
    response_model=List[schemas.DocumentResponse],
    tags=["Documents"],
    summary="List all uploaded documents with status and metadata"
)
def list_documents(
    db: DatabaseSession = Depends(get_db),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    docs = db.list_documents(limit=limit, offset=offset)
    response = []
    for d in docs:
        preview = (d.raw_text[:200] + "...") if d.raw_text and len(d.raw_text) > 200 else d.raw_text
        response.append(schemas.DocumentResponse(
            id=d.id,
            filename=d.filename,
            original_filename=d.original_filename,
            file_type=d.file_type,
            file_size=d.file_size,
            file_size_formatted=d.file_size_formatted,
            status=d.status,
            page_count=d.page_count,
            health_score=d.health_score,
            upload_timestamp=d.upload_timestamp,
            preview_text=preview
        ))
    return response


@app.get(
    "/api/documents/{document_id}",
    response_model=schemas.DocumentDetailResponse,
    tags=["Documents"],
    summary="Get single document details with all extracted pages"
)
def get_document(document_id: int, db: DatabaseSession = Depends(get_db)):
    doc = db.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document with ID {document_id} not found.")

    pages_resp = [
        schemas.DocumentPageResponse(
            page_number=p.page_number,
            content=p.content,
            char_count=p.char_count
        )
        for p in doc.pages
    ]

    return schemas.DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        original_filename=doc.original_filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        file_size_formatted=doc.file_size_formatted,
        status=doc.status,
        page_count=doc.page_count,
        health_score=doc.health_score,
        upload_timestamp=doc.upload_timestamp,
        raw_text=doc.raw_text,
        preview_text=doc.raw_text[:200] if doc.raw_text else None,
        pages=pages_resp
    )


@app.delete(
    "/api/documents/{document_id}",
    tags=["Documents"],
    summary="Delete a document and its stored files"
)
def delete_document(document_id: int, db: DatabaseSession = Depends(get_db)):
    doc = db.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document with ID {document_id} not found.")

    file_path = BASE_DIR / doc.file_path
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception as e:
            print(f"[Delete] Warning: {e}")

    db.delete_document(document_id)
    return {"message": f"Document '{doc.original_filename}' deleted successfully."}


# ==========================================
# 10. Insights (GET /api/insights)
# ==========================================
@app.get(
    "/api/insights",
    response_model=List[schemas.InsightResponse],
    tags=["Insights & Analytics"],
    summary="List all extracted insights, conflicts, and critical items"
)
def get_insights(
    insight_type: Optional[str] = Query(default=None, description="Filter by: 'summary', 'conflict', 'missing', 'action', 'important_detail'"),
    document_id: Optional[int] = Query(default=None),
    db: DatabaseSession = Depends(get_db)
):
    insights = db.list_insights(insight_type=insight_type, document_id=document_id)
    return [
        schemas.InsightResponse(
            id=ins.id,
            document_id=ins.document_id,
            insight_type=ins.insight_type,
            title=ins.title,
            content=ins.content,
            severity=ins.severity,
            confidence=ins.confidence,
            source_reference=ins.source_reference,
            created_at=ins.created_at
        )
        for ins in insights
    ]


# ==========================================
# 11. Analytics (GET /api/analytics)
# ==========================================
@app.get(
    "/api/analytics",
    response_model=schemas.AnalyticsResponse,
    tags=["Insights & Analytics"],
    summary="Retrieve high-level dashboard metrics and Information Health Score"
)
def get_analytics(db: DatabaseSession = Depends(get_db)):
    data = db.get_analytics()
    return schemas.AnalyticsResponse(**data)


# ==========================================
# 12. Users (GET /api/users)
# ==========================================
@app.get(
    "/api/users",
    response_model=List[schemas.UserResponse],
    tags=["Users & Audit"],
    summary="List all users and analysts"
)
def list_users(db: DatabaseSession = Depends(get_db)):
    users = db.list_users()
    return [
        schemas.UserResponse(
            id=u.id,
            username=u.username,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            status=u.status,
            avatar_url=u.avatar_url,
            created_at=u.created_at
        )
        for u in users
    ]


@app.get(
    "/api/users/{user_id}",
    response_model=schemas.UserResponse,
    tags=["Users & Audit"],
    summary="Get user profile by ID"
)
def get_user(user_id: int, db: DatabaseSession = Depends(get_db)):
    user = db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found.")
    return schemas.UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        status=user.status,
        avatar_url=user.avatar_url,
        created_at=user.created_at
    )


# ==========================================
# 13. Stored Conflicts, Missing & Actions (Database Records)
# ==========================================
@app.get(
    "/api/conflicts/stored",
    response_model=List[schemas.ConflictDetailResponse],
    tags=["AI Features"],
    summary="List persistent conflict records from database"
)
def list_stored_conflicts(
    severity: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    db: DatabaseSession = Depends(get_db)
):
    conflicts = db.list_conflicts(severity=severity, status=status)
    return [
        schemas.ConflictDetailResponse(
            id=c.id,
            title=c.title,
            description=c.description,
            severity=c.severity,
            status=c.status,
            source_doc_id=c.source_doc_id,
            conflicting_doc_id=c.conflicting_doc_id,
            conflicting_sources_json=c.conflicting_sources_json,
            suggestion=c.suggestion,
            resolution_notes=c.resolution_notes,
            created_at=c.created_at
        )
        for c in conflicts
    ]


@app.get(
    "/api/missing/stored",
    response_model=List[schemas.MissingInfoDetailResponse],
    tags=["AI Features"],
    summary="List persistent missing information items from database"
)
def list_stored_missing(
    document_id: Optional[int] = Query(default=None),
    severity: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    db: DatabaseSession = Depends(get_db)
):
    items = db.list_missing_info(document_id=document_id, severity=severity, status=status)
    return [
        schemas.MissingInfoDetailResponse(
            id=m.id,
            document_id=m.document_id,
            category=m.category,
            item_name=m.item_name,
            description=m.description,
            severity=m.severity,
            impact=m.impact,
            recommendation=m.recommendation,
            status=m.status,
            created_at=m.created_at
        )
        for m in items
    ]


@app.get(
    "/api/actions/stored",
    response_model=List[schemas.ActionDetailResponse],
    tags=["AI Features"],
    summary="List persistent action recommendations from database"
)
def list_stored_actions(
    priority: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    document_id: Optional[int] = Query(default=None),
    db: DatabaseSession = Depends(get_db)
):
    acts = db.list_actions(priority=priority, status=status, document_id=document_id)
    return [
        schemas.ActionDetailResponse(
            id=a.id,
            document_id=a.document_id,
            conflict_id=a.conflict_id,
            missing_id=a.missing_id,
            step_number=a.step_number,
            title=a.title,
            description=a.description,
            priority=a.priority,
            category=a.category,
            status=a.status,
            due_date=a.due_date,
            responsible_entity=a.responsible_entity,
            created_at=a.created_at
        )
        for a in acts
    ]


# ==========================================
# 14. Health Scores Audits (GET /api/health-scores)
# ==========================================
@app.get(
    "/api/health-scores",
    response_model=List[schemas.HealthScoreResponse],
    tags=["Insights & Analytics"],
    summary="List computed Information Health Score audits"
)
def list_health_scores(
    document_id: Optional[int] = Query(default=None),
    db: DatabaseSession = Depends(get_db)
):
    scores = db.list_health_scores(document_id=document_id)
    return [
        schemas.HealthScoreResponse(
            id=h.id,
            document_id=h.document_id,
            overall_score=h.overall_score,
            completeness_score=h.completeness_score,
            consistency_score=h.consistency_score,
            clarity_score=h.clarity_score,
            compliance_score=h.compliance_score,
            factors_json=h.factors_json,
            calculated_at=h.calculated_at
        )
        for h in scores
    ]


# ==========================================
# 15. Search History (GET / POST /api/search-history)
# ==========================================
@app.get(
    "/api/search-history",
    response_model=List[schemas.SearchHistoryResponse],
    tags=["Users & Audit"],
    summary="Audit log of natural language queries and searches"
)
def list_search_history(
    limit: int = Query(default=50, ge=1, le=100),
    user_id: Optional[int] = Query(default=None),
    db: DatabaseSession = Depends(get_db)
):
    entries = db.list_search_history(limit=limit, user_id=user_id)
    return [
        schemas.SearchHistoryResponse(
            id=e.id,
            user_id=e.user_id,
            query=e.query,
            search_type=e.search_type,
            filters_json=e.filters_json,
            result_count=e.result_count,
            execution_time_ms=e.execution_time_ms,
            created_at=e.created_at
        )
        for e in entries
    ]


@app.post(
    "/api/search-history",
    response_model=schemas.SearchHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Users & Audit"],
    summary="Log a search or query operation into audit trail"
)
def log_search(
    entry: schemas.SearchHistoryCreate,
    db: DatabaseSession = Depends(get_db)
):
    record = models.SearchHistory(
        user_id=entry.user_id or 1,
        query=entry.query,
        search_type=entry.search_type or "keyword",
        filters_json=entry.filters_json or "{}",
        result_count=entry.result_count or 0,
        execution_time_ms=entry.execution_time_ms or 0.0
    )
    saved = db.create_search_entry(record)
    return schemas.SearchHistoryResponse(
        id=saved.id,
        user_id=saved.user_id,
        query=saved.query,
        search_type=saved.search_type,
        filters_json=saved.filters_json,
        result_count=saved.result_count,
        execution_time_ms=saved.execution_time_ms,
        created_at=saved.created_at
    )
