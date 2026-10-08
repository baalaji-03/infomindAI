// InfoMind AI - Interactive Canvas-Based Knowledge & Relationship Graph
import { stateService } from '../services/api.js';
import { openEvidenceModal } from './EvidenceModal.js';
import { showToast } from './Toast.js';

export class KnowledgeGraphComponent {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.canvas = null;
    this.ctx = null;
    this.nodes = [];
    this.links = [];
    this.animId = null;
    this.isDragging = false;
    this.draggedNode = null;
    this.hoveredNode = null;
    this.selectedNode = null;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.startPan = { x: 0, y: 0 };
    this.filterType = 'all';

    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="kg-canvas-container" id="kg-canvas-box">
        <div class="kg-legend">
          <div class="kg-legend-item"><span class="legend-dot" style="background: #2563EB;"></span> Documents</div>
          <div class="kg-legend-item"><span class="legend-dot" style="background: #EF4444;"></span> Conflicts</div>
          <div class="kg-legend-item"><span class="legend-dot" style="background: #8B5CF6;"></span> Missing Info</div>
          <div class="kg-legend-item"><span class="legend-dot" style="background: #10B981;"></span> Key Entities</div>
        </div>

        <div class="kg-controls">
          <button class="kg-btn" id="kg-zoom-in" title="Zoom In">＋</button>
          <button class="kg-btn" id="kg-zoom-out" title="Zoom Out">－</button>
          <button class="kg-btn" id="kg-reset" title="Reset View">⟲</button>
        </div>

        <canvas id="kg-canvas" style="display: block; width: 100%; height: 100%; cursor: grab;"></canvas>

