// InfoMind AI - Intelligence Analytics & Performance Dashboard
import { stateService } from '../services/api.js';
import Chart from 'chart.js/auto';

let radarChartInstance = null;
let barChartInstance = null;

export function renderAnalyticsView(container) {
  const state = stateService.getState();
  const hs = state.scenario.healthScore;

  container.innerHTML = `
    <div class="view-content-wrapper">
      <!-- Hero Banner -->
      <div class="section-hero-banner">
        <div class="hero-left">
          <div class="hero-badge">
            <span style="color: var(--primary-600); font-weight: 800;">INTELLIGENCE HUB</span>
            <span>Forensics & ROI Metrics</span>
          </div>
          <h1 class="hero-title">Analytics Dashboard: Information Health & Risk Velocity</h1>
          <p class="hero-desc">
            Continuous auditing metrics, document processing volume, pillar benchmarks, and calculated enterprise time-savings.
          </p>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="analytics-metrics-row">
        <div class="metric-stat-card">
          <span class="metric-stat-label">Total Tokens Indexed</span>
          <span class="metric-stat-value">148,290</span>
          <span class="metric-stat-change">↑ 100% Parsed & Chunked</span>
        </div>
        <div class="metric-stat-card">
          <span class="metric-stat-label">Hours Saved This Month</span>
          <span class="metric-stat-value">42.8 hrs</span>
          <span class="metric-stat-change">↑ 92% Diligence Speedup</span>
        </div>
        <div class="metric-stat-card">
          <span class="metric-stat-label">Health Consistency Index</span>
          <span class="metric-stat-value">${hs.pillars.find(p=>p.name==='Consistency')?.score || 68}%</span>
          <span class="metric-stat-change">Benchmark: 95%</span>
        </div>
        <div class="metric-stat-card">
          <span class="metric-stat-label">Average Ingestion Time</span>
          <span class="metric-stat-value">1.4s</span>
          <span class="metric-stat-change">Real-time vector extraction</span>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="analytics-charts-grid">
        <!-- Radar Chart: 5-Pillar Health Radar -->
        <div class="im-card">
          <div class="im-card-header">
            <div class="card-title-group">
              <div class="card-title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                </svg>
              </div>
              <div>
                <h2 class="card-title">Information Health Radar Analysis</h2>
                <p class="card-subtitle">Active Score vs Institutional Gold Standard</p>
              </div>
            </div>
          </div>
          <div class="chart-card-body">
            <canvas id="healthRadarChart"></canvas>
          </div>
        </div>

        <!-- Bar Chart: Risk & Contradiction Distribution -->
        <div class="im-card">
          <div class="im-card-header">
            <div class="card-title-group">
              <div class="card-title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
                </svg>
              </div>
              <div>
                <h2 class="card-title">Cross-Document Risk by Category</h2>
                <p class="card-subtitle">Severity weighting across Legal, Financial & Ops</p>
              </div>
            </div>
          </div>
          <div class="chart-card-body">
            <canvas id="riskBarChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Enterprise ROI Calculator Card -->
      <div class="im-card">
        <div class="im-card-header">
          <div class="card-title-group">
            <div class="card-title-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <h2 class="card-title">Enterprise ROI & Friction Reduction Model</h2>
              <p class="card-subtitle">Estimate operational overhead eliminated with InfoMind AI</p>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 12px 0;">
          <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 16px;">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--slate-500); text-transform: uppercase;">Manual Review Time</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--slate-900); margin: 4px 0;">48.0 Hours</div>
            <div style="font-size: 0.72rem; color: var(--slate-600);">Based on 64 pages reviewed by senior legal associates ($250/hr).</div>
          </div>

          <div style="background: var(--primary-50); border: 1px solid var(--primary-200); border-radius: var(--radius-md); padding: 16px;">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary-700); text-transform: uppercase;">InfoMind Synthesis Time</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary-700); margin: 4px 0;">3.5 Minutes</div>
            <div style="font-size: 0.72rem; color: var(--slate-600);">Automated AST parsing, conflict extraction, and memo generation.</div>
          </div>

          <div style="background: var(--emerald-50); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 16px;">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--emerald-700); text-transform: uppercase;">Net Economic Value</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--emerald-700); margin: 4px 0;">$11,850+</div>
            <div style="font-size: 0.72rem; color: var(--slate-600);">Per diligence batch, excluding avoided contract discrepancy losses.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize Charts
  setTimeout(() => {
    initCharts(state);
  }, 50);
}

function initCharts(state) {
  const hs = state.scenario.healthScore;
  const radarCtx = document.getElementById('healthRadarChart')?.getContext('2d');
  const barCtx = document.getElementById('riskBarChart')?.getContext('2d');

  if (radarChartInstance) radarChartInstance.destroy();
  if (barChartInstance) barChartInstance.destroy();

  if (radarCtx) {
    radarChartInstance = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: hs.pillars.map(p => p.name),
        datasets: [
          {
            label: 'Current Ingested State',
            data: hs.pillars.map(p => p.score),
            backgroundColor: 'rgba(37, 99, 235, 0.25)',
            borderColor: '#2563eb',
            pointBackgroundColor: '#2563eb',
            borderWidth: 2
          },
          {
            label: 'Benchmark Target',
            data: hs.pillars.map(p => p.benchmark),
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            borderDash: [4, 4],
            pointBackgroundColor: '#10b981',
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 40,
            max: 100,
            ticks: { stepSize: 20, display: false },
            pointLabels: { font: { size: 10, family: 'Plus Jakarta Sans', weight: '600' } }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  if (barCtx) {
    barChartInstance = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Financial Contradictions', 'Legal Lock-in', 'Compliance & Gaps', 'Operational SLA'],
        datasets: [{
          label: 'Severity Weight Index',
          data: [92, 74, 80, 65],
          backgroundColor: [
            'rgba(239, 68, 68, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(139, 92, 246, 0.85)',
            'rgba(59, 130, 246, 0.85)'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100 }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
