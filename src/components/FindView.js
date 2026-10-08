// InfoMind AI - Stage 1: FIND (Discovery & Ingestion View)
import { stateService } from '../services/api.js';
import { openEvidenceModal } from './EvidenceModal.js';
import { showToast } from './Toast.js';

export function renderFindView(container) {
  const state = stateService.getState();
  const docs = state.scenario.documents;

  container.innerHTML = `
    <div class="view-content-wrapper">
      <!-- Hero Banner -->
      <div class="section-hero-banner">
        <div class="hero-left">
          <div class="hero-badge">
            <span style="color: var(--primary-600); font-weight: 800;">PHASE 01</span>
            <span>Discovery & Vector Indexing</span>
          </div>
          <h1 class="hero-title">FIND: Multi-Format Ingestion & Semantic Discovery</h1>
          <p class="hero-desc">
            Ingest unstructured business documents across PDF, DOCX, XLSX, images, and TXT. The engine parses hierarchy, runs AST extraction, and establishes semantic cross-references.
          </p>
        </div>
        <div class="hero-actions">
          <button class="btn-primary" id="btn-hero-sample-add">
            <span>+ Load Sample Asset</span>
          </button>
        </div>
      </div>

      <!-- Main Ingestion & Search Grid -->
      <div class="find-grid">
        <!-- Left Column: Upload Dropzone & Quick Samples -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="im-card">
            <div class="im-card-header">
              <div class="card-title-group">
                <div class="card-title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div>
                  <h2 class="card-title">Universal Document Uploader</h2>
                  <p class="card-subtitle">AI-assisted OCR & structural parsing</p>
                </div>
              </div>
            </div>

            <div class="upload-dropzone" id="find-dropzone">
              <div class="dropzone-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <p style="font-weight: 700; color: var(--slate-800); font-size: 0.95rem;">Drag & drop business files here</p>
                <p style="font-size: 0.78rem; color: var(--slate-500); margin-top: 2px;">or click to browse your local computer</p>
              </div>

              <div class="supported-formats">
                <span class="format-pill">PDF</span>
                <span class="format-pill">DOCX</span>
                <span class="format-pill">XLSX</span>
                <span class="format-pill">TXT</span>
                <span class="format-pill">PNG / JPG</span>
              </div>
              <input type="file" id="find-file-input" multiple style="display: none;" accept=".pdf,.docx,.xlsx,.txt,.csv,.json,.png,.jpg,.jpeg" />
            </div>

            <div class="quick-samples-bar">
              <span class="quick-samples-title">Pre-built Enterprise Demo Batches:</span>
              <div style="display: flex; gap: 6px;">
                <button class="btn-sample-trigger" data-scenario="ma_due_diligence">M&A Dataroom</button>
                <button class="btn-sample-trigger" data-scenario="clinical_trial_compliance">FDA Trial</button>
                <button class="btn-sample-trigger" data-scenario="cloud_sla_audit">Cloud SLA</button>
              </div>
            </div>
          </div>

          <!-- Semantic Search Card -->
          <div class="im-card">
            <div class="im-card-header">
              <div class="card-title-group">
                <div class="card-title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </div>
                <div>
                  <h2 class="card-title">Cognitive Semantic Query</h2>
                  <p class="card-subtitle">Natural-language questions with verified evidence</p>
                </div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; gap: 8px;">
                <input 
                  type="text" 
                  id="semantic-search-box" 
                  class="global-search-input" 
                  style="border-radius: var(--radius-md); padding-left: 14px;" 
                  placeholder="Ask a question across all ingested files..." 
                />
                <button class="btn-primary" id="btn-run-query" style="flex-shrink: 0;">Query AI</button>
              </div>

              <div>
                <p style="font-size: 0.72rem; font-weight: 700; color: var(--slate-500); margin-bottom: 6px;">
                  SUGGESTED DISCOVERY QUERIES:
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;" id="query-chips">
                  <button class="btn-sample-trigger q-chip">What is the purchase price & liability cap?</button>
                  <button class="btn-sample-trigger q-chip">Are there conflicting payment terms?</button>
                  <button class="btn-sample-trigger q-chip">What is the transaction closing date?</button>
                  <button class="btn-sample-trigger q-chip">List early termination penalties</button>
                </div>
              </div>

              <div id="query-result-box" style="display: none; margin-top: 8px;"></div>
            </div>
          </div>
        </div>

        <!-- Right Column: Document Vault & Repository -->
        <div class="im-card" style="display: flex; flex-direction: column;">
          <div class="im-card-header">
            <div class="card-title-group">
              <div class="card-title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                </svg>
              </div>
              <div>
                <h2 class="card-title">Document Vault (${docs.length} Active)</h2>
                <p class="card-subtitle">Parsed and indexed into the active workspace</p>
              </div>
            </div>
            <button class="btn-secondary" id="btn-next-to-understand" style="font-size: 0.76rem; font-weight: 700;">
              Next: Understand Stage →
            </button>
          </div>

          <div class="doc-table-container">
            <table class="doc-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Department</th>
                  <th>Pages</th>
                  <th>Health</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${docs.map(doc => `
                  <tr class="${doc.id === state.activeDocId ? 'active-row' : ''}">
                    <td>
                      <div class="doc-name-cell" data-docid="${doc.id}">
                        <span class="doc-type-icon type-${doc.type}">${doc.type.toUpperCase()}</span>
                        <div>
                          <div>${escapeHtml(doc.name)}</div>
                          <div class="doc-meta-sub">${doc.size} • ${doc.date}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style="font-size: 0.76rem; font-weight: 600; color: var(--slate-700);">
                        ${escapeHtml(doc.department || 'Corporate')}
                      </span>
                    </td>
                    <td>
                      <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--slate-600);">
                        ${doc.pages || 1}
                      </span>
                    </td>
                    <td>
                      <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: var(--radius-full); background: ${doc.health >= 85 ? 'var(--emerald-50)' : 'var(--amber-50)'}; color: ${doc.health >= 85 ? 'var(--emerald-700)' : 'var(--amber-700)'};">
                        ${doc.health || 85}%
                      </span>
                    </td>
                    <td>
                      <button class="btn-sample-trigger btn-inspect-doc-table" data-docid="${doc.id}">
                        Understand ➔
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Events
  const dropzone = container.querySelector('#find-dropzone');
  const fileInput = container.querySelector('#find-file-input');
  const ingestFiles = async (files) => {
    try {
      await stateService.uploadFiles(files);
      const message = stateService.getState().isBackendConnected
        ? 'Documents processed and saved to the database.'
        : 'Documents parsed in this browser. Start the backend to save them to the database.';
      showToast(message, stateService.getState().isBackendConnected ? 'success' : 'info');
    } catch (error) {
      showToast(error.message || 'Unable to process the selected files.', 'error');
    }
  };

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      showToast(`Ingesting ${e.dataTransfer.files.length} document(s)...`, "info");
      await ingestFiles(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      showToast(`Ingesting ${e.target.files.length} document(s)...`, "info");
      await ingestFiles(Array.from(e.target.files));
      fileInput.value = '';
    }
  });

  // Sample scenario triggers
  container.querySelectorAll('.btn-sample-trigger[data-scenario]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sc = btn.getAttribute('data-scenario');
      stateService.setScenario(sc);
      showToast(`Loaded ${btn.textContent} batch!`, "success");
    });
  });

  container.querySelector('#btn-hero-sample-add')?.addEventListener('click', () => {
    // Generate a quick simulated document addition
    const dummyBlob = new Blob([
      "SCHEDULE C: EMPLOYEE RETENTION INCENTIVE ADDENDUM\nTitan Technologies agrees to provide $600,000 in key engineering retention pool upon merger closing on November 15, 2026."
    ], { type: 'text/plain' });
    const dummyFile = new File([dummyBlob], "Schedule_C_Retention_Addendum.txt", { type: 'text/plain' });
    ingestFiles([dummyFile]);
  });

  // Table row click
  container.querySelectorAll('.btn-inspect-doc-table, .doc-name-cell').forEach(el => {
    el.addEventListener('click', () => {
      const docId = el.getAttribute('data-docid');
      stateService.setActiveDoc(docId);
      stateService.setStage('understand');
    });
  });

  // Next Stage Button
  container.querySelector('#btn-next-to-understand')?.addEventListener('click', () => {
    stateService.setStage('understand');
  });

  // Semantic Query box execution
  const queryInput = container.querySelector('#semantic-search-box');
  const resultBox = container.querySelector('#query-result-box');

  const executeSemanticQuery = async (q) => {
    if (!q || !q.trim()) return;
    resultBox.style.display = 'block';
    resultBox.textContent = 'Searching documents...';

    try {
      const response = stateService.getState().isBackendConnected
        ? await stateService.askDocuments(q)
        : { answer: null, results: stateService.searchDocuments(q) };
      const { answer, results } = response;
      if (results.length === 0) {
      resultBox.innerHTML = `
        <div style="padding: 12px; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); font-size: 0.8rem; color: var(--slate-600);">
          ${answer ? escapeHtml(answer) : 'No relevant matches found for this query across current documents.'}
        </div>
      `;
      } else {
        const top = results[0];
        resultBox.innerHTML = `
        <div style="background: var(--primary-50); border: 1px solid var(--primary-200); border-radius: var(--radius-md); padding: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 0.76rem; font-weight: 700; color: var(--primary-800);">
              Cognitive Answer Citation
            </span>
            <span class="confidence-tag">${top.confidence}% Match</span>
          </div>
          <div style="font-size: 0.84rem; color: var(--slate-800); line-height: 1.5; font-family: var(--font-mono); margin-bottom: 8px;">
            "${escapeHtml(answer || top.quote)}"
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.72rem; color: var(--slate-500);">
              Source: ${escapeHtml(top.docName)} (Page ${top.page})
            </span>
            <button class="btn-sample-trigger" id="btn-view-evidence-query" style="background: #ffffff;">
              Verify in Original 🔍
            </button>
          </div>
        </div>
      `;

        resultBox.querySelector('#btn-view-evidence-query')?.addEventListener('click', () => {
          openEvidenceModal({
            docName: top.docName,
            page: top.page,
            section: top.department,
            quote: top.quote,
            confidence: top.confidence
          });
        });
      }
    } catch (error) {
      resultBox.innerHTML = `
        <div style="padding: 12px; background: var(--rose-50); border: 1px solid var(--rose-500); border-radius: var(--radius-md); font-size: 0.8rem; color: var(--rose-700);">
          ${escapeHtml(error.message || 'Unable to query the backend.')}
        </div>
      `;
      showToast(error.message || 'Unable to query the backend.', 'error');
    }
  };

  container.querySelector('#btn-run-query')?.addEventListener('click', () => {
    executeSemanticQuery(queryInput.value);
  });

  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSemanticQuery(queryInput.value);
  });

  container.querySelectorAll('.q-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      queryInput.value = chip.textContent;
      executeSemanticQuery(chip.textContent);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
