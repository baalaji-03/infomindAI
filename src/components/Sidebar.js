// InfoMind AI - Sidebar Navigation Component
import { stateService } from '../services/api.js';
import { DEMO_SCENARIOS } from '../data/demoScenarios.js';
import { showToast } from './Toast.js';

export function renderSidebar(container) {
  const state = stateService.getState();

  const scenariosOptions = Object.keys(DEMO_SCENARIOS).map(key => {
    const sc = DEMO_SCENARIOS[key];
    const selected = key === state.currentScenarioKey ? 'selected' : '';
    return `<option value="${key}" ${selected}>${sc.name}</option>`;
  }).join('');

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-wrapper" id="brand-home-click">
          <div class="brand-icon-wrapper">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4c0 .8-.2 1.5-.7 2.1l.7.9a3 3 0 0 1 .5 3.5l-.5.5"/>
              <path d="M12 2a4 4 0 0 0-4 4c0 .8.2 1.5.7 2.1l-.7.9a3 3 0 0 0-.5 3.5l.5.5"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M9 18a3 3 0 0 0 6 0"/>
              <path d="M12 15v3"/>
            </svg>
          </div>
          <div class="brand-text-block">
            <div class="brand-title">
              InfoMind <span class="brand-badge">AI 2.0</span>
            </div>
            <div class="brand-subtitle">Information Understanding</div>
          </div>
        </div>

        <div class="pipeline-tagline">
          “Don’t Search Through Information. Let Information Understand Itself.”
        </div>
      </div>

      <div class="sidebar-content">
        <div>
          <div class="nav-section-title">Cognitive Pipeline</div>
          <ul class="nav-list">
            <li class="nav-item ${state.activeStage === 'find' ? 'active' : ''}" data-stage="find">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span>FIND</span>
              <span class="stage-step">01</span>
            </li>
            <li class="nav-item ${state.activeStage === 'understand' ? 'active' : ''}" data-stage="understand">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>UNDERSTAND</span>
              <span class="stage-step">02</span>
            </li>
            <li class="nav-item ${state.activeStage === 'organize' ? 'active' : ''}" data-stage="organize">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              <span>ORGANIZE</span>
              <span class="stage-step">03</span>
            </li>
            <li class="nav-item ${state.activeStage === 'use' ? 'active' : ''}" data-stage="use">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>USE</span>
              <span class="stage-step">04</span>
            </li>
          </ul>
        </div>

        <div>
          <div class="nav-section-title">Intelligence Hub</div>
          <ul class="nav-list">
            <li class="nav-item ${state.activeStage === 'analytics' ? 'active' : ''}" data-stage="analytics">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
              <span>Analytics & Metrics</span>
            </li>
            <li class="nav-item ${state.activeStage === 'graph' ? 'active' : ''}" data-stage="graph">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
              <span>Knowledge Map</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="demo-scenario-box">
          <div class="demo-scenario-label">
            <span>Demo Mode Scenarios</span>
            <span style="color: var(--primary-600); font-weight: 800;">3 READY</span>
          </div>
          <select class="demo-scenario-select" id="sidebar-scenario-select">
            ${scenariosOptions}
          </select>
          <div style="margin-top: 8px; font-size: 0.68rem; color: var(--slate-500); line-height: 1.3;">
            Switch scenarios to test conflict detection, missing info & health scores.
          </div>
        </div>
      </div>
    </aside>
  `;

  // Event handlers
  container.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const stage = item.getAttribute('data-stage');
      stateService.setStage(stage);
    });
  });

  container.querySelector('#brand-home-click')?.addEventListener('click', () => {
    stateService.setStage('find');
  });

  container.querySelector('#sidebar-scenario-select')?.addEventListener('change', (e) => {
    const selectedKey = e.target.value;
    stateService.setScenario(selectedKey);
    showToast(`Switched scenario to: ${DEMO_SCENARIOS[selectedKey].name}`, "success");
  });
}
