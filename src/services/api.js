// InfoMind AI - Hybrid API & State Management Layer
// Seamlessly connects with FastAPI backend or powers standalone high-fidelity browser engine

import { DEMO_SCENARIOS } from '../data/demoScenarios.js';
import { parseUploadedFile } from './documentParser.js';

class StateService {
  constructor() {
    this.currentScenarioKey = 'ma_due_diligence';
    this.backendUrl = 'http://127.0.0.1:8000';
    this.isBackendConnected = false;
    this.databaseSyncError = null;
    this.databaseDocuments = [];
    this.activeStage = 'find'; // 'find' | 'understand' | 'organize' | 'use'
    this.activeDocId = null;
    this.searchQuery = '';
    this.selectedCompareDocIds = [];
    this.listeners = new Set();

    // Clone scenario data to allow runtime mutations (adding docs, resolving conflicts, etc.)
    this.state = JSON.parse(JSON.stringify(DEMO_SCENARIOS[this.currentScenarioKey]));
    this.activeDocId = this.state.documents[0]?.id || null;
    this.selectedCompareDocIds = this.state.documents.slice(0, 3).map(d => d.id);

    // Initial check for backend availability
    this.checkBackendConnection();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.getState());
      } catch (err) {
        console.error("State listener error:", err);
      }
    }
  }

  getState() {
    return {
      currentScenarioKey: this.currentScenarioKey,
      scenario: this.state,
      activeStage: this.activeStage,
      activeDocId: this.activeDocId,
      activeDoc: this.state.documents.find(d => d.id === this.activeDocId) || this.state.documents[0],
      searchQuery: this.searchQuery,
      selectedCompareDocIds: this.selectedCompareDocIds,
      isBackendConnected: this.isBackendConnected,
      databaseSyncError: this.databaseSyncError,
      backendUrl: this.backendUrl
    };
  }

  async checkBackendConnection() {
    let timeoutId;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${this.backendUrl}/api/health`, { signal: controller.signal });
      this.isBackendConnected = res.ok;
      if (res.ok) {
        try {
          await this.loadDatabaseDocuments();
          this.databaseSyncError = null;
        } catch (error) {
          this.databaseSyncError = error.message;
          console.error('Unable to load documents from the backend database:', error);
        }
      }
    } catch (e) {
      this.isBackendConnected = false;
    } finally {
      clearTimeout(timeoutId);
    }
    this.mergeDatabaseDocuments();
    this.notify();
    return this.isBackendConnected;
  }

  async loadDatabaseDocuments() {
    const response = await fetch(`${this.backendUrl}/api/documents`);
    if (!response.ok) {
      throw new Error(`Unable to load documents (${response.status} ${response.statusText}).`);
    }

    const documents = await response.json();
    this.databaseDocuments = await Promise.all(documents.map(async (document) => {
      const detailResponse = await fetch(`${this.backendUrl}/api/documents/${document.id}`);
      if (!detailResponse.ok) {
        throw new Error(`Unable to load "${document.original_filename}" (${detailResponse.status} ${detailResponse.statusText}).`);
      }
      return this.toScenarioDocument(await detailResponse.json());
    }));
  }

  toScenarioDocument(document) {
    const rawText = document.raw_text || document.preview_text || '';
    const pages = document.pages || [];
    return {
      id: document.id,
      name: document.original_filename,
      type: document.file_type,
      size: document.file_size_formatted,
      pages: document.page_count,
      date: new Date(document.upload_timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }),
      department: 'Database Documents',
      author: 'Stored in InfoMind Database',
      status: document.status === 'processed' ? 'Analyzed' : document.status,
      health: Math.round(document.health_score),
      summary: rawText.length > 320 ? `${rawText.slice(0, 320)}...` : rawText || 'No extracted text is available.',
      keyTakeaways: [],
      snippets: pages.filter(page => page.content).slice(0, 4).map(page => ({
        page: page.page_number,
        section: `Page ${page.page_number}`,
        text: page.content.slice(0, 500)
      })),
      entities: { financial: [], dates: [], parties: [], obligations: [] },
      rawText,
      databaseDocument: true
    };
  }

  mergeDatabaseDocuments() {
    this.state.documents = this.state.documents.filter(document => !document.databaseDocument);
    const existingNames = new Set(this.state.documents.map(document => document.name.toLowerCase()));
    const databaseDocuments = this.databaseDocuments.filter(document => !existingNames.has(document.name.toLowerCase()));
    this.state.documents.push(...databaseDocuments);

    const databaseNodePrefix = 'node-database-';
    this.state.knowledgeGraph.nodes = this.state.knowledgeGraph.nodes.filter(node => !String(node.id).startsWith(databaseNodePrefix));
    this.state.knowledgeGraph.links = this.state.knowledgeGraph.links.filter(link =>
      !String(link.source).startsWith(databaseNodePrefix) && !String(link.target).startsWith(databaseNodePrefix)
    );
    for (const document of databaseDocuments) {
      const nodeId = `${databaseNodePrefix}${document.id}`;
      this.state.knowledgeGraph.nodes.push({
        id: nodeId,
        label: document.name.slice(0, 20),
        type: 'document',
        group: 'doc',
        size: 22,
        color: '#2563EB'
      });
      this.state.knowledgeGraph.links.push({
        source: nodeId,
        target: this.state.knowledgeGraph.nodes[0].id,
        label: 'stored-document',
        style: 'solid'
      });
    }
  }

  setStage(stage) {
    this.activeStage = stage;
    this.notify();
  }

  setScenario(scenarioKey) {
    if (!DEMO_SCENARIOS[scenarioKey]) return;
    this.currentScenarioKey = scenarioKey;
    this.state = JSON.parse(JSON.stringify(DEMO_SCENARIOS[scenarioKey]));
    this.mergeDatabaseDocuments();
    this.activeDocId = this.state.documents[0]?.id || null;
    this.selectedCompareDocIds = this.state.documents.slice(0, 3).map(d => d.id);
    this.notify();
  }

  setActiveDoc(docId) {
    this.activeDocId = this.state.documents.find(document => String(document.id) === String(docId))?.id || docId;
    this.notify();
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    this.notify();
  }

  toggleCompareDoc(docId) {
    if (this.selectedCompareDocIds.includes(docId)) {
      if (this.selectedCompareDocIds.length > 2) {
        this.selectedCompareDocIds = this.selectedCompareDocIds.filter(id => id !== docId);
      }
    } else {
      if (this.selectedCompareDocIds.length < 4) {
        this.selectedCompareDocIds.push(docId);
      }
    }
    this.notify();
  }

  async uploadFiles(fileList) {
    const parsedDocuments = await Promise.all(Array.from(fileList, parseUploadedFile));
    let newDocs = parsedDocuments;
    let failedFiles = [];

    if (this.isBackendConnected) {
      const formData = new FormData();
      for (const file of fileList) formData.append('files', file);

      const response = await fetch(`${this.backendUrl}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || `Upload failed (${response.status} ${response.statusText}).`);
      }
      failedFiles = result.failed_files || [];

      const parsedByName = new Map(parsedDocuments.map(document => [document.name, document]));
      newDocs = await Promise.all(result.documents.map(async document => {
        const detailResponse = await fetch(`${this.backendUrl}/api/documents/${document.id}`);
        if (!detailResponse.ok) {
          throw new Error(`"${document.original_filename}" was saved, but its details could not be loaded.`);
        }
        const storedDocument = this.toScenarioDocument(await detailResponse.json());
        const parsedDocument = parsedByName.get(document.original_filename);
        return { ...parsedDocument, ...storedDocument };
      }));

      this.databaseDocuments = [
        ...this.databaseDocuments.filter(document => !newDocs.some(newDoc => newDoc.id === document.id)),
        ...newDocs
      ];
    }

    for (const parsed of newDocs) {
      this.state.documents = this.state.documents.filter(document => document.name !== parsed.name);
      this.state.documents.unshift(parsed);

      this.state.knowledgeGraph.nodes.push({
        id: `node-${parsed.id}`,
        label: parsed.name.slice(0, 20),
        type: 'document',
        group: 'doc',
        size: 22,
        color: '#2563EB'
      });

      if (this.state.knowledgeGraph.nodes.length > 1) {
        this.state.knowledgeGraph.links.push({
          source: `node-${parsed.id}`,
          target: this.state.knowledgeGraph.nodes[0].id,
          label: 'cross-reference',
          style: 'solid'
        });
      }
    }

    if (newDocs.length > 0) this.activeDocId = newDocs[0].id;

    // Recalculate scenario metrics
    this.recalculateScenarioHealth();
    this.notify();

    if (failedFiles.length) {
      const failures = failedFiles.map(file => `${file.filename}: ${file.error}`).join('; ');
      throw new Error(`Some files were saved, but others failed: ${failures}`);
    }

    return newDocs;
  }

  async askDocuments(question) {
    const response = await fetch(`${this.backendUrl}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || `Question failed (${response.status} ${response.statusText}).`);
    }

    return {
      answer: result.answer,
      results: result.sources.map(source => ({
        docName: source.document_name,
        page: source.page_number || 1,
        department: 'Database Documents',
        quote: source.snippet || result.answer,
        confidence: Math.round((source.confidence ?? result.confidence_score ?? 0) * 100)
      }))
    };
  }

  recalculateScenarioHealth() {
    const count = this.state.documents.length;
    const avgDocHealth = Math.round(
      this.state.documents.reduce((acc, d) => acc + (d.health || 80), 0) / count
    );
    const conflictPenalty = this.state.conflicts.length * 4;
    const missingPenalty = this.state.missingInformation.length * 3;
    const overall = Math.max(50, Math.min(99, avgDocHealth - Math.round(conflictPenalty / 2) - Math.round(missingPenalty / 2)));

    this.state.healthScore.overall = overall;
    this.state.healthScore.grade = overall >= 90 ? "A" : overall >= 80 ? "B" : overall >= 70 ? "C" : "D";
  }

  resolveConflict(conflictId) {
    const idx = this.state.conflicts.findIndex(c => c.id === conflictId);
    if (idx !== -1) {
      const resolved = this.state.conflicts.splice(idx, 1)[0];
      // Boost consistency score
      const consistencyPillar = this.state.healthScore.pillars.find(p => p.name === "Consistency");
      if (consistencyPillar) {
        consistencyPillar.score = Math.min(99, consistencyPillar.score + 7);
      }
      this.recalculateScenarioHealth();
      this.notify();
      return resolved;
    }
  }

  resolveMissingInfo(missingId) {
    const idx = this.state.missingInformation.findIndex(m => m.id === missingId);
    if (idx !== -1) {
      const resolved = this.state.missingInformation.splice(idx, 1)[0];
      const compPillar = this.state.healthScore.pillars.find(p => p.name === "Completeness");
      if (compPillar) {
        compPillar.score = Math.min(99, compPillar.score + 6);
      }
      this.recalculateScenarioHealth();
      this.notify();
      return resolved;
    }
  }

  // Semantic Search simulation across active documents
  searchDocuments(query) {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    const results = [];

    for (const doc of this.state.documents) {
      let score = 0;
      let matchedQuote = "";
      let matchedPage = 1;

      // Check title
      if (doc.name.toLowerCase().includes(q)) score += 30;

      // Check summary
      if (doc.summary.toLowerCase().includes(q)) {
        score += 40;
        matchedQuote = doc.summary;
      }

      // Check snippets
      for (const snip of doc.snippets || []) {
        if (snip.text.toLowerCase().includes(q) || snip.section.toLowerCase().includes(q)) {
          score += 50;
          matchedQuote = snip.text;
          matchedPage = snip.page;
          break;
        }
      }

      // Check entities
      for (const cat of ['financial', 'dates', 'parties', 'obligations']) {
        for (const ent of doc.entities[cat] || []) {
          if (ent.toLowerCase().includes(q)) {
            score += 35;
            if (!matchedQuote) matchedQuote = `Identified ${cat} entity: ${ent}`;
          }
        }
      }

      // If no exact match, perform fuzzy word overlap
      if (score === 0) {
        const queryWords = q.split(/\s+/).filter(w => w.length > 2);
        let overlap = 0;
        const allText = (doc.summary + " " + (doc.rawText || "")).toLowerCase();
        for (const word of queryWords) {
          if (allText.includes(word)) overlap++;
        }
        if (overlap > 0) {
          score = Math.min(75, 40 + overlap * 15);
          matchedQuote = doc.summary;
        }
      }

      if (score > 0) {
        results.push({
          docId: doc.id,
          docName: doc.name,
          docType: doc.type,
          page: matchedPage,
          confidence: Math.min(99, Math.max(65, 55 + score)),
          quote: matchedQuote || doc.summary,
          department: doc.department
        });
      }
    }

    // Sort by confidence descending
    return results.sort((a, b) => b.confidence - a.confidence);
  }
}

export const stateService = new StateService();
