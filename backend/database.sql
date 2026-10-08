-- ============================================================================
-- InfoMind AI - SQLite Production Database Schema & Baseline Demonstration Data
-- System: Intelligent Information Understanding & Processing System
-- Stack: FastAPI + SQLite + SQLAlchemy
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA encoding = 'UTF-8';

-- ============================================================================
-- 1. TABLE: users
-- Represents authenticated users, analysts, compliance officers, and admins.
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'analyst',           -- 'admin', 'compliance_officer', 'analyst', 'viewer'
    hashed_password TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'active',          -- 'active', 'inactive', 'suspended'
    avatar_url TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 2. TABLE: documents
-- Master catalog of uploaded files (PDF, DOCX, XLSX, TXT, Images).
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,                        -- 'pdf', 'docx', 'xlsx', 'txt', 'png', 'jpg'
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded',        -- 'uploaded', 'processing', 'processed', 'error'
    page_count INTEGER NOT NULL DEFAULT 1,
    health_score REAL NOT NULL DEFAULT 85.0,        -- 0.0 to 100.0 score
    raw_text TEXT,
    metadata_json TEXT,                             -- Extended extraction metadata (author, version, tags)
    upload_timestamp TEXT NOT NULL DEFAULT (DATETIME('now')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_upload_timestamp ON documents(upload_timestamp DESC);

-- ============================================================================
-- 3. TABLE: document_content
-- Granular storage of extracted pages, sheets, and semantic text segments.
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    page_number INTEGER NOT NULL DEFAULT 1,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    section_title TEXT DEFAULT NULL,
    content TEXT NOT NULL,
    char_count INTEGER NOT NULL DEFAULT 0,
    token_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_content_doc_id ON document_content(document_id);
CREATE INDEX IF NOT EXISTS idx_document_content_doc_page ON document_content(document_id, page_number);

-- Backward-compatibility view for legacy document_pages queries
CREATE VIEW IF NOT EXISTS document_pages AS
SELECT id, document_id, page_number, content, char_count
FROM document_content;

-- Trigger to support inserts into document_pages view seamlessly
CREATE TRIGGER IF NOT EXISTS trg_document_pages_insert
INSTEAD OF INSERT ON document_pages
BEGIN
    INSERT INTO document_content (document_id, page_number, content, char_count, chunk_index, token_count)
    VALUES (NEW.document_id, NEW.page_number, NEW.content, NEW.char_count, 0, ROUND(NEW.char_count / 4));
END;

CREATE TRIGGER IF NOT EXISTS trg_document_pages_delete
INSTEAD OF DELETE ON document_pages
BEGIN
    DELETE FROM document_content WHERE document_id = OLD.document_id;
END;

-- ============================================================================
-- 4. TABLE: insights
-- AI-extracted findings, critical details, policies, and semantic highlights.
-- ============================================================================
CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER DEFAULT NULL,
    user_id INTEGER DEFAULT 1,
    insight_type TEXT NOT NULL DEFAULT 'important_detail', -- 'important_detail', 'summary', 'action', 'conflict', 'missing', 'risk'
    category TEXT DEFAULT 'general',                       -- 'timeline', 'financial', 'compliance', 'operational'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',               -- 'low', 'medium', 'high', 'critical'
    confidence REAL NOT NULL DEFAULT 0.95,
    source_reference TEXT DEFAULT NULL,                    -- Citation: "Proposal_v1.pdf, Page 1"
    page_reference INTEGER DEFAULT NULL,
    metadata_json TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_insights_document_id ON insights(document_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_severity ON insights(severity);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at DESC);

-- ============================================================================
-- 5. TABLE: conflicts
-- Discrepancies, contradictions, and mismatched terms across documents.
-- ============================================================================
CREATE TABLE IF NOT EXISTS conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',               -- 'low', 'medium', 'high', 'critical'
    status TEXT NOT NULL DEFAULT 'unresolved',             -- 'unresolved', 'in_review', 'resolved', 'dismissed'
    source_doc_id INTEGER DEFAULT NULL,
    conflicting_doc_id INTEGER DEFAULT NULL,
    conflicting_sources_json TEXT DEFAULT '[]',            -- JSON array of source references
    suggestion TEXT DEFAULT NULL,
    resolution_notes TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    resolved_at TEXT DEFAULT NULL,
    FOREIGN KEY (source_doc_id) REFERENCES documents(id) ON DELETE SET NULL,
    FOREIGN KEY (conflicting_doc_id) REFERENCES documents(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_conflicts_severity ON conflicts(severity);
CREATE INDEX IF NOT EXISTS idx_conflicts_status ON conflicts(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_source_doc ON conflicts(source_doc_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_conflicting_doc ON conflicts(conflicting_doc_id);

-- ============================================================================
-- 6. TABLE: missing_information
-- Identified compliance gaps, absent contacts, signatures, and clauses.
-- ============================================================================
CREATE TABLE IF NOT EXISTS missing_information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER DEFAULT NULL,
    category TEXT NOT NULL DEFAULT 'general',              -- 'contact', 'approval', 'compliance', 'timeline', 'attachment'
    item_name TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',               -- 'low', 'medium', 'high', 'critical'
    impact TEXT DEFAULT NULL,
    recommendation TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'pending',                -- 'pending', 'resolved', 'ignored'
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_missing_info_doc_id ON missing_information(document_id);
CREATE INDEX IF NOT EXISTS idx_missing_info_severity ON missing_information(severity);
CREATE INDEX IF NOT EXISTS idx_missing_info_status ON missing_information(status);
CREATE INDEX IF NOT EXISTS idx_missing_info_category ON missing_information(category);

-- ============================================================================
-- 7. TABLE: comparisons
-- Multi-document comparative analysis reports (Changed, Added, Unchanged).
-- ============================================================================
CREATE TABLE IF NOT EXISTS comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc1_id INTEGER NOT NULL,
    doc2_id INTEGER NOT NULL,
    user_id INTEGER DEFAULT 1,
    title TEXT DEFAULT NULL,
    summary TEXT NOT NULL,
    changed_points_json TEXT DEFAULT '[]',
    added_points_json TEXT DEFAULT '[]',
    unchanged_points_json TEXT DEFAULT '[]',
    diff_data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (doc1_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (doc2_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_comparisons_doc1 ON comparisons(doc1_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_doc2 ON comparisons(doc2_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_created_at ON comparisons(created_at DESC);

-- ============================================================================
-- 8. TABLE: actions
-- Prioritized, sequenced recommended action items derived from analysis.
-- ============================================================================
CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER DEFAULT NULL,
    conflict_id INTEGER DEFAULT NULL,
    missing_id INTEGER DEFAULT NULL,
    step_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',               -- 'low', 'medium', 'high', 'urgent'
    category TEXT NOT NULL DEFAULT 'operational',          -- 'resolution', 'governance', 'compliance', 'operational'
    status TEXT NOT NULL DEFAULT 'pending',                -- 'pending', 'in_progress', 'completed', 'blocked'
    due_date TEXT DEFAULT NULL,
    responsible_entity TEXT DEFAULT NULL,                  -- 'PMO', 'Finance Controller', 'Operations Lead', 'Legal'
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    completed_at TEXT DEFAULT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    FOREIGN KEY (conflict_id) REFERENCES conflicts(id) ON DELETE SET NULL,
    FOREIGN KEY (missing_id) REFERENCES missing_information(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_actions_priority ON actions(priority);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_doc_id ON actions(document_id);
CREATE INDEX IF NOT EXISTS idx_actions_due_date ON actions(due_date);

-- ============================================================================
-- 9. TABLE: health_scores
-- Comprehensive health score audits assessing completeness, consistency, and clarity.
-- ============================================================================
CREATE TABLE IF NOT EXISTS health_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER DEFAULT NULL,                      -- NULL indicates global repository score
    overall_score REAL NOT NULL,                           -- 0.0 - 100.0
    completeness_score REAL NOT NULL,
    consistency_score REAL NOT NULL,
    clarity_score REAL NOT NULL,
    compliance_score REAL NOT NULL,
    factors_json TEXT DEFAULT '{}',
    calculated_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_health_scores_doc_id ON health_scores(document_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_calculated_at ON health_scores(calculated_at DESC);

-- ============================================================================
-- 10. TABLE: search_history
-- Audit log of user searches, queries, filters, and retrieval metrics.
-- ============================================================================
CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    query TEXT NOT NULL,
    search_type TEXT NOT NULL DEFAULT 'keyword',            -- 'keyword', 'semantic', 'filter', 'qa'
    filters_json TEXT DEFAULT '{}',
    result_count INTEGER NOT NULL DEFAULT 0,
    execution_time_ms REAL DEFAULT 0.0,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);

-- ============================================================================
-- 11. TABLE: qa_history
-- Audit log for natural language Q&A interactions and source citations.
-- ============================================================================
CREATE TABLE IF NOT EXISTS qa_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources_json TEXT DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_qa_history_created_at ON qa_history(created_at DESC);


-- ============================================================================
-- BASELINE DEMONSTRATION DATA (SEEDED AUTOMATICALLY)
-- ============================================================================

-- 1. Users
INSERT OR IGNORE INTO users (id, username, email, full_name, role, status, avatar_url, created_at)
VALUES
(1, 'sarah.connor', 'sarah.connor@infomind.ai', 'Sarah Connor', 'admin', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '2026-10-01 09:00:00'),
(2, 'alex.mercer', 'alex.mercer@infomind.ai', 'Alex Mercer', 'analyst', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '2026-10-02 10:15:00'),
(3, 'elena.rostova', 'elena.rostova@infomind.ai', 'Elena Rostova', 'compliance_officer', 'active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '2026-10-03 11:30:00');

-- 2. Documents
INSERT OR IGNORE INTO documents (id, user_id, filename, original_filename, file_type, file_size, file_path, status, page_count, health_score, raw_text, metadata_json, upload_timestamp)
VALUES
(
    1, 1, 'Proposal_v1.pdf', 'Proposal_v1.pdf', 'pdf', 4404019, 'uploads/Proposal_v1.pdf', 'processed', 5, 80.0,
    'InfoMind AI Project Proposal Version 1.0.
Executive Summary: Intelligent Information Understanding & Processing System.
Section 1: Scope & Objectives.
Project submission deadline: 20 October 2026.
Project budget: INR 1,10,00,000.
Department responsibilities: Engineering and Operations.
Approval required: Finance Department approval is required before phase 2 disbursement.
Contact Person: John Doe (email: j.doe@infomind.internal).',
    '{"author": "Planning Team", "version": "1.0", "department": "Executive Strategy"}',
    '2026-10-08 17:00:00'
),
(
    2, 2, 'Project_Report.pdf', 'Project_Report.pdf', 'pdf', 2936012, 'uploads/Project_Report.pdf', 'processed', 8, 75.0,
    'InfoMind AI Final Operational Report.
Section 1: Delivery Schedule and Timeline.
Revised project submission deadline: 25 October 2026.
Requirement: Digital signature is compulsory on all submission forms.
Budget status: Project budget remains INR 1,10,00,000.
Signatures: Pending lead architect sign-off.
Note: Missing direct emergency contact details for technical supervisor.',
    '{"author": "Operations Division", "version": "2.1", "department": "Technical Operations"}',
    '2026-10-08 17:10:00'
),
(
    3, 2, 'Department_Data.xlsx', 'Department_Data.xlsx', 'xlsx', 1572864, 'uploads/Department_Data.xlsx', 'processed', 3, 92.0,
    'Sheet: Department Budgets
Engineering: INR 60,00,000 | Status: On Track
Operations: INR 30,00,000 | Status: On Track
Compliance: INR 20,00,000 | Status: Pending Audit
Total Budget: INR 1,10,00,000
Approval: Finance Controller pending final stamp.',
    '{"sheets": ["Budgets", "Personnel", "Milestones"], "currency": "INR"}',
    '2026-10-08 17:15:00'
),
(
    4, 3, 'Vendor_SLA_2026.docx', 'Vendor_SLA_2026.docx', 'docx', 870400, 'uploads/Vendor_SLA_2026.docx', 'processed', 4, 88.0,
    'Master Services Agreement & SLA 2026.
Section 1: High Availability Infrastructure.
Uptime commitment: 99.95% monthly availability.
Tier-1 Critical Incident response window: 4 hours.
Governance: Escalations route to Cloud Infrastructure Steering Group.',
    '{"author": "Legal & Vendor Relations", "version": "3.0", "vendor": "CloudHost Enterprise"}',
    '2026-10-08 17:20:00'
);

-- 3. Document Content
INSERT OR IGNORE INTO document_content (id, document_id, page_number, chunk_index, section_title, content, char_count, token_count, created_at)
VALUES
(1, 1, 1, 0, 'Scope & Submission Deadline', 'InfoMind AI Project Proposal Version 1.0. Scope & Objectives. Project submission deadline: 20 October 2026. Project budget: INR 1,10,00,000.', 144, 36, '2026-10-08 17:00:00'),
(2, 1, 2, 1, 'Governance & Disbursements', 'Financial Governance: Finance Department approval is required before phase 2 disbursement. Lead contact: John Doe (email: j.doe@infomind.internal).', 147, 37, '2026-10-08 17:00:00'),
(3, 2, 1, 0, 'Revised Timeline & Digital Signature', 'Final Operational Report. Revised project submission deadline: 25 October 2026. Requirement: Cryptographic digital signature is compulsory on all forms.', 153, 38, '2026-10-08 17:10:00'),
(4, 2, 2, 1, 'Supervisor Contact & Compliance Gap', 'Compliance & Escalation: Signatures pending lead architect sign-off. Missing emergency contact details for technical supervisor in Section 4.', 141, 35, '2026-10-08 17:10:00'),
(5, 3, 1, 0, 'Department Budget Allocations', 'Department Budgets Sheet: Engineering INR 60,00,000. Operations INR 30,00,000. Compliance INR 20,00,000. Total INR 1,10,00,000. Finance Controller approval pending.', 164, 41, '2026-10-08 17:15:00'),
(6, 4, 1, 0, 'Cloud Infrastructure SLA', 'Cloud Infrastructure Service Level Agreement. Monthly availability target: 99.95%. Tier-1 Incident Response time: 4 hours from initial ticket generation.', 151, 37, '2026-10-08 17:20:00');

-- 4. Insights
INSERT OR IGNORE INTO insights (id, document_id, user_id, insight_type, category, title, content, severity, confidence, source_reference, page_reference, metadata_json, created_at)
VALUES
(1, 1, 1, 'important_detail', 'timeline', 'Project Submission Deadline (Proposal)', 'Project submission deadline is 20 October 2026.', 'medium', 0.98, 'Proposal_v1.pdf, Page 1', 1, '{"entity": "deadline", "value": "2026-10-20"}', '2026-10-08 17:01:00'),
(2, 2, 2, 'important_detail', 'timeline', 'Project Submission Deadline (Report)', 'Project submission deadline is 25 October 2026.', 'high', 0.97, 'Project_Report.pdf, Page 1', 1, '{"entity": "deadline", "value": "2026-10-25"}', '2026-10-08 17:11:00'),
(3, 1, 1, 'important_detail', 'financial', 'Finance Department Approval Required', 'Finance department approval is mandatory prior to phase 2 disbursement.', 'high', 0.96, 'Proposal_v1.pdf, Page 2', 2, '{"entity": "approval", "role": "Finance Controller"}', '2026-10-08 17:01:00'),
(4, 2, 2, 'important_detail', 'compliance', 'Digital Signature Requirement', 'Cryptographic digital signature is mandatory on all official submission forms.', 'medium', 0.95, 'Project_Report.pdf, Page 1', 1, '{"entity": "compliance", "standard": "PKI"}', '2026-10-08 17:11:00'),
(5, 3, 2, 'important_detail', 'financial', 'Total Budget Allocation', 'Total project budget confirmed at INR 1,10,00,000 across Engineering, Operations, and Compliance.', 'low', 0.99, 'Department_Data.xlsx, Sheet: Budgets', 1, '{"entity": "budget", "amount": 11000000, "currency": "INR"}', '2026-10-08 17:16:00'),
(6, 4, 3, 'important_detail', 'operational', 'Cloud Hosting SLA Commitment', 'Cloud host guarantees 99.95% monthly service uptime with 4-hour critical response window.', 'medium', 0.97, 'Vendor_SLA_2026.docx, Page 1', 1, '{"entity": "sla", "uptime": 99.95, "response_hours": 4}', '2026-10-08 17:21:00');

-- 5. Conflicts
INSERT OR IGNORE INTO conflicts (id, title, description, severity, status, source_doc_id, conflicting_doc_id, conflicting_sources_json, suggestion, resolution_notes, created_at)
VALUES
(
    1,
    'Conflicting Submission Deadlines',
    'Discrepancy detected: Proposal specifies 20 October 2026, while Report specifies 25 October 2026.',
    'high',
    'unresolved',
    1,
    2,
    '["Proposal_v1.pdf, Page 1", "Project_Report.pdf, Page 1"]',
    'Verify with Project Management Office whether 25 October represents an authorized extension.',
    'Under review with PMO steering committee.',
    '2026-10-08 17:12:00'
),
(
    2,
    'Digital Signature Mandate Discrepancy',
    'Report mandates cryptographic digital signature, whereas Proposal allows standard physical signature.',
    'medium',
    'in_review',
    1,
    2,
    '["Proposal_v1.pdf, Page 2", "Project_Report.pdf, Page 1"]',
    'Standardize all documentation on cryptographic digital signature protocol (PKI X.509).',
    'Security team endorsed digital signature standard.',
    '2026-10-08 17:12:00'
),
(
    3,
    'Critical Incident Response Window Discrepancy',
    'Vendor SLA specifies a 4-hour critical response window, while internal operational guidelines mandate 2 hours.',
    'high',
    'unresolved',
    2,
    4,
    '["Project_Report.pdf, Page 2", "Vendor_SLA_2026.docx, Page 1"]',
    'Negotiate Tier-1 incident response amendment to 2 hours with cloud provider.',
    NULL,
    '2026-10-08 17:22:00'
);

-- 6. Missing Information
INSERT OR IGNORE INTO missing_information (id, document_id, category, item_name, description, severity, impact, recommendation, status, created_at)
VALUES
(
    1,
    2,
    'contact',
    'Missing Technical Supervisor Contact',
    'Technical supervisor direct contact details (emergency phone number and email) are absent from Project_Report.pdf Section 4.',
    'medium',
    'Delays critical operational escalation during off-hours system outages.',
    'Insert official technical supervisor phone and emergency contact details in compliance addendum.',
    'pending',
    '2026-10-08 17:12:00'
),
(
    2,
    1,
    'approval',
    'Pending Finance Department Stamp',
    'Official Finance Department approval stamp and controller sign-off are absent from Phase 2 disbursement authorization form.',
    'high',
    'Phase 2 capital disbursement cannot be released without controller sign-off.',
    'Submit authorization package to Finance Controller for formal endorsement stamp.',
    'pending',
    '2026-10-08 17:02:00'
),
(
    3,
    4,
    'compliance',
    'Missing SLA Financial Penalty Schedule',
    'Vendor SLA contract lacks monetary penalty rebate schedule for availability drops below 98.0%.',
    'high',
    'Leaves organization financially exposed during severe third-party outages.',
    'Attach Schedule C detailing automated credit rebates for degraded performance tiers.',
    'pending',
    '2026-10-08 17:22:00'
);

-- 7. Comparisons
INSERT OR IGNORE INTO comparisons (id, doc1_id, doc2_id, user_id, title, summary, changed_points_json, added_points_json, unchanged_points_json, diff_data, created_at)
VALUES
(
    1,
    1,
    2,
    1,
    'Proposal v1.0 vs Project Report v2.1 Comparison',
    'Comparison between Proposal_v1.pdf and Project_Report.pdf. Submission deadline extended by 5 days (20 Oct -> 25 Oct), digital signature policy formalized, budget confirmed unchanged at INR 1,10,00,000.',
    '[{"topic": "Submission Deadline", "doc1_value": "20 October 2026", "doc2_value": "25 October 2026", "status": "changed", "impact": "High"}]',
    '[{"topic": "Digital Signature Policy", "doc1_value": "Standard signature", "doc2_value": "Mandatory cryptographic digital signature", "status": "added", "impact": "Medium"}]',
    '[{"topic": "Total Budget", "doc1_value": "INR 1,10,00,000", "doc2_value": "INR 1,10,00,000", "status": "unchanged", "impact": "None"}]',
    '{"changed": [{"topic": "Deadline", "doc1_value": "20 October 2026", "doc2_value": "25 October 2026", "status": "changed"}], "added": [{"topic": "Compliance", "doc1_value": "None", "doc2_value": "New requirement: Digital signature", "status": "added"}], "unchanged": [{"topic": "Budget", "doc1_value": "INR 1,10,00,000", "doc2_value": "INR 1,10,00,000", "status": "unchanged"}]}',
    '2026-10-08 17:25:00'
);

-- 8. Actions
INSERT OR IGNORE INTO actions (id, document_id, conflict_id, missing_id, step_number, title, description, priority, category, status, due_date, responsible_entity, created_at)
VALUES
(
    1, 1, 1, NULL, 1,
    'Verify the latest official deadline',
    'Reconcile 20 Oct vs 25 Oct deadlines with Project Management Office steering committee.',
    'high', 'resolution', 'in_progress', '2026-10-15', 'PMO Steering Committee', '2026-10-08 17:15:00'
),
(
    2, 1, NULL, 2, 2,
    'Obtain Finance Department approval',
    'Secure authorized controller sign-off and stamp before Phase 2 capital disbursement.',
    'high', 'governance', 'pending', '2026-10-18', 'Finance Controller', '2026-10-08 17:15:00'
),
(
    3, 2, NULL, 1, 3,
    'Add missing supervisor contact information',
    'Update Project_Report.pdf Section 4 with supervisor emergency phone number and secondary email.',
    'medium', 'operational', 'pending', '2026-10-19', 'Operations Lead', '2026-10-08 17:15:00'
),
(
    4, 2, 2, NULL, 4,
    'Complete cryptographic digital signature',
    'Ensure all submission forms and certificates are signed using verified cryptographic PKI key.',
    'medium', 'compliance', 'pending', '2026-10-22', 'Lead Architect', '2026-10-08 17:15:00'
),
(
    5, 2, 1, NULL, 5,
    'Submit the final report before 25 October 2026',
    'Package finalized documentation and transmit verified deliverable to Executive Board.',
    'urgent', 'resolution', 'pending', '2026-10-25', 'Executive Committee', '2026-10-08 17:15:00'
);

-- 9. Health Scores
INSERT OR IGNORE INTO health_scores (id, document_id, overall_score, completeness_score, consistency_score, clarity_score, compliance_score, factors_json, calculated_at)
VALUES
(
    1, NULL, 82.3, 85.0, 72.0, 90.0, 82.0,
    '{"conflicts_penalty": -15.0, "missing_info_penalty": -10.0, "high_clarity_bonus": 7.3, "status": "good"}',
    '2026-10-08 17:30:00'
),
(
    2, 1, 80.0, 82.0, 80.0, 85.0, 73.0,
    '{"pending_stamp": -20.0, "budget_verified": 10.0}',
    '2026-10-08 17:02:00'
),
(
    3, 2, 75.0, 72.0, 70.0, 82.0, 76.0,
    '{"missing_contacts": -15.0, "deadline_conflict": -10.0}',
    '2026-10-08 17:12:00'
),
(
    4, 3, 92.0, 95.0, 95.0, 90.0, 88.0,
    '{"structured_tables": 10.0, "zero_conflicts": 5.0}',
    '2026-10-08 17:16:00'
),
(
    5, 4, 88.0, 86.0, 85.0, 92.0, 89.0,
    '{"uptime_guaranteed": 8.0, "penalty_schedule_gap": -10.0}',
    '2026-10-08 17:22:00'
);

-- 10. Search History
INSERT OR IGNORE INTO search_history (id, user_id, query, search_type, filters_json, result_count, execution_time_ms, created_at)
VALUES
(1, 1, 'project submission deadline', 'semantic', '{"file_type": "pdf"}', 2, 14.2, '2026-10-08 17:31:00'),
(2, 2, 'budget allocation INR 1,10,00,000', 'keyword', '{}', 3, 8.5, '2026-10-08 17:32:00'),
(3, 3, 'digital signature compliance requirement', 'filter', '{"status": "processed"}', 2, 11.4, '2026-10-08 17:33:00'),
(4, 1, 'who is the technical supervisor?', 'qa', '{}', 1, 24.8, '2026-10-08 17:34:00');

-- 11. QA History
INSERT OR IGNORE INTO qa_history (id, user_id, question, answer, sources_json, created_at)
VALUES
(
    1, 1,
    'What is the project submission deadline?',
    'Based on Proposal_v1.pdf (Page 1), the original deadline is 20 October 2026. However, Project_Report.pdf (Page 1) cites a revised deadline of 25 October 2026. This creates an open timeline conflict requiring PMO reconciliation.',
    '[{"filename": "Proposal_v1.pdf", "page_number": 1, "quote": "Project submission deadline: 20 October 2026."}, {"filename": "Project_Report.pdf", "page_number": 1, "quote": "Revised project submission deadline: 25 October 2026."}]',
    '2026-10-08 17:35:00'
),
(
    2, 2,
    'What is the total project budget?',
    'The total allocated project budget is INR 1,10,00,000 across Engineering (60L), Operations (30L), and Compliance (20L), as confirmed in Proposal_v1.pdf (Page 2) and Department_Data.xlsx (Sheet: Budgets).',
    '[{"filename": "Proposal_v1.pdf", "page_number": 2, "quote": "Project budget: INR 1,10,00,000."}, {"filename": "Department_Data.xlsx", "page_number": 1, "quote": "Total Budget: INR 1,10,00,000."}]',
    '2026-10-08 17:36:00'
);
