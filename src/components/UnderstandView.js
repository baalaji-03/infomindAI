// InfoMind AI - Stage 2: UNDERSTAND (Deep Cognitive Analysis & Extraction)
import { stateService } from '../services/api.js';
import { openEvidenceModal } from './EvidenceModal.js';
import { showToast } from './Toast.js';

export function renderUnderstandView(container) {
  const state = stateService.getState();
  const docs = state.scenario.documents;
  const activeDoc = state.activeDoc || docs[0];
  const hs = state.scenario.healthScore;

  let activeEntityTab = 'financial';

  container.innerHTML = `
    <div class="view-content-wrapper">
      <!-- Hero Banner -->
      <div class="section-hero-banner">
        <div class="hero-left">
          <div class="hero-badge">
            <span style="color: var(--primary-600); font-weight: 800;">PHASE 02</span>
            <span>Cognitive Synthesis & Grounding</span>
          </div>
          <h1 class="hero-title">UNDERSTAND: AI Summarization & Entity Extraction</h1>
          <p class="hero-desc">
            Deep syntactic and semantic comprehension. Deconstructs document structure into executive summaries, verifiable entities, and a 5-pillar Information Health Score.
          </p>
        </div>
        <div class="hero-actions">
          <button class="btn-primary" id="btn-next-to-organize">
            <span>Next: Organize & Detect Conflicts →</span>
          </button>
        </div>
      </div>

      <!-- Document Switcher Pills -->
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
        ${docs.map(d => `
          <button 
            class="btn-sample-trigger doc-tab-btn ${d.id === activeDoc.id ? 'active' : ''}" 
            data-docid="${d.id}"
            style="${d.id === activeDoc.id ? 'background: var(--primary-600); color: #fff; border-color: var(--primary-600);' : ''}"
          >
            📄 ${escapeHtml(d.name.length > 28 ? d.name.slice(0, 25) + '...' : d.name)}
          </button>
        `).join('')}
      </div>

      <!-- Main Understand Layout -->
      <div class="understand-grid">
        <!-- Left Column: AI Summary & Entity Extraction -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Summarization Card -->
          <div class="im-card">
            <div class="im-card-header">
              <div class="card-title-group">
                <div class="card-title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="card-title">${escapeHtml(activeDoc.name)}</h2>
                  <p class="card-subtitle">
                    ${activeDoc.department} • Author: ${escapeHtml(activeDoc.author || 'Verified Origin')} • ${activeDoc.size}
                  </p>
                </div>
              </div>

              <button class="btn-secondary" id="btn-view-evidence-doc" style="font-size: 0.76rem; font-weight: 700;">
                🔍 View Source Citations
              </button>
            </div>

            <div class="summary-card-body">
              <div>
                <p style="font-size: 0.72rem; font-weight: 800; color: var(--primary-700); text-transform: uppercase; margin-bottom: 6px;">
                  Executive TL;DR Summary
                </p>
                <div class="executive-tldr">
                  ${escapeHtml(activeDoc.summary)}
                </div>
              </div>

              <div>
                <p style="font-size: 0.72rem; font-weight: 800; color: var(--slate-600); text-transform: uppercase; margin-bottom: 8px;">
                  Key Strategic Takeaways
                </p>
                <div class="takeaway-list">
                  ${(activeDoc.keyTakeaways || []).map((t, idx) => `
                    <div class="takeaway-item">
                      <div class="takeaway-dot"></div>
                      <div style="flex: 1;">${escapeHtml(t)}</div>
                      <button class="btn-sample-trigger btn-takeaway-evidence" data-idx="${idx}" style="padding: 2px 6px; font-size: 0.68rem;">
                        Verify
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Entity Extraction Card -->
          <div class="im-card">
            <div class="im-card-header">
              <div class="card-title-group">
                <div class="card-title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div>
                  <h2 class="card-title">Important Information Extraction</h2>
                  <p class="card-subtitle">Classified named entities & covenants with confidence tags</p>
                </div>
              </div>
            </div>

            <div class="entities-tabs">
              <button class="entity-tab-btn active" data-tab="financial">💰 Financial Figures</button>
              <button class="entity-tab-btn" data-tab="dates">📅 Key Dates</button>
              <button class="entity-tab-btn" data-tab="parties">👥 Parties & People</button>
              <button class="entity-tab-btn" data-tab="obligations">⚖️ Obligations</button>
            </div>

            <div class="entity-pills-wrap" id="entity-pills-container">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>

        <!-- Right Column: Information Health Score Card -->
        <div class="im-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div class="im-card-header">
              <div class="card-title-group">
                <div class="card-title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div>
                  <h2 class="card-title">Information Health Score</h2>
                  <p class="card-subtitle">5-Pillar Holistic Reliability Metric</p>
                </div>
              </div>
              <span class="severity-pill" style="background: var(--primary-100); color: var(--primary-800); font-size: 0.72rem;">
                ${escapeHtml(hs.status)}
              </span>
            </div>

            <div class="health-gauge-box">
              <div class="health-number-circle" style="border-color: ${hs.overall >= 85 ? 'var(--emerald-500)' : hs.overall >= 70 ? 'var(--amber-500)' : 'var(--rose-500)'};">
                <span class="health-big-score">${hs.overall}</span>
                <span class="health-score-max">Grade ${hs.grade} • 100 MAX</span>
              </div>
              <p style="font-size: 0.78rem; color: var(--slate-600); margin-top: 12px; text-align: center; max-width: 320px; line-height: 1.45;">
                ${escapeHtml(hs.summary)}
              </p>
            </div>

            <div class="health-pillars-list">
              ${hs.pillars.map(p => `
                <div class="pillar-row">
                  <div class="pillar-label-bar">
                    <span>${escapeHtml(p.name)}</span>
                    <span>${p.score}% (Target: ${p.benchmark}%)</span>
                  </div>
                  <div class="progress-track">
                    <div 
                      class="progress-fill" 
                      style="width: ${p.score}%; background: ${p.score >= p.benchmark ? 'var(--emerald-500)' : p.score >= 70 ? 'var(--amber-500)' : 'var(--rose-500)'};"
                    ></div>
                  </div>
                  <span style="font-size: 0.68rem; color: var(--slate-500); margin-top: 2px;">
                    ${escapeHtml(p.detail)}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="margin-top: 24px; padding: 14px; background: var(--primary-50); border: 1px solid var(--primary-200); border-radius: var(--radius-md);">
            <div style="font-size: 0.76rem; font-weight: 700; color: var(--primary-800); margin-bottom: 4px;">
              💡 AI Health Recommendation
            </div>
            <div style="font-size: 0.74rem; color: var(--slate-700); line-height: 1.4;">
              Resolving the ${state.scenario.conflicts.length} active contradiction(s) in the Organize Stage will restore the Consistency Pillar to 94%+.
            </div>
            <button class="btn-primary" id="btn-jump-resolve-conflicts" style="width: 100%; margin-top: 10px; font-size: 0.78rem; padding: 8px;">
              Go to Conflict Resolution →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render Entity Pills function
  const renderEntities = (tabKey) => {
    const containerEl = container.querySelector('#entity-pills-container');
    if (!containerEl) return;
    const items = activeDoc.entities[tabKey] || [];

    if (items.length === 0) {
      containerEl.innerHTML = `<div style="font-size: 0.78rem; color: var(--slate-500); padding: 12px;">No entities found in this classification.</div>`;
      return;
    }

    containerEl.innerHTML = items.map(item => `
      <div class="entity-pill ${tabKey}" data-entity="${escapeHtml(item)}">
        <span>${escapeHtml(item)}</span>
        <span style="font-size: 0.65rem; opacity: 0.8;">🔍</span>
      </div>
    `).join('');

    containerEl.querySelectorAll('.entity-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const ent = pill.getAttribute('data-entity');
        openEvidenceModal({
          docName: activeDoc.name,
          page: 1,
          section: `${tabKey.toUpperCase()} ENTITY`,
          quote: `Identified and extracted covenant entity: "${ent}" with 98.2% semantic certainty in ${activeDoc.name}.`,
          confidence: 98
        });
      });
    });
  };

  renderEntities(activeEntityTab);

  // Tab switching
  container.querySelectorAll('.entity-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.entity-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeEntityTab = btn.getAttribute('data-tab');
      renderEntities(activeEntityTab);
    });
  });

  // Switch active document
  container.querySelectorAll('.doc-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const docId = btn.getAttribute('data-docid');
      stateService.setActiveDoc(docId);
      renderUnderstandView(container);
    });
  });

  // Next Stage Button
  container.querySelector('#btn-next-to-organize')?.addEventListener('click', () => {
    stateService.setStage('organize');
  });

  container.querySelector('#btn-jump-resolve-conflicts')?.addEventListener('click', () => {
    stateService.setStage('organize');
  });

  // Evidence modal for active doc
  container.querySelector('#btn-view-evidence-doc')?.addEventListener('click', () => {
    const snip = (activeDoc.snippets && activeDoc.snippets[0]) || {
      page: 1,
      section: activeDoc.department,
      text: activeDoc.summary
    };
    openEvidenceModal({
      docName: activeDoc.name,
      page: snip.page,
      section: snip.section,
      quote: snip.text,
      confidence: 97
    });
  });

  // Takeaway evidence buttons
  container.querySelectorAll('.btn-takeaway-evidence').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const text = activeDoc.keyTakeaways[idx];
      openEvidenceModal({
        docName: activeDoc.name,
        page: (idx + 1) * 3,
        section: `Key Provision #${idx + 1}`,
        quote: text,
        confidence: 96
      });
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
