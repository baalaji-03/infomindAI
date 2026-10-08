/**
 * InfoMind AI - Frontend API Integration Client
 * Connects info.html or any React/Vue/HTML frontend to the FastAPI backend.
 */

const API_BASE_URL = "http://localhost:8000";

// 1. Fetch Dashboard Analytics
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/analytics`);
        if (!response.ok) throw new Error("Failed to load analytics");
        const data = await response.json();

        const docCountEl = document.getElementById("documentCount");
        if (docCountEl) docCountEl.innerText = String(data.documents_count).padStart(2, '0');

        console.log("[InfoMind AI] Analytics loaded:", data);
        return data;
    } catch (err) {
        console.warn("[InfoMind AI] Could not load live analytics, using cached view:", err);
    }
}

// 2. Fetch Document List
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/documents`);
        if (!response.ok) throw new Error("Failed to fetch documents");
        const docs = await response.json();
        console.log("[InfoMind AI] Documents loaded:", docs);
        return docs;
    } catch (err) {
        console.warn("[InfoMind AI] Error fetching documents:", err);
    }
}

// 3. Upload Documents
async function apiUploadFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
        formData.append("files", fileList[i]);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) throw new Error("Upload failed");
        const result = await response.json();
        console.log("[InfoMind AI] Upload successful:", result);
        await loadAnalytics();
        await loadDocuments();
        return result;
    } catch (err) {
        console.error("[InfoMind AI] Upload error:", err);
        alert("Upload error: " + err.message);
    }
}

// 4. Natural Language Smart Search / Q&A
async function apiAskQuestion(question) {
    if (!question || question.trim() === "") return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: question.trim() })
        });
        if (!response.ok) throw new Error("Q&A request failed");
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("[InfoMind AI] Ask error:", err);
        throw err;
    }
}

// 5. AI Information Summarization
async function apiSummarize() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary_type: "executive" })
        });
        if (!response.ok) throw new Error("Summarization failed");
        return await response.json();
    } catch (err) {
        console.error("[InfoMind AI] Summarize error:", err);
        throw err;
    }
}

// 6. Multi-Document Comparison
async function apiCompare(doc1Id, doc2Id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/compare`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doc1_id: doc1Id || 1, doc2_id: doc2Id || 2 })
        });
        if (!response.ok) throw new Error("Comparison failed");
        return await response.json();
    } catch (err) {
        console.error("[InfoMind AI] Compare error:", err);
        throw err;
    }
}

// 7. Detect Conflicts
async function apiGetConflicts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/conflicts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        if (!response.ok) throw new Error("Conflict detection failed");
        return await response.json();
    } catch (err) {
        console.error("[InfoMind AI] Conflict error:", err);
        throw err;
    }
}

// 8. Detect Missing Information
async function apiGetMissing() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/missing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        if (!response.ok) throw new Error("Missing info detection failed");
        return await response.json();
    } catch (err) {
        console.error("[InfoMind AI] Missing info error:", err);
        throw err;
    }
}

// 9. Recommended Actions
async function apiGetActions() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/actions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        if (!response.ok) throw new Error("Action generation failed");
        return await response.json();
    } catch (err) {
        console.error("[InfoMind AI] Actions error:", err);
        throw err;
    }
}

// Auto-initialize when loaded
if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
        loadAnalytics();
        loadDocuments();
    });
}
