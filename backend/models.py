"""
InfoMind AI - Unified ORM & Data Models
Intelligent Information Understanding & Processing System
Includes all 10 Core Tables:
1. users
2. documents
3. document_content (with DocumentPage backward compatibility)
4. insights
5. conflicts
6. missing_information
7. comparisons (with ComparisonRecord backward compatibility)
8. actions
9. health_scores
10. search_history
(plus qa_history)
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

# Dynamic SQLAlchemy import with graceful pure-Python fallback for restricted environments
try:
    from sqlalchemy import (
        Column, Integer, String, Float, Text, DateTime, ForeignKey, Index, Boolean
    )
    from sqlalchemy.orm import declarative_base, relationship
    Base = declarative_base()
    HAS_SQLALCHEMY = True
except Exception:
    HAS_SQLALCHEMY = False
    class Base:
        pass
    def Column(*args, **kwargs): return None
    def Integer(*args, **kwargs): return None
    def String(*args, **kwargs): return None
    def Float(*args, **kwargs): return None
    def Text(*args, **kwargs): return None
    def DateTime(*args, **kwargs): return None
    def ForeignKey(*args, **kwargs): return None
    def Index(*args, **kwargs): return None
    def Boolean(*args, **kwargs): return None
    def relationship(*args, **kwargs): return None


# ============================================================================
# 1. User Model
# ============================================================================
class User(Base):
    """Represents an authenticated user, analyst, or administrator."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="analyst", index=True)
    hashed_password = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="active")
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")

    def __init__(
        self,
        id: Optional[int] = None,
        username: str = "",
        email: str = "",
        full_name: str = "",
        role: str = "analyst",
        hashed_password: Optional[str] = None,
        status: str = "active",
        avatar_url: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.username = username
        self.email = email
        self.full_name = full_name
        self.role = role
        self.hashed_password = hashed_password
        self.status = status
        self.avatar_url = avatar_url
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "status": self.status,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# ============================================================================
# 2. Document Model
# ============================================================================
class Document(Base):
    """Represents an uploaded and indexed document."""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, default=1, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False, index=True)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False, default="uploaded", index=True)
    page_count = Column(Integer, nullable=False, default=1)
    health_score = Column(Float, nullable=False, default=85.0)
    raw_text = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    upload_timestamp = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="documents")
    contents = relationship("DocumentContent", back_populates="document", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="document", cascade="all, delete-orphan")
    missing_items = relationship("MissingInformation", back_populates="document", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="document")
    health_scores = relationship("HealthScore", back_populates="document", cascade="all, delete-orphan")

    def __init__(
        self,
        id: Optional[int] = None,
        filename: str = "",
        original_filename: str = "",
        file_type: str = "pdf",
        file_size: int = 0,
        file_path: str = "",
        upload_timestamp: Optional[datetime] = None,
        status: str = "uploaded",
        page_count: int = 1,
        health_score: float = 85.0,
        raw_text: Optional[str] = None,
        metadata_json: Optional[str] = None,
        pages: Optional[List["DocumentContent"]] = None,
        insights: Optional[List["Insight"]] = None,
        user_id: Optional[int] = 1,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.filename = filename
        self.original_filename = original_filename
        self.file_type = file_type
        self.file_size = file_size
        self.file_path = file_path
        self.upload_timestamp = upload_timestamp or datetime.now(timezone.utc)
        self.status = status
        self.page_count = page_count
        self.health_score = health_score
        self.raw_text = raw_text
        self.metadata_json = metadata_json
        self.user_id = user_id or 1
        self.updated_at = updated_at or datetime.now(timezone.utc)
        self.pages = pages or []
        self.insights = insights or []

    @property
    def file_size_formatted(self) -> str:
        size = self.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / (1024 * 1024):.1f} MB"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "filename": self.filename,
            "original_filename": self.original_filename,
            "file_type": self.file_type,
            "file_size": self.file_size,
            "file_size_formatted": self.file_size_formatted,
            "status": self.status,
            "page_count": self.page_count,
            "health_score": self.health_score,
            "upload_timestamp": self.upload_timestamp.isoformat() if self.upload_timestamp else None
        }


