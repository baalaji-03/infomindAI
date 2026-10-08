// InfoMind AI - Visual Pipeline Stepper Component
// FIND -> UNDERSTAND -> ORGANIZE -> USE
import { stateService } from '../services/api.js';

export function renderStagePipeline(container) {
  const state = stateService.getState();
  const current = state.activeStage;

  container.innerHTML = `
    <div class="pipeline-bar-container">
      <div class="pipeline-stepper">
        <!-- Stage 01: FIND -->
        <div class="stepper-card ${current === 'find' ? 'active' : ''}" data-stage="find">
          <div class="stepper-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <div class="stepper-info">
            <div class="stepper-num">Phase 01</div>
            <div class="stepper-title">FIND</div>
            <div class="stepper-desc">Ingest & Search</div>
          </div>
        </div>

        <!-- Stage 02: UNDERSTAND -->
        <div class="stepper-card ${current === 'understand' ? 'active' : ''}" data-stage="understand">
          <div class="stepper-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div class="stepper-info">
            <div class="stepper-num">Phase 02</div>
            <div class="stepper-title">UNDERSTAND</div>
            <div class="stepper-desc">Summaries & Entities</div>
          </div>
        </div>

        <!-- Stage 03: ORGANIZE -->
        <div class="stepper-card ${current === 'organize' ? 'active' : ''}" data-stage="organize">
          <div class="stepper-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
            </svg>
          </div>
          <div class="stepper-info">
            <div class="stepper-num">Phase 03</div>
            <div class="stepper-title">ORGANIZE</div>
            <div class="stepper-desc">Compare & Conflicts</div>
          </div>
        </div>

        <!-- Stage 04: USE -->
        <div class="stepper-card ${current === 'use' ? 'active' : ''}" data-stage="use">
          <div class="stepper-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div class="stepper-info">
            <div class="stepper-num">Phase 04</div>
            <div class="stepper-title">USE</div>
            <div class="stepper-desc">Actionable Intelligence</div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.stepper-card').forEach(card => {
    card.addEventListener('click', () => {
      const stage = card.getAttribute('data-stage');
      stateService.setStage(stage);
    });
  });
}
