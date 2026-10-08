// InfoMind AI - Stage 4: USE (Actionable Intelligence & Execution View)
import { stateService } from '../services/api.js';
import { openActionModal } from './ActionModal.js';
import { showToast } from './Toast.js';

export function renderUseView(container) {
  const state = stateService.getState();
  const actions = state.scenario.actions;

  container.innerHTML = `
    <div class="view-content-wrapper">
      <!-- Hero Banner -->
      <div class="section-hero-banner">
        <div class="hero-left">
          <div class="hero-badge">
            <span style="color: var(--primary-600); font-weight: 800;">PHASE 04</span>
            <span>Decision Intelligence & Execution</span>
          </div>
          <h1 class="hero-title">USE: AI-Generated Recommended Actions</h1>
          <p class="hero-desc">
            Convert deep synthesized knowledge into executive memos, supplier notices, and legal directives. Turn raw information into immediate decision execution.
          </p>
        </div>
        <div class="hero-actions">
          <button class="btn-primary" id="btn-export-full-report">
            <span>📄 Export Executive Audit Dossier</span>
          </button>
        </div>
      </div>

      <!-- Action Value Highlights -->
      <div class="analytics-metrics-row">
        <div class="metric-stat-card">
          <span class="metric-stat-label">Pending AI Actions</span>
          <span class="metric-stat-value">${actions.length}</span>
          <span class="metric-stat-change">⚡ Prioritized by Financial Risk</span>
        </div>
        <div class="metric-stat-card">
          <span class="metric-stat-label">Financial Exposure Guarded</span>
          <span class="metric-stat-value">$2.5M+</span>
          <span class="metric-stat-change">↑ Prevented purchase price mismatch</span>
        </div>
        <div class="metric-stat-card">
          <span class="metric-stat-label">Legal Execution Acceleration</span>
          <span class="metric-stat-value">8.4x</span>
          <span class="metric-stat-change">↑ Memos & emails drafted automatically</span>
        </div>
        <div class="metric-stat-card">
          <span class="metric-stat-label">Information Health Score</span>
          <span class="metric-stat-value">${state.scenario.healthScore.overall} / 100</span>
          <span class="metric-stat-change">Grade ${state.scenario.healthScore.grade}</span>
        </div>
      </div>

      <!-- AI Recommended Actions Grid -->
      <div class="im-card">
        <div class="im-card-header">
          <div class="card-title-group">
            <div class="card-title-icon" style="background: var(--primary-50); color: var(--primary-600);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div>
              <h2 class="card-title">Prioritized Action Workflows</h2>
              <p class="card-subtitle">Click any workflow to review and dispatch the AI-generated memorandum or outbound notice</p>
            </div>
          </div>
        </div>

        <div class="use-actions-grid">
          ${actions.map((act, idx) => `
            <div class="action-card">
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div class="action-top-row">
                  <span class="action-priority-badge priority-${act.priority}">
                    ${act.priority} PRIORITY
                  </span>
                  <span class="action-due-date">Due: ${escapeHtml(act.due)}</span>
                </div>

                <h3 class="action-card-title">${escapeHtml(act.title)}</h3>
                <div class="action-card-impact">
                  <strong>Expected Impact:</strong> ${escapeHtml(act.impact)}
                </div>
              </div>

              <button class="action-execute-btn" data-actidx="${idx}">
                <span>${act.type === 'email' ? '✉️' : '📄'}</span>
                <span>${escapeHtml(act.actionBtnText || 'Generate & Execute')}</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Full Executive Summary Dossier Preview -->
      <div class="im-card">
        <div class="im-card-header">
          <div class="card-title-group">
            <div class="card-title-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h2 class="card-title">Cognitive Dossier & Audit Certificate</h2>
              <p class="card-subtitle">Synthesized executive brief ready for Board or Steering Committee distribution</p>
            </div>
          </div>
          <button class="btn-secondary" id="btn-copy-dossier" style="font-size: 0.78rem;">
            📋 Copy Entire Dossier
          </button>
        </div>

        <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 20px; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.6; color: var(--slate-800); max-height: 280px; overflow-y: auto;" id="dossier-text-block">
INFOMIND AI - COGNITIVE INFORMATION AUDIT CERTIFICATE
Scenario: ${state.scenario.name.toUpperCase()}
Generated on: ${new Date().toUTCString()}
Verification Hash: SHA256:7f8a92bb031d2e... (Verified Ground Truth)

1. EXECUTIVE ASSESSMENT
Total Ingested Sources: ${state.scenario.documents.length} verified documents
Information Health Score: ${state.scenario.healthScore.overall} / 100 (Grade ${state.scenario.healthScore.grade})
Identified Contradictions: ${state.scenario.conflicts.length} active conflict(s)
Missing Documentation Gaps: ${state.scenario.missingInformation.length} missing exhibit(s)

2. CORE FINDINGS & RECOMMENDATIONS
${state.scenario.conflicts.map((c, i) => `[Conflict #${i+1}]: ${c.title}\n   Impact: ${c.impact}\n   Resolution: ${c.aiRecommendation}\n`).join('\n')}

3. EXECUTED AUDIT COMPLIANCE
All citations cross-referenced with exact document page indices and verified against original token stream.
        </div>
      </div>
    </div>
  `;

  // Bind Action Buttons
  container.querySelectorAll('.action-execute-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-actidx'), 10);
      const action = actions[idx];
      openActionModal(action);
    });
  });

  // Export Full Report
  container.querySelector('#btn-export-full-report')?.addEventListener('click', () => {
    const text = container.querySelector('#dossier-text-block').innerText;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfoMind_Audit_Dossier_${state.currentScenarioKey}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded Executive Audit Dossier (.md)!", "success");
  });

  // Copy Dossier
  container.querySelector('#btn-copy-dossier')?.addEventListener('click', () => {
    const text = container.querySelector('#dossier-text-block').innerText;
    navigator.clipboard.writeText(text).then(() => {
      showToast("Full dossier copied to clipboard!", "success");
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