# ============================================================================
# 3. Document Content Model (and DocumentPage Alias)
# ============================================================================
class DocumentContent(Base):
    """Represents an extracted page, sheet, or chunk within a document."""
    __tablename__ = "document_content"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False, default=1)
    chunk_index = Column(Integer, nullable=False, default=0)
    section_title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    char_count = Column(Integer, nullable=False, default=0)
    token_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="contents")

    def __init__(
        self,
        id: Optional[int] = None,
        document_id: int = 0,
        page_number: int = 1,
        content: str = "",
        char_count: int = 0,
        chunk_index: int = 0,
        section_title: Optional[str] = None,
        token_count: int = 0,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.document_id = document_id
        self.page_number = page_number
        self.content = content
        self.char_count = char_count or len(content)
        self.chunk_index = chunk_index
        self.section_title = section_title
        self.token_count = token_count or max(1, len(content) // 4)
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "page_number": self.page_number,
            "chunk_index": self.chunk_index,
            "section_title": self.section_title,
            "content": self.content,
            "char_count": self.char_count,
            "token_count": self.token_count
        }


# Backward-compatible alias
DocumentPage = DocumentContent


# ============================================================================
# 4. Insight Model
# ============================================================================
class Insight(Base):
    """Represents an AI-extracted insight, highlight, or critical finding."""
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, default=1)
    insight_type = Column(String(50), nullable=False, default="important_detail", index=True)
    category = Column(String(100), nullable=True, default="general")
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False, default="medium", index=True)
    confidence = Column(Float, nullable=False, default=0.95)
    source_reference = Column(String(255), nullable=True)
    page_reference = Column(Integer, nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    document = relationship("Document", back_populates="insights")

    def __init__(
        self,
        id: Optional[int] = None,
        document_id: Optional[int] = None,
        insight_type: str = "important_detail",
        title: str = "",
        content: str = "",
        severity: str = "medium",
        confidence: float = 0.95,
        source_reference: Optional[str] = None,
        metadata_json: Optional[str] = None,
        created_at: Optional[datetime] = None,
        user_id: Optional[int] = 1,
        category: str = "general",
        page_reference: Optional[int] = None
    ):
        self.id = id
        self.document_id = document_id
        self.insight_type = insight_type
        self.title = title
        self.content = content
        self.severity = severity
        self.confidence = confidence
        self.source_reference = source_reference
        self.metadata_json = metadata_json
        self.created_at = created_at or datetime.now(timezone.utc)
        self.user_id = user_id or 1
        self.category = category
        self.page_reference = page_reference

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "insight_type": self.insight_type,
            "category": self.category,
            "title": self.title,
            "content": self.content,
            "severity": self.severity,
            "confidence": self.confidence,
            "source_reference": self.source_reference,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# ============================================================================
# 5. Conflict Model
# ============================================================================
class Conflict(Base):
    """Represents a discrepancy or contradiction detected between documents."""
    __tablename__ = "conflicts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False, default="medium", index=True)
    status = Column(String(50), nullable=False, default="unresolved", index=True)
    source_doc_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    conflicting_doc_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    conflicting_sources_json = Column(Text, nullable=True, default="[]")
    suggestion = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    source_document = relationship("Document", foreign_keys=[source_doc_id])
    conflicting_document = relationship("Document", foreign_keys=[conflicting_doc_id])
    actions = relationship("Action", back_populates="conflict")

    def __init__(
        self,
        id: Optional[int] = None,
        title: str = "",
        description: str = "",
        severity: str = "medium",
        status: str = "unresolved",
        source_doc_id: Optional[int] = None,
        conflicting_doc_id: Optional[int] = None,
        conflicting_sources_json: Optional[str] = "[]",
        suggestion: Optional[str] = None,
        resolution_notes: Optional[str] = None,
        created_at: Optional[datetime] = None,
        resolved_at: Optional[datetime] = None
    ):
        self.id = id
        self.title = title
        self.description = description
        self.severity = severity
        self.status = status
        self.source_doc_id = source_doc_id
        self.conflicting_doc_id = conflicting_doc_id
        self.conflicting_sources_json = conflicting_sources_json or "[]"
        self.suggestion = suggestion
        self.resolution_notes = resolution_notes
        self.created_at = created_at or datetime.now(timezone.utc)
        self.resolved_at = resolved_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "status": self.status,
            "source_doc_id": self.source_doc_id,
            "conflicting_doc_id": self.conflicting_doc_id,
            "conflicting_sources_json": self.conflicting_sources_json,
            "suggestion": self.suggestion,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# ============================================================================
# 6. Missing Information Model
# ============================================================================
class MissingInformation(Base):
    """Represents an identified missing requirement, contact, or compliance gap."""
    __tablename__ = "missing_information"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    category = Column(String(100), nullable=False, default="general", index=True)
    item_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False, default="medium", index=True)
    impact = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="pending", index=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="missing_items")
    actions = relationship("Action", back_populates="missing_info")

    def __init__(
        self,
        id: Optional[int] = None,
        document_id: Optional[int] = None,
        category: str = "general",
        item_name: str = "",
        description: str = "",
        severity: str = "medium",
        impact: Optional[str] = None,
        recommendation: Optional[str] = None,
        status: str = "pending",
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.document_id = document_id
        self.category = category
        self.item_name = item_name
        self.description = description
        self.severity = severity
        self.impact = impact
        self.recommendation = recommendation
        self.status = status
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "category": self.category,
            "item_name": self.item_name,
            "description": self.description,
            "severity": self.severity,
            "impact": self.impact,
            "recommendation": self.recommendation,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# ============================================================================
# 7. Comparison Model (and ComparisonRecord Alias)
# ============================================================================
class Comparison(Base):
    """Represents a multi-document comparison report."""
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    doc1_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    doc2_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, default=1)
    title = Column(String(255), nullable=True)
    summary = Column(Text, nullable=False)
    changed_points_json = Column(Text, nullable=True, default="[]")
    added_points_json = Column(Text, nullable=True, default="[]")
    unchanged_points_json = Column(Text, nullable=True, default="[]")
    diff_data = Column(Text, nullable=False, default="{}")
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    doc1 = relationship("Document", foreign_keys=[doc1_id])
    doc2 = relationship("Document", foreign_keys=[doc2_id])

    def __init__(
        self,
        id: Optional[int] = None,
        doc1_id: int = 0,
        doc2_id: int = 0,
        summary: str = "",
        diff_data: str = "{}",
        created_at: Optional[datetime] = None,
        user_id: Optional[int] = 1,
        title: Optional[str] = None,
        changed_points_json: Optional[str] = "[]",
        added_points_json: Optional[str] = "[]",
        unchanged_points_json: Optional[str] = "[]"
    ):
        self.id = id
        self.doc1_id = doc1_id
        self.doc2_id = doc2_id
        self.summary = summary
        self.diff_data = diff_data
        self.created_at = created_at or datetime.now(timezone.utc)
        self.user_id = user_id or 1
        self.title = title
        self.changed_points_json = changed_points_json or "[]"
        self.added_points_json = added_points_json or "[]"
        self.unchanged_points_json = unchanged_points_json or "[]"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "doc1_id": self.doc1_id,
            "doc2_id": self.doc2_id,
            "title": self.title,
            "summary": self.summary,
            "diff_data": self.diff_data,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# Backward-compatible alias
