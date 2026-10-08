// InfoMind AI - Top Header Component with Smart Natural-Language Search & Health Indicator
import { stateService } from '../services/api.js';
import { openEvidenceModal } from './EvidenceModal.js';
import { showToast } from './Toast.js';

export function renderHeader(container) {
  const state = stateService.getState();
  const hs = state.scenario.healthScore;

  container.innerHTML = `
    <header class="top-header">
      <div class="header-left">
        <div class="global-search-container">
          <svg class="search-icon-pos" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input 
            type="text" 
            class="global-search-input" 
            id="global-search-input"
            placeholder="Ask anything (e.g., 'What is the purchase price?', 'Are there payment term conflicts?')..." 
            value="${escapeHtml(state.searchQuery)}"
            autocomplete="off"
          />
          <div class="search-dropdown" id="search-dropdown"></div>
        </div>
      </div>

      <div class="header-right">
        <div class="health-pill-badge" id="btn-header-health" title="Overall Information Health Score">
          <span class="health-dot" style="background: ${hs.overall >= 85 ? 'var(--emerald-500)' : hs.overall >= 70 ? 'var(--amber-500)' : 'var(--rose-500)'};"></span>
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--slate-800);">Health: ${hs.overall}/100</span>
          <span style="font-size: 0.7rem; font-weight: 800; background: var(--slate-100); padding: 2px 5px; border-radius: 4px;">Grade ${hs.grade}</span>
        </div>

        <div class="backend-indicator ${state.isBackendConnected ? 'connected' : ''}" id="btn-backend-status" title="${state.databaseSyncError ? escapeHtml(state.databaseSyncError) : 'Click to test FastAPI on :8000'}">
          <span class="backend-dot"></span>
          <span>${state.databaseSyncError ? 'Database Sync Error' : state.isBackendConnected ? 'FastAPI Online (:8000)' : 'Browser Engine (FastAPI Ready)'}</span>
        </div>

        <input type="file" id="quick-file-input" multiple style="display: none;" accept=".pdf,.docx,.xlsx,.txt,.csv,.json,.png,.jpg,.jpeg" />
        <button class="btn-upload-quick" id="btn-quick-upload">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span>Ingest Files</span>
        </button>
      </div>
    </header>
  `;

  // Bind Search events
  const input = container.querySelector('#global-search-input');
  const dropdown = container.querySelector('#search-dropdown');

  input.addEventListener('input', (e) => {
    const val = e.target.value;
    stateService.setSearchQuery(val);
    renderSearchResults(val, dropdown);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length > 1) {
      renderSearchResults(input.value, dropdown);
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.global-search-container')) {
      dropdown.classList.remove('active');
    }
  });

  // Health click jumps to Understand Stage
  container.querySelector('#btn-header-health')?.addEventListener('click', () => {
    stateService.setStage('understand');
  });

  // Backend test click
  container.querySelector('#btn-backend-status')?.addEventListener('click', async () => {
    showToast("Pinging backend on http://127.0.0.1:8000/api/health...", "info");
    const connected = await stateService.checkBackendConnection();
    if (connected) {
      const refreshedState = stateService.getState();
      if (refreshedState.databaseSyncError) {
        showToast(`Backend is online, but database documents could not be loaded: ${refreshedState.databaseSyncError}`, "error", 6000);
      } else {
        showToast("FastAPI Backend and database connection verified!", "success");
      }
    } else {
      showToast("Running browser mode. Start FastAPI with: python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000", "info", 6000);
    }
  });

  // Upload trigger
  const fileInput = container.querySelector('#quick-file-input');
  container.querySelector('#btn-quick-upload')?.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      showToast(`Ingesting & parsing ${e.target.files.length} document(s)...`, "info");
      try {
        await stateService.uploadFiles(Array.from(e.target.files));
        const message = stateService.getState().isBackendConnected
          ? `Processed and saved ${e.target.files.length} document(s) to the database.`
          : `Processed ${e.target.files.length} document(s) in this browser. Start the backend to save them to the database.`;
        showToast(message, stateService.getState().isBackendConnected ? "success" : "info");
        stateService.setStage('understand');
      } catch (error) {
        showToast(error.message || "Unable to process the selected files.", "error");
      } finally {
        fileInput.value = '';
      }
    }
  });
}

function renderSearchResults(query, dropdown) {
  if (!query || query.trim().length < 2) {
    dropdown.classList.remove('active');
    return;
  }

  const results = stateService.searchDocuments(query);
  if (results.length === 0) {
    dropdown.innerHTML = `
      <div style="padding: 14px; text-align: center; font-size: 0.8rem; color: var(--slate-500);">
        No direct matches found for "<strong>${escapeHtml(query)}</strong>". Try broader keywords like "revenue", "agreement", "notice", or "schedule".
      </div>
    `;
    dropdown.classList.add('active');
    return;
  }

  dropdown.innerHTML = `
    <div style="padding: 6px 10px; font-size: 0.7rem; font-weight: 800; color: var(--slate-400); text-transform: uppercase;">
      Cognitive Search Results (${results.length})
    </div>
    ${results.map((r, i) => `
      <div class="search-result-item" data-index="${i}">
        <div class="search-result-header">
          <span class="search-result-title">📄 ${escapeHtml(r.docName)}</span>
          <span class="confidence-tag">${r.confidence}% Match</span>
        </div>
        <div class="search-result-quote">
          <span style="font-weight: 700; color: var(--primary-700);">[Page ${r.page}]</span> "${escapeHtml(r.quote)}"
        </div>
      </div>
    `).join('')}
  `;
  dropdown.classList.add('active');

  dropdown.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-index'), 10);
      const res = results[idx];
      dropdown.classList.remove('active');
      openEvidenceModal({
        docName: res.docName,
        page: res.page,
        section: res.department,
        quote: res.quote,
        confidence: res.confidence
      });
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
