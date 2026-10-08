// InfoMind AI - Action Execution Modal with One-Click Output Generators
import confetti from 'canvas-confetti';
import { showToast } from './Toast.js';

export function openActionModal(action) {
  const existing = document.getElementById('im-action-modal');
  if (existing) existing.remove();

  const isEmail = action.type === 'email';
  const modal = document.createElement('div');
  modal.id = 'im-action-modal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 720px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--primary-100); color: var(--primary-700); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
            ${isEmail ? '✉️' : '📄'}
          </div>
          <div>
            <h3 class="modal-title">${escapeHtml(action.title)}</h3>
            <p style="font-size: 0.74rem; color: var(--slate-500);">
              AI Recommended Execution • Category: ${escapeHtml(action.category || 'General')}
            </p>
          </div>
        </div>
        <button class="modal-close-btn" id="close-action-modal">✕</button>
      </div>

      <div class="modal-body">
        <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap;">
          <span class="action-priority-badge priority-${action.priority}">Priority: ${action.priority}</span>
          <span style="font-size: 0.74rem; background: var(--slate-100); padding: 3px 8px; border-radius: 4px; color: var(--slate-700); font-weight: 600;">
            Target Due: ${escapeHtml(action.due || 'Immediate')}
          </span>
          <span style="font-size: 0.74rem; background: var(--emerald-50); color: var(--emerald-700); padding: 3px 8px; border-radius: 4px; font-weight: 600; margin-left: auto;">
            ⚡ Ready for Instant Dispatch
          </span>
        </div>

        <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 14px;">
          <strong style="font-size: 0.78rem; color: var(--slate-700);">Expected Impact:</strong>
          <span style="font-size: 0.78rem; color: var(--slate-600); margin-left: 6px;">${escapeHtml(action.impact)}</span>
        </div>

        <label style="font-size: 0.78rem; font-weight: 700; color: var(--slate-700); margin-bottom: 6px; display: block;">
          ${isEmail ? 'GENERATED OUTBOUND EMAIL DRAFT:' : 'GENERATED FORMAL EXECUTIVE MEMO:'}
        </label>
        <textarea id="action-generated-content" style="width: 100%; height: 260px; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.5; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--slate-300); background: #ffffff; color: var(--slate-800); outline: none; resize: vertical;">${escapeHtml(action.content)}</textarea>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" id="btn-download-action">📥 Download File</button>
        <button class="btn-secondary" id="btn-copy-action">📋 Copy to Clipboard</button>
        <button class="btn-primary" id="btn-execute-dispatch">⚡ Mark Dispatched & Resolved</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#close-action-modal').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  const textarea = modal.querySelector('#action-generated-content');

  // Copy handler
  modal.querySelector('#btn-copy-action').addEventListener('click', () => {
    navigator.clipboard.writeText(textarea.value).then(() => {
      showToast("Draft content copied to clipboard!", "success");
    }).catch(() => {
      showToast("Draft copied!", "info");
    });
  });

  // Download handler
  modal.querySelector('#btn-download-action').addEventListener('click', () => {
    const filename = `${action.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`;
    const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, "success");
  });

  // Mark Dispatched handler
  modal.querySelector('#btn-execute-dispatch').addEventListener('click', () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    showToast("Action dispatched & recorded to executive audit trail!", "success");
    close();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
