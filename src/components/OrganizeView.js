// InfoMind AI - Stage 3: ORGANIZE (Cross-Document Synthesis, Conflicts & Knowledge Map)
import { stateService } from '../services/api.js';
import { KnowledgeGraphComponent } from './KnowledgeGraph.js';
import { openEvidenceModal } from './EvidenceModal.js';
import { showToast } from './Toast.js';

let activeKG = null;

export function renderOrganizeView(container) {
  const state = stateService.getState();
  const conflicts = state.scenario.conflicts;
  const missing = state.scenario.missingInformation;
  const matrix = state.scenario.comparisonMatrix;

  container.innerHTML = `
    <div class="view-content-wrapper">
      <!-- Hero Banner -->
      <div class="section-hero-banner">
        <div class="hero-left">
          <div class="hero-badge">
            <span style="color: var(--primary-600); font-weight: 800;">PHASE 03</span>
            <span>Cross-Document Alignment</span>
          </div>
          <h1 class="hero-title">ORGANIZE: Multi-Doc Comparison & Conflict Detection</h1>
          <p class="hero-desc">
            Reconciles disparate document sources to detect conflicting facts, contract contradictions, omitted clauses, and maps relationships across the enterprise corpus.
          </p>
        </div>
        <div class="hero-actions">
          <button class="btn-primary" id="btn-next-to-use">
            <span>Next: USE & Recommended Actions →</span>
          </button>
        </div>
      </div>

      <div class="organize-layout">
        <!-- Section 1: Conflict Detection Engine -->
        <div class="im-card">
          <div class="im-card-header">
            <div class="card-title-group">
              <div class="card-title-icon" style="background: #fef2f2; color: #ef4444;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h2 class="card-title">Conflict & Contradiction Detection Engine (${conflicts.length} Active)</h2>
                <p class="card-subtitle">AI highlights factual discrepancies across ingested sources</p>
              </div>
            </div>
            <span style="font-size: 0.76rem; font-weight: 700; color: ${conflicts.length > 0 ? 'var(--rose-700)' : 'var(--emerald-700)'};">
              ${conflicts.length > 0 ? `⚠️ ${conflicts.length} Contradictions Detected` : '✓ All Documents Aligned'}
            </span>
          </div>

          ${conflicts.length === 0 ? `
            <div style="padding: 24px; text-align: center; background: var(--emerald-50); border: 1px dashed var(--emerald-500); border-radius: var(--radius-md);">
              <span style="font-size: 1.5rem;">🎉</span>
              <p style="font-weight: 700; color: var(--emerald-700); margin-top: 6px;">All Cross-Document Conflicts Resolved!</p>
              <p style="font-size: 0.78rem; color: var(--slate-600);">Information Health Consistency score has reached optimal benchmark.</p>
            </div>
          ` : `
            <div class="conflicts-grid">
              ${conflicts.map(c => `
                <div class="conflict-card severity-${c.severity}" id="conflict-card-${c.id}">
                  <div class="conflict-header">
                    <span class="severity-pill">${c.severity} RISK</span>
                    <span style="font-size: 0.72rem; font-weight: 700; color: var(--slate-500);">${escapeHtml(c.category)}</span>
                  </div>

                  <h3 class="conflict-title">${escapeHtml(c.title)}</h3>
                  <p class="conflict-desc">${escapeHtml(c.description)}</p>

                  <div class="conflict-diff-box">
                    <div class="diff-side">
                      <div class="diff-doc-name">
                        <span>📄</span>
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(c.docA.name)}</span>
                      </div>
                      <div class="diff-quote">"${escapeHtml(c.docA.quote)}"</div>
                    </div>
                    <div class="diff-side">
                      <div class="diff-doc-name">
                        <span>📄</span>
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(c.docB.name)}</span>
                      </div>
                      <div class="diff-quote">"${escapeHtml(c.docB.quote)}"</div>
                    </div>
                  </div>

                  <div class="conflict-rec-box">
                    <strong>AI Recommendation:</strong> ${escapeHtml(c.aiRecommendation)}
                  </div>

                  <div style="display: flex; gap: 8px; margin-top: 4px;">
                    <button class="conflict-btn-resolve" data-cid="${c.id}">
                      ✓ Apply Resolution
                    </button>
                    <button class="btn-secondary btn-inspect-diff-evidence" data-cid="${c.id}" style="padding: 7px 12px; font-size: 0.76rem;">
                      Verify Sources
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Section 2: Missing Information & Gaps -->
        <div class="im-card">
          <div class="im-card-header">
            <div class="card-title-group">
              <div class="card-title-icon" style="background: #f5f3ff; color: #8b5cf6;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                </svg>
              </div>
              <div>
                <h2 class="card-title">Missing Information & Gap Analysis (${missing.length} Gaps)</h2>
                <p class="card-subtitle">AI detects omitted exhibits, absent signatures, and unstated covenants</p>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${missing.map(m => `
              <div style="padding: 14px; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${m.urgency === 'HIGH' ? '#fef2f2; color: #b91c1c;' : '#fffbeb; color: #b45309;'}">
                      ${m.urgency} URGENCY
                    </span>
                    <span style="font-weight: 700; font-size: 0.88rem; color: var(--slate-900);">${escapeHtml(m.item)}</span>
                    <span style="font-size: 0.72rem; color: var(--slate-500); font-family: var(--font-mono);">[Ref: ${escapeHtml(m.reference)}]</span>
                  </div>
                  <p style="font-size: 0.78rem; color: var(--slate-600); line-height: 1.4;">${escapeHtml(m.explanation)}</p>
                </div>
                <button class="btn-primary btn-resolve-missing" data-mid="${m.id}" style="padding: 8px 12px; font-size: 0.74rem; flex-shrink: 0;">
                  Resolve Gap
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 3: Multi-Document Comparison Matrix -->
        <div class="im-card">
          <div class="im-card-header">
            <div class="card-title-group">
              <div class="card-title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                </svg>
              </div>
              <div>
                <h2 class="card-title">Side-by-Side Multi-Document Comparison Matrix</h2>
                <p class="card-subtitle">Automated taxonomy alignment across key terms and clauses</p>
              </div>
            </div>
          </div>

          <div class="matrix-table-wrap">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Comparison Dimension</th>
                  <th style="width: 26%;">Titan Acquisition Agreement</th>
                  <th style="width: 26%;">Apex Vendor Contract</th>
                  <th style="width: 26%;">Internal Audit / Board Memo</th>
                </tr>
              </thead>
              <tbody>
                ${matrix.dimensions.map(d => `
                  <tr class="matrix-status-${d.status}">
                    <td>
                      <strong style="color: var(--slate-900);">${escapeHtml(d.name)}</strong>
                      <div style="font-size: 0.68rem; text-transform: uppercase; font-weight: 800; margin-top: 2px; color: ${d.status === 'conflict' ? '#e11d48' : d.status === 'missing' ? '#7c3aed' : '#059669'};">
                        ${d.status === 'conflict' ? '⚠️ Contradiction' : d.status === 'missing' ? '🔍 Missing Exhibit' : '✓ Aligned'}
                      </div>
                    </td>
                    <td>${escapeHtml(d.TitanAcq)}</td>
                    <td>${escapeHtml(d.ApexVendor)}</td>
                    <td>${escapeHtml(d.InternalAudit)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 4: Interactive Knowledge / Relationship Map -->
        <div class="im-card">
          <div class="im-card-header">
            <div class="card-title-group">
              <div class="card-title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
                </svg>
              </div>
              <div>
                <h2 class="card-title">Knowledge & Relationship Map</h2>
                <p class="card-subtitle">Interactive neural map connecting documents, entities, conflicts and people</p>
              </div>
            </div>
            <span style="font-size: 0.74rem; color: var(--slate-500);">
              💡 Drag nodes to test physics, or click to inspect
            </span>
          </div>

          <div id="organize-kg-mount"></div>
        </div>
      </div>
    </div>
  `;

  // Mount Knowledge Graph
  if (activeKG) {
    activeKG.destroy();
    activeKG = null;
  }
  activeKG = new KnowledgeGraphComponent('organize-kg-mount');

  // Next Stage Button
  container.querySelector('#btn-next-to-use')?.addEventListener('click', () => {
    stateService.setStage('use');
  });

  // Resolve Conflict Handler
  container.querySelectorAll('.conflict-btn-resolve').forEach(btn => {
    btn.addEventListener('click', () => {
      const cid = btn.getAttribute('data-cid');
      const resolved = stateService.resolveConflict(cid);
      showToast(`Conflict resolved! Information Health Consistency boosted +7 pts.`, "success");
      renderOrganizeView(container);
    });
  });

  // Verify Conflict Sources Handler
  container.querySelectorAll('.btn-inspect-diff-evidence').forEach(btn => {
    btn.addEventListener('click', () => {
      const cid = btn.getAttribute('data-cid');
      const conf = conflicts.find(c => c.id === cid);
      if (conf) {
        openEvidenceModal({
          docName: `${conf.docA.name} vs ${conf.docB.name}`,
          page: `${conf.docA.page} & ${conf.docB.page}`,
          section: conf.category,
          quote: `[Source A]: "${conf.docA.quote}"\n\n[Source B]: "${conf.docB.quote}"`,
          confidence: 99
        });
      }
    });
  });

  // Resolve Missing Handler
  container.querySelectorAll('.btn-resolve-missing').forEach(btn => {
    btn.addEventListener('click', () => {
      const mid = btn.getAttribute('data-mid');
      stateService.resolveMissingInfo(mid);
      showToast(`Missing exhibit requested! Information Health Completeness boosted +6 pts.`, "success");
      renderOrganizeView(container);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
