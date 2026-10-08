from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# Generic Source Reference
# ==========================================
class SourceReference(BaseModel):
    document_id: Optional[int] = None
    document_name: str
    page_number: Optional[int] = None
    snippet: Optional[str] = None
    confidence: Optional[float] = 0.95

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Document Schemas
# ==========================================
class DocumentPageResponse(BaseModel):
    page_number: int
    content: str
    char_count: int

    model_config = ConfigDict(from_attributes=True)


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_size_formatted: str
    status: str
    page_count: int
    health_score: float
    upload_timestamp: datetime
    preview_text: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentDetailResponse(DocumentResponse):
    raw_text: Optional[str] = None
    pages: List[DocumentPageResponse] = []

    model_config = ConfigDict(from_attributes=True)


class UploadResponse(BaseModel):
    message: str
    documents: List[DocumentResponse]
    failed_files: List[Dict[str, str]] = []


class DocumentProcessRequest(BaseModel):
    document_ids: Optional[List[int]] = Field(default=None, description="Optional list of doc IDs. If empty, processes all.")
    force_reprocess: Optional[bool] = Field(default=False, description="Whether to re-extract and re-analyze already processed docs.")


class ProcessResultItem(BaseModel):
    document_id: int
    filename: str
    status: str
    pages_extracted: int
    insights_generated: int
    health_score: float


class ProcessResponse(BaseModel):
    message: str
    processed_count: int
    results: List[ProcessResultItem]


# ==========================================
# Question Answering Schemas
# ==========================================
class AskRequest(BaseModel):
    question: str = Field(..., min_length=2, description="Natural language question to ask across documents.")
    document_ids: Optional[List[int]] = Field(default=None, description="Target specific document IDs, or search all if empty.")


class AskResponse(BaseModel):
    question: str
    answer: str
    sources: List[SourceReference]
    confidence_score: float


# ==========================================
# Summarization Schemas
# ==========================================
class SummarizeRequest(BaseModel):
    document_id: Optional[int] = Field(default=None, description="Single document ID to summarize.")
    document_ids: Optional[List[int]] = Field(default=None, description="Multiple document IDs to summarize together.")
    summary_type: Optional[str] = Field(default="executive", description="'executive', 'bullet', or 'detailed'")


class SummarizeResponse(BaseModel):
    overview: str
    key_points: List[str]
    health_score: float
    source_references: List[SourceReference]


# ==========================================
# Comparison Schemas
# ==========================================
class CompareRequest(BaseModel):
    doc1_id: int = Field(..., description="First document ID (e.g. baseline or previous version)")
    doc2_id: int = Field(..., description="Second document ID (e.g. revised or latest version)")


class ComparisonPoint(BaseModel):
    topic: str
    doc1_value: str
    doc2_value: str
    status: str = Field(..., description="'changed', 'added', or 'unchanged'")
    source_reference: Optional[str] = None


class CompareResponse(BaseModel):
    doc1_name: str
    doc2_name: str
    changed_points: List[ComparisonPoint]
    added_points: List[ComparisonPoint]
    unchanged_points: List[ComparisonPoint]
    summary: str


# ==========================================
# Conflict Detection Schemas
# ==========================================
class ConflictsRequest(BaseModel):
    document_ids: Optional[List[int]] = None


class ConflictItem(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    severity: str = Field(default="medium", description="'high', 'medium', or 'low'")
    conflicting_sources: List[SourceReference]
    suggestion: str


class ConflictsResponse(BaseModel):
    conflicts: List[ConflictItem]
    total_conflicts: int


# ==========================================
# Missing Information Schemas
# ==========================================
class MissingInfoRequest(BaseModel):
    document_ids: Optional[List[int]] = None


class MissingInfoItem(BaseModel):
    id: Optional[int] = None
    category: str
    item: str
    impact: str
    affected_document: str
    page_number: Optional[int] = None
    recommendation: str


class MissingInfoResponse(BaseModel):
    missing_items: List[MissingInfoItem]
    total_missing: int


# ==========================================
# Recommended Actions Schemas
# ==========================================
class ActionsRequest(BaseModel):
    document_ids: Optional[List[int]] = None


class ActionItem(BaseModel):
    step_number: int
    title: str
    description: str
    priority: str = Field(default="medium", description="'high', 'medium', or 'low'")
    due_date: Optional[str] = None
    responsible_entity: Optional[str] = None
    source_reference: Optional[str] = None


class ActionsResponse(BaseModel):
    actions: List[ActionItem]
    total_actions: int


# ==========================================
# Insights & Analytics Schemas
# ==========================================
class InsightResponse(BaseModel):
    id: int
    document_id: Optional[int] = None
    insight_type: str
    title: str
    content: str
    severity: str
    confidence: float
    source_reference: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalyticsResponse(BaseModel):
    documents_count: int
    important_details_count: int
    conflicts_count: int
    actions_count: int
    health_score: float
    file_type_breakdown: Dict[str, int]
    recent_activity: List[Dict[str, Any]]


# ==========================================
# New Table Schemas (Users, History, Scores)
# ==========================================
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    status: str
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ConflictDetailResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    source_doc_id: Optional[int] = None
    conflicting_doc_id: Optional[int] = None
    conflicting_sources_json: Optional[str] = "[]"
    suggestion: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MissingInfoDetailResponse(BaseModel):
    id: int
    document_id: Optional[int] = None
    category: str
    item_name: str
    description: str
    severity: str
    impact: Optional[str] = None
    recommendation: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ActionDetailResponse(BaseModel):
    id: int
    document_id: Optional[int] = None
    conflict_id: Optional[int] = None
    missing_id: Optional[int] = None
    step_number: int
    title: str
    description: str
    priority: str
    category: str
    status: str
    due_date: Optional[str] = None
    responsible_entity: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HealthScoreResponse(BaseModel):
    id: int
    document_id: Optional[int] = None
    overall_score: float
    completeness_score: float
    consistency_score: float
    clarity_score: float
    compliance_score: float
    factors_json: Optional[str] = "{}"
    calculated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SearchHistoryCreate(BaseModel):
    query: str
    search_type: Optional[str] = "keyword"
    filters_json: Optional[str] = "{}"
    result_count: Optional[int] = 0
    execution_time_ms: Optional[float] = 0.0
    user_id: Optional[int] = 1


class SearchHistoryResponse(BaseModel):
    id: int
    user_id: Optional[int] = 1
    query: str
    search_type: str
    filters_json: Optional[str] = "{}"
    result_count: int
    execution_time_ms: float
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