        <div id="kg-node-inspector" style="position: absolute; bottom: 16px; left: 16px; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 12px 16px; max-width: 340px; box-shadow: var(--shadow-md); display: none; z-index: 20;">
          <div id="kg-inspector-content"></div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#kg-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.setupResize();
    this.loadData();
    this.bindEvents();
    this.startSimulation();
  }

  setupResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 520;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  loadData() {
    const scenario = stateService.getState().scenario;
    if (!scenario || !scenario.knowledgeGraph) return;

    const rawNodes = scenario.knowledgeGraph.nodes || [];
    const rawLinks = scenario.knowledgeGraph.links || [];

    // Layout initialization around center
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    this.nodes = rawNodes.map((n, i) => {
      const angle = (i / rawNodes.length) * Math.PI * 2;
      const radius = 100 + (i % 3) * 60;
      return {
        ...n,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: n.size ? n.size / 1.5 : 12
      };
    });

    this.links = rawLinks.map(l => {
      return {
        ...l,
        sourceNode: this.nodes.find(n => n.id === l.source) || this.nodes[0],
        targetNode: this.nodes.find(n => n.id === l.target) || this.nodes[1]
      };
    }).filter(l => l.sourceNode && l.targetNode);
  }

  bindEvents() {
    const box = this.canvas;

    box.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - this.panX) / this.zoom;
      const mouseY = (e.clientY - rect.top - this.panY) / this.zoom;

      const hit = this.findNodeAt(mouseX, mouseY);
      if (hit) {
        this.isDragging = true;
        this.draggedNode = hit;
        this.selectedNode = hit;
        this.showNodeInspector(hit);
        box.style.cursor = 'grabbing';
      } else {
        this.isPanning = true;
        this.startPan = { x: e.clientX - this.panX, y: e.clientY - this.panY };
        this.hideNodeInspector();
      }
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - this.panX) / this.zoom;
      const mouseY = (e.clientY - rect.top - this.panY) / this.zoom;

      if (this.isDragging && this.draggedNode) {
        this.draggedNode.x = mouseX;
        this.draggedNode.y = mouseY;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
      } else if (this.isPanning) {
        this.panX = e.clientX - this.startPan.x;
        this.panY = e.clientY - this.startPan.y;
      } else {
        const hit = this.findNodeAt(mouseX, mouseY);
        if (hit !== this.hoveredNode) {
          this.hoveredNode = hit;
          box.style.cursor = hit ? 'pointer' : 'grab';
        }
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.draggedNode = null;
      this.isPanning = false;
      if (this.canvas) {
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
      }
    });

    // Zoom controls
    this.container.querySelector('#kg-zoom-in')?.addEventListener('click', () => {
      this.zoom = Math.min(2.5, this.zoom + 0.2);
    });

    this.container.querySelector('#kg-zoom-out')?.addEventListener('click', () => {
      this.zoom = Math.max(0.4, this.zoom - 0.2);
    });

    this.container.querySelector('#kg-reset')?.addEventListener('click', () => {
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
      this.loadData();
    });
  }

  findNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dx = n.x - x;
      const dy = n.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 4) {
        return n;
      }
    }
    return null;
  }

  showNodeInspector(node) {
    const inspector = this.container.querySelector('#kg-node-inspector');
    const content = this.container.querySelector('#kg-inspector-content');
    if (!inspector || !content) return;

    let typeBadge = '';
    let actionBtn = '';

    if (node.group === 'conflict') {
      typeBadge = '<span style="font-size:0.65rem; font-weight:800; background:#fef2f2; color:#b91c1c; padding:2px 6px; border-radius:4px;">CONFLICT DETECTED</span>';
      actionBtn = `<button id="btn-inspect-conflict" style="margin-top:8px; width:100%; padding:6px 10px; font-size:0.75rem; font-weight:700; background:#2563eb; color:#fff; border:none; border-radius:6px; cursor:pointer;">View Conflict Details</button>`;
    } else if (node.group === 'doc') {
      typeBadge = '<span style="font-size:0.65rem; font-weight:800; background:#eff6ff; color:#1d4ed8; padding:2px 6px; border-radius:4px;">INGESTED DOCUMENT</span>';
      actionBtn = `<button id="btn-inspect-doc" style="margin-top:8px; width:100%; padding:6px 10px; font-size:0.75rem; font-weight:700; background:#2563eb; color:#fff; border:none; border-radius:6px; cursor:pointer;">Inspect in Understand View</button>`;
    } else if (node.group === 'missing') {
      typeBadge = '<span style="font-size:0.65rem; font-weight:800; background:#f5f3ff; color:#7c3aed; padding:2px 6px; border-radius:4px;">MISSING INFORMATION GAP</span>';
    } else {
      typeBadge = '<span style="font-size:0.65rem; font-weight:800; background:#ecfdf5; color:#047857; padding:2px 6px; border-radius:4px;">EXTRACTED ENTITY</span>';
    }

    content.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
        ${typeBadge}
        <button id="close-inspector" style="background:none; border:none; font-size:0.8rem; cursor:pointer; color:#64748b;">✕</button>
      </div>
      <div style="font-weight:700; font-size:0.88rem; color:#0f172a; margin-top:4px;">${node.label}</div>
      <div style="font-size:0.74rem; color:#64748b; margin-top:2px;">Network Connections: ${this.links.filter(l => l.sourceNode === node || l.targetNode === node).length} linked items</div>
      ${actionBtn}
    `;

    inspector.style.display = 'block';

    content.querySelector('#close-inspector')?.addEventListener('click', () => {
      inspector.style.display = 'none';
    });

    content.querySelector('#btn-inspect-conflict')?.addEventListener('click', () => {
      stateService.setStage('organize');
    });

    content.querySelector('#btn-inspect-doc')?.addEventListener('click', () => {
      stateService.setStage('understand');
    });
  }

  hideNodeInspector() {
    const inspector = this.container.querySelector('#kg-node-inspector');
    if (inspector) inspector.style.display = 'none';
  }

  startSimulation() {
    const tick = () => {
      this.updatePhysics();
      this.draw();
      this.animId = requestAnimationFrame(tick);
    };
    this.animId = requestAnimationFrame(tick);
  }

  updatePhysics() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Repulsion between all nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 180) {
          const force = (180 - dist) / dist * 0.4;
          if (a !== this.draggedNode) {
            a.vx -= dx * force * 0.05;
            a.vy -= dy * force * 0.05;
          }
          if (b !== this.draggedNode) {
            b.vx += dx * force * 0.05;
            b.vy += dy * force * 0.05;
          }
        }
      }
    }

    // Spring attraction along links
    for (const l of this.links) {
      const a = l.sourceNode;
      const b = l.targetNode;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 110;
      const force = (dist - targetDist) * 0.012;

      if (a !== this.draggedNode) {
        a.vx += (dx / dist) * force;
        a.vy += (dy / dist) * force;
      }
      if (b !== this.draggedNode) {
        b.vx -= (dx / dist) * force;
        b.vy -= (dy / dist) * force;
      }
    }

    // Gentle center gravity & velocity damping
    for (const n of this.nodes) {
      if (n === this.draggedNode) continue;
      n.vx += (centerX - n.x) * 0.0015;
      n.vy += (centerY - n.y) * 0.0015;

      n.vx *= 0.88;
      n.vy *= 0.88;

      n.x += n.vx;
      n.y += n.vy;
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // Draw Links
    for (const l of this.links) {
      const a = l.sourceNode;
      const b = l.targetNode;
      const isHighlighted = this.hoveredNode && (a === this.hoveredNode || b === this.hoveredNode);

      this.ctx.beginPath();
      this.ctx.moveTo(a.x, a.y);
      this.ctx.lineTo(b.x, b.y);

      if (l.style === 'dashed') {
        this.ctx.setLineDash([4, 4]);
      } else {
        this.ctx.setLineDash([]);
      }

      this.ctx.strokeStyle = isHighlighted ? '#3b82f6' : (l.sourceNode.group === 'conflict' || l.targetNode.group === 'conflict') ? 'rgba(239, 68, 68, 0.45)' : 'rgba(203, 213, 225, 0.7)';
      this.ctx.lineWidth = isHighlighted ? 2.5 : 1.4;
      this.ctx.stroke();

      // Link text label
      if (l.label && (isHighlighted || this.zoom > 0.9)) {
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '9px Plus Jakarta Sans, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(l.label, midX, midY - 6);
      }
    }
    this.ctx.setLineDash([]);

    // Draw Nodes
    for (const n of this.nodes) {
      const isHovered = n === this.hoveredNode;
      const isSelected = n === this.selectedNode;

      // Glow circle for conflict nodes or selected
      if (n.group === 'conflict' || isHovered || isSelected) {
        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
        this.ctx.fillStyle = n.group === 'conflict' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)';
        this.ctx.fill();
      }

      // Base circle
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = n.color || '#2563eb';
      this.ctx.fill();
      this.ctx.lineWidth = isSelected ? 3 : 2;
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.stroke();

      // Label badge
      this.ctx.font = `600 ${n.size > 22 ? 11 : 10}px Plus Jakarta Sans, sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';

      const labelText = n.label;
      const textWidth = this.ctx.measureText(labelText).width;
      const textY = n.y + n.radius + 4;

      // Background pill for label
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      this.ctx.beginPath();
      this.ctx.roundRect(n.x - textWidth / 2 - 5, textY - 2, textWidth + 10, 16, 4);
      this.ctx.fill();
      this.ctx.strokeStyle = '#e2e8f0';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillText(labelText, n.x, textY);
    }

    this.ctx.restore();
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }
}