ComparisonRecord = Comparison


# ============================================================================
# 8. Action Model
# ============================================================================
class Action(Base):
    """Represents a prioritized, sequenced recommended next step."""
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    conflict_id = Column(Integer, ForeignKey("conflicts.id", ondelete="SET NULL"), nullable=True)
    missing_id = Column(Integer, ForeignKey("missing_information.id", ondelete="SET NULL"), nullable=True)
    step_number = Column(Integer, nullable=False, default=1)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), nullable=False, default="medium", index=True)
    category = Column(String(100), nullable=False, default="operational")
    status = Column(String(50), nullable=False, default="pending", index=True)
    due_date = Column(String(50), nullable=True, index=True)
    responsible_entity = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    document = relationship("Document", back_populates="actions")
    conflict = relationship("Conflict", back_populates="actions")
    missing_info = relationship("MissingInformation", back_populates="actions")

    def __init__(
        self,
        id: Optional[int] = None,
        document_id: Optional[int] = None,
        conflict_id: Optional[int] = None,
        missing_id: Optional[int] = None,
        step_number: int = 1,
        title: str = "",
        description: str = "",
        priority: str = "medium",
        category: str = "operational",
        status: str = "pending",
        due_date: Optional[str] = None,
        responsible_entity: Optional[str] = None,
        created_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None
    ):
        self.id = id
        self.document_id = document_id
        self.conflict_id = conflict_id
        self.missing_id = missing_id
        self.step_number = step_number
        self.title = title
        self.description = description
        self.priority = priority
        self.category = category
        self.status = status
        self.due_date = due_date
        self.responsible_entity = responsible_entity
        self.created_at = created_at or datetime.now(timezone.utc)
        self.completed_at = completed_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "conflict_id": self.conflict_id,
            "missing_id": self.missing_id,
            "step_number": self.step_number,
            "title": self.title,
            "description": self.description,
            "priority": self.priority,
            "category": self.category,
            "status": self.status,
            "due_date": self.due_date,
            "responsible_entity": self.responsible_entity,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# ============================================================================
