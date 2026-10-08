import io
from fastapi.testclient import TestClient
from main import app, init_db

# Initialize database
init_db()
client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "InfoMind AI – Intelligent Information Understanding & Processing"
    print("[PASS] test_root passed")


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["documents_indexed"] >= 3
    print("[PASS] test_health passed")


def test_get_documents():
    response = client.get("/api/documents")
    assert response.status_code == 200
    docs = response.json()
    assert isinstance(docs, list)
    assert len(docs) >= 3
    print(f"[PASS] test_get_documents passed: {len(docs)} documents returned")


def test_get_analytics():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "documents_count" in data
    assert "conflicts_count" in data
    assert "health_score" in data
    assert data["health_score"] > 0
    print(f"[PASS] test_get_analytics passed: Health Score = {data['health_score']}")


def test_get_insights():
    response = client.get("/api/insights")
    assert response.status_code == 200
    insights = response.json()
    assert isinstance(insights, list)
    assert len(insights) > 0
    print(f"[PASS] test_get_insights passed: {len(insights)} insights returned")


def test_ask():
    question = "What is the project submission deadline?"
    payload = {"question": question}
    response = client.post("/api/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data
    assert len(data["sources"]) > 0
    history = client.get("/api/search-history").json()
    assert any(entry["query"] == question and entry["search_type"] == "semantic" for entry in history)
    print(f"[PASS] test_ask passed: Answer = '{data['answer'][:80]}...'")


def test_summarize():
    response = client.post("/api/summarize", json={"summary_type": "executive"})
    assert response.status_code == 200
    data = response.json()
    assert "overview" in data
    assert "key_points" in data
    assert len(data["key_points"]) > 0
    assert "health_score" in data
    print(f"[PASS] test_summarize passed: {len(data['key_points'])} key points, Health Score = {data['health_score']}")


def test_compare():
    # Use first two seeded docs
    docs = client.get("/api/documents").json()
    doc1_id = docs[0]["id"]
    doc2_id = docs[1]["id"]
    response = client.post("/api/compare", json={"doc1_id": doc1_id, "doc2_id": doc2_id})
    assert response.status_code == 200
    data = response.json()
    assert "changed_points" in data
    assert "added_points" in data
    assert "unchanged_points" in data
    print(f"[PASS] test_compare passed: {len(data['changed_points'])} changed, {len(data['added_points'])} added")


def test_conflicts():
    response = client.post("/api/conflicts", json={})
    assert response.status_code == 200
    data = response.json()
    assert "conflicts" in data
    assert data["total_conflicts"] > 0
    print(f"[PASS] test_conflicts passed: {data['total_conflicts']} conflicts detected")


def test_missing():
    response = client.post("/api/missing", json={})
    assert response.status_code == 200
    data = response.json()
    assert "missing_items" in data
    assert data["total_missing"] > 0
    print(f"[PASS] test_missing passed: {data['total_missing']} missing items identified")


def test_actions():
    response = client.post("/api/actions", json={})
    assert response.status_code == 200
    data = response.json()
    assert "actions" in data
    assert data["total_actions"] > 0
    print(f"[PASS] test_actions passed: {data['total_actions']} actions generated")


def test_upload_and_process():
    # Create sample text file in memory
    sample_content = (
        b"Quarterly Financial and Operations Review.\n"
        b"Project deadline is set for 30 November 2026.\n"
        b"Total allocated funds: $500,000.\n"
        b"Mandatory sign-off by Department Director."
    )
    files = [("files", ("Review_Q4.txt", io.BytesIO(sample_content), "text/plain"))]
    response = client.post("/api/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    assert len(data["documents"]) == 1
    new_doc_id = data["documents"][0]["id"]
    print(f"[PASS] test_upload passed: Created document ID {new_doc_id}")

    # Process document
    proc_response = client.post("/api/process", json={"document_ids": [new_doc_id]})
    assert proc_response.status_code == 200
    proc_data = proc_response.json()
    assert proc_data["processed_count"] == 1
    print("[PASS] test_process passed: Processed document successfully")

    # Clean up created doc
    del_response = client.delete(f"/api/documents/{new_doc_id}")
    assert del_response.status_code == 200
    print("[PASS] test_delete passed: Cleaned up test document")

    for extension, content, content_type in [
        ("csv", b"item,amount\nconsulting,1250\n", "text/csv"),
        ("json", b'{"item":"consulting","amount":1250}', "application/json")
    ]:
        upload = client.post(
            "/api/upload",
            files=[("files", (f"Review.{extension}", io.BytesIO(content), content_type))]
        )
        assert upload.status_code == 201, f"Failed {extension} upload: {upload.text}"
        saved = upload.json()["documents"][0]
        detail = client.get(f"/api/documents/{saved['id']}")
        assert detail.status_code == 200
        assert "consulting" in detail.json()["raw_text"]
        assert client.delete(f"/api/documents/{saved['id']}").status_code == 200
        print(f"[PASS] test_{extension}_upload passed: Saved and extracted text")


if __name__ == "__main__":
    print("\n--- Running InfoMind AI Backend Verification Suite ---\n")
    test_root()
    test_health()
    test_get_documents()
    test_get_analytics()
    test_get_insights()
    test_ask()
    test_summarize()
    test_compare()
    test_conflicts()
    test_missing()
    test_actions()
    test_upload_and_process()
    print("\n>>> ALL 12 ENDPOINT TESTS PASSED SUCCESSFULLY! <<<\n")
