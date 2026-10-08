// InfoMind AI - Full Knowledge Graph Explorer View
import { stateService } from '../services/api.js';
import { KnowledgeGraphComponent } from './KnowledgeGraph.js';

let fullKG = null;

export function renderGraphView(container) {
  const state = stateService.getState();
  const graph = state.scenario.knowledgeGraph;

  container.innerHTML = `
    <div class="view-content-wrapper">
      <div class="section-hero-banner">
        <div class="hero-left">
          <div class="hero-badge">
            <span style="color: var(--primary-600); font-weight: 800;">NEURAL MAP</span>
            <span>Cross-Document Knowledge Topology</span>
          </div>
          <h1 class="hero-title">Knowledge Graph: Neural Entity & Discrepancy Network</h1>
          <p class="hero-desc">
            Visual topology mapping relationships, conflicting statements, missing requirements, and key personnel across all ingested corporate documents.
          </p>
        </div>
        <div class="hero-actions">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary-700);">
            ${graph.nodes.length} Nodes • ${graph.links.length} Neural Edges
          </span>
        </div>
      </div>

      <div class="im-card" style="padding: 16px;">
        <div id="full-graph-mount" style="width: 100%; height: 600px;"></div>
      </div>
    </div>
  `;

  if (fullKG) {
    fullKG.destroy();
    fullKG = null;
  }
  fullKG = new KnowledgeGraphComponent('full-graph-mount');
}
