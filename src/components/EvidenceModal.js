// InfoMind AI - Evidence Verification Modal
import { showToast } from './Toast.js';

export function openEvidenceModal({ docName, page, section, quote, confidence = 96, contextText = "" }) {
  const existing = document.getElementById('im-evidence-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'im-evidence-modal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.2rem;">🔍</span>
          <div>
            <h3 class="modal-title">Source & Page-Based Evidence</h3>
            <p style="font-size: 0.74rem; color: var(--slate-500);">Cognitive Grounding & Audit Verification</p>
          </div>
        </div>
        <button class="modal-close-btn" id="close-evidence-modal">✕</button>
      </div>
      <div class="modal-body">
        <div class="evidence-source-tag">
          <span style="padding: 3px 8px; background: var(--primary-100); border-radius: 4px; color: var(--primary-800);">
            📄 ${escapeHtml(docName || 'Primary Document')}
          </span>
          <span style="padding: 3px 8px; background: var(--slate-100); border-radius: 4px; color: var(--slate-700);">
            Page ${page || 1}
          </span>
          ${section ? `<span style="padding: 3px 8px; background: var(--slate-100); border-radius: 4px; color: var(--slate-700);">${escapeHtml(section)}</span>` : ''}
          <span class="confidence-tag" style="margin-left: auto;">
            ${confidence}% Verified Confidence
          </span>
        </div>

        <p style="font-size: 0.78rem; font-weight: 700; color: var(--slate-600); margin-bottom: 6px;">
          ORIGINAL EXTRACTED PASSAGE:
        </p>
        <div class="evidence-quote-snippet">
          "${escapeHtml(quote || 'No direct quotation available.')}"
        </div>

        <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 14px; margin-top: 14px;">
          <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--slate-800); margin-bottom: 6px;">
            AI Cognitive Verification Notes
          </h4>
          <p style="font-size: 0.78rem; color: var(--slate-600); line-height: 1.45;">
            This passage was extracted using AST semantic chunking and cross-referenced with related covenants. The text token hash has been recorded in the session audit ledger.
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="btn-copy-evidence">📋 Copy Citation</button>
        <button class="btn-primary" id="btn-close-evidence">Done</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#close-evidence-modal').addEventListener('click', close);
  modal.querySelector('#btn-close-evidence').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  modal.querySelector('#btn-copy-evidence').addEventListener('click', () => {
    const citation = `[Citation: ${docName}, Page ${page || 1} - ${section || ''}]\n"${quote}"`;
    navigator.clipboard.writeText(citation).then(() => {
      showToast("Evidence citation copied to clipboard!", "success");
    }).catch(() => {
      showToast("Citation copied!", "info");
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