# 9. Health Score Model
# ============================================================================
class HealthScore(Base):
    """Represents a computed Information Health Score audit."""
    __tablename__ = "health_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    overall_score = Column(Float, nullable=False)
    completeness_score = Column(Float, nullable=False)
    consistency_score = Column(Float, nullable=False)
    clarity_score = Column(Float, nullable=False)
    compliance_score = Column(Float, nullable=False)
    factors_json = Column(Text, nullable=True, default="{}")
    calculated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    document = relationship("Document", back_populates="health_scores")

    def __init__(
        self,
        id: Optional[int] = None,
        document_id: Optional[int] = None,
        overall_score: float = 85.0,
        completeness_score: float = 85.0,
        consistency_score: float = 85.0,
        clarity_score: float = 85.0,
        compliance_score: float = 85.0,
        factors_json: Optional[str] = "{}",
        calculated_at: Optional[datetime] = None
    ):
        self.id = id
        self.document_id = document_id
        self.overall_score = overall_score
        self.completeness_score = completeness_score
        self.consistency_score = consistency_score
        self.clarity_score = clarity_score
        self.compliance_score = compliance_score
        self.factors_json = factors_json or "{}"
        self.calculated_at = calculated_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "overall_score": self.overall_score,
            "completeness_score": self.completeness_score,
            "consistency_score": self.consistency_score,
            "clarity_score": self.clarity_score,
            "compliance_score": self.compliance_score,
            "factors_json": self.factors_json,
            "calculated_at": self.calculated_at.isoformat() if self.calculated_at else None
        }


# ============================================================================
# 10. Search History Model
# ============================================================================
class SearchHistory(Base):
    """Represents an audit entry for user searches and queries."""
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, default=1, index=True)
    query = Column(String(500), nullable=False, index=True)
    search_type = Column(String(50), nullable=False, default="keyword")
    filters_json = Column(Text, nullable=True, default="{}")
    result_count = Column(Integer, nullable=False, default=0)
    execution_time_ms = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="search_history")

    def __init__(
        self,
        id: Optional[int] = None,
        user_id: Optional[int] = 1,
        query: str = "",
        search_type: str = "keyword",
        filters_json: Optional[str] = "{}",
        result_count: int = 0,
        execution_time_ms: float = 0.0,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.user_id = user_id or 1
        self.query = query
        self.search_type = search_type
        self.filters_json = filters_json or "{}"
        self.result_count = result_count
        self.execution_time_ms = execution_time_ms
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "query": self.query,
            "search_type": self.search_type,
            "filters_json": self.filters_json,
            "result_count": self.result_count,
            "execution_time_ms": self.execution_time_ms,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# ============================================================================
# 11. QA History Model
# ============================================================================
class QAHistory(Base):
    """Represents interactive natural language Q&A logs and citations."""
    __tablename__ = "qa_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, default=1)
    question = Column(String(500), nullable=False)
    answer = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True, default="[]")
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    def __init__(
        self,
        id: Optional[int] = None,
        question: str = "",
        answer: str = "",
        sources_json: str = "[]",
        created_at: Optional[datetime] = None,
        user_id: Optional[int] = 1
    ):
        self.id = id
        self.question = question
        self.answer = answer
        self.sources_json = sources_json
        self.created_at = created_at or datetime.now(timezone.utc)
        self.user_id = user_id or 1

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "question": self.question,
            "answer": self.answer,
            "sources_json": self.sources_json,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
