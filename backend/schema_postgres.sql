-- =========================================================
-- InfoMind AI - PostgreSQL Schema Migration Script
-- =========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    upload_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'uploaded',
    page_count INTEGER DEFAULT 1,
    health_score DOUBLE PRECISION DEFAULT 85.0,
    raw_text TEXT,
    metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_upload_timestamp ON documents(upload_timestamp DESC);

-- 2. Document Pages Table
CREATE TABLE IF NOT EXISTS document_pages (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    char_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_document_pages_doc_id ON document_pages(document_id);

-- 3. Insights Table
CREATE TABLE IF NOT EXISTS insights (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    confidence DOUBLE PRECISION DEFAULT 0.95,
    source_reference VARCHAR(255),
    metadata_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_doc_id ON insights(document_id);

-- 4. Multi-Document Comparisons Table
CREATE TABLE IF NOT EXISTS comparisons (
    id SERIAL PRIMARY KEY,
    doc1_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    doc2_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    diff_data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. QA History Table
CREATE TABLE IF NOT EXISTS qa_history (
    id SERIAL PRIMARY KEY,
    question VARCHAR(1000) NOT NULL,
    answer TEXT NOT NULL,
    sources_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
