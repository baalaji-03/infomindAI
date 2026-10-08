// InfoMind AI – Intelligent Information Understanding & Processing
// Main Application Controller & View Orchestrator

import './style.css';
import { stateService } from './services/api.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderHeader } from './components/Header.js';
import { renderStagePipeline } from './components/StagePipeline.js';
import { renderFindView } from './components/FindView.js';
import { renderUnderstandView } from './components/UnderstandView.js';
import { renderOrganizeView } from './components/OrganizeView.js';
import { renderUseView } from './components/UseView.js';
import { renderAnalyticsView } from './components/AnalyticsView.js';
import { renderGraphView } from './components/GraphView.js';

class InfoMindApp {
  constructor() {
    this.appEl = document.getElementById('app');
    this.currentViewStage = null;
    this.initLayout();
    this.subscribeState();
    this.render();
  }

  initLayout() {
    this.appEl.innerHTML = `
      <div id="sidebar-container"></div>
      <div class="main-wrapper">
        <div id="header-container"></div>
        <div id="pipeline-container"></div>
        <main id="view-container" role="main"></main>
      </div>
    `;

    this.sidebarContainer = this.appEl.querySelector('#sidebar-container');
    this.headerContainer = this.appEl.querySelector('#header-container');
    this.pipelineContainer = this.appEl.querySelector('#pipeline-container');
    this.viewContainer = this.appEl.querySelector('#view-container');
  }

  subscribeState() {
    stateService.subscribe((state) => {
      this.render();
    });
  }

  render() {
    const state = stateService.getState();

    // Render Shell Components
    renderSidebar(this.sidebarContainer);
    renderHeader(this.headerContainer);

    // Render pipeline bar if in 4 stages
    if (['find', 'understand', 'organize', 'use'].includes(state.activeStage)) {
      this.pipelineContainer.style.display = 'block';
      renderStagePipeline(this.pipelineContainer);
    } else {
      this.pipelineContainer.style.display = 'none';
    }

    // Render Main View according to active stage
    switch (state.activeStage) {
      case 'find':
        renderFindView(this.viewContainer);
        break;
      case 'understand':
        renderUnderstandView(this.viewContainer);
        break;
      case 'organize':
        renderOrganizeView(this.viewContainer);
        break;
      case 'use':
        renderUseView(this.viewContainer);
        break;
      case 'analytics':
        renderAnalyticsView(this.viewContainer);
        break;
      case 'graph':
        renderGraphView(this.viewContainer);
        break;
      default:
        renderFindView(this.viewContainer);
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Bootstrap application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new InfoMindApp();
});
