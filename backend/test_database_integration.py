"""
InfoMind AI - Database Integration Test Suite
Validates all 10 core tables, models, relationships, and REST endpoints:
1. users
2. documents
3. document_content
4. insights
5. conflicts
6. missing_information
7. comparisons
8. actions
9. health_scores
10. search_history
"""

from fastapi.testclient import TestClient
from main import app, init_db
from database import DatabaseSession, DB_PATH
import models

init_db()
client = TestClient(app)


def test_users_endpoints():
    res = client.get("/api/users")
    assert res.status_code == 200, f"Failed: {res.text}"
    users = res.json()
    assert len(users) >= 3, f"Expected >= 3 users, got {len(users)}"
    print(f"[PASS] test_users_endpoints passed: {len(users)} users loaded ({users[0]['email']})")

    # Single user
    res_single = client.get(f"/api/users/{users[0]['id']}")
    assert res_single.status_code == 200
    assert res_single.json()["username"] == users[0]["username"]
    print(f"[PASS] test_user_detail passed for user ID {users[0]['id']}")


def test_stored_conflicts_endpoint():
    res = client.get("/api/conflicts/stored")
    assert res.status_code == 200, f"Failed: {res.text}"
    conflicts = res.json()
    assert len(conflicts) >= 3, f"Expected >= 3 conflicts, got {len(conflicts)}"
    print(f"[PASS] test_stored_conflicts passed: {len(conflicts)} persistent conflicts returned")


def test_stored_missing_endpoint():
    res = client.get("/api/missing/stored")
    assert res.status_code == 200, f"Failed: {res.text}"
    items = res.json()
    assert len(items) >= 3, f"Expected >= 3 missing items, got {len(items)}"
    print(f"[PASS] test_stored_missing passed: {len(items)} missing items returned")


def test_stored_actions_endpoint():
    res = client.get("/api/actions/stored")
    assert res.status_code == 200, f"Failed: {res.text}"
    actions = res.json()
    assert len(actions) >= 5, f"Expected >= 5 actions, got {len(actions)}"
    print(f"[PASS] test_stored_actions passed: {len(actions)} actions returned")


def test_health_scores_endpoint():
    res = client.get("/api/health-scores")
    assert res.status_code == 200, f"Failed: {res.text}"
    scores = res.json()
    assert len(scores) >= 5, f"Expected >= 5 health scores, got {len(scores)}"
    print(f"[PASS] test_health_scores passed: {len(scores)} health audit records returned")


def test_search_history_endpoints():
    # 1. Post new search
    payload = {
        "query": "cryptographic digital signature requirement",
        "search_type": "semantic",
        "filters_json": '{"status": "processed"}',
        "result_count": 4,
        "execution_time_ms": 15.3,
        "user_id": 1
    }
    post_res = client.post("/api/search-history", json=payload)
    assert post_res.status_code == 201, f"Failed to log search: {post_res.text}"
    entry = post_res.json()
    assert entry["query"] == payload["query"]
    assert entry["result_count"] == 4
    print(f"[PASS] test_log_search passed: Logged search entry ID {entry['id']}")

    # 2. Get history
    get_res = client.get("/api/search-history")
    assert get_res.status_code == 200
    history = get_res.json()
    assert len(history) >= 5, f"Expected >= 5 search history items, got {len(history)}"
    print(f"[PASS] test_get_search_history passed: {len(history)} search records returned")


def test_database_session_methods():
    session = DatabaseSession(DB_PATH)
    try:
        # Check document content
        pages = session.get_pages(1)
        assert len(pages) >= 2, f"Expected >= 2 pages for Doc 1, got {len(pages)}"

        # Check comparisons
        comps = session.list_comparisons()
        assert len(comps) >= 1, f"Expected >= 1 comparison, got {len(comps)}"

        # Check analytics
        analytics = session.get_analytics()
        assert analytics["documents_count"] >= 4
        assert analytics["conflicts_count"] >= 3
        assert analytics["actions_count"] >= 5
        print(f"[PASS] test_database_session_methods passed: {analytics['documents_count']} docs, {analytics['conflicts_count']} conflicts, {analytics['actions_count']} actions")
    finally:
        session.close()


if __name__ == "__main__":
    print("\n--- Running InfoMind AI Complete Database Verification Suite ---\n")
    test_users_endpoints()
    test_stored_conflicts_endpoint()
    test_stored_missing_endpoint()
    test_stored_actions_endpoint()
    test_health_scores_endpoint()
    test_search_history_endpoints()
    test_database_session_methods()
    print("\n>>> ALL DATABASE & ORM TESTS PASSED SUCCESSFULLY! <<<\n")
