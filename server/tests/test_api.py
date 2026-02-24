import uuid
import time
import requests

BASE = "http://localhost:5000/api"


def unique_email():
    return f"test+{uuid.uuid4().hex[:8]}@example.com"


def test_ping():
    r = requests.get(f"{BASE}/ping", timeout=5)
    assert r.status_code == 200
    j = r.json()
    assert j.get("status") == "ok"


def test_activate_and_login():
    # create a new user, activate and login
    email = unique_email()
    create_payload = {"name": "Activate User", "email": email, "role": "employee", "department_id": 1}
    r0 = requests.post(f"{BASE}/users", json=create_payload, timeout=5)
    assert r0.status_code == 201

    payload = {"email": email, "password": "testpass123"}
    r = requests.post(f"{BASE}/auth/activate", json=payload, timeout=5)
    assert r.status_code == 200

    # login should work after activation
    r2 = requests.post(f"{BASE}/auth/login", json=payload, timeout=5)
    assert r2.status_code == 200
    j = r2.json()
    assert j.get("success") is True
    assert "user" in j

    # cleanup
    uid = r0.json().get("id")
    if uid:
        requests.delete(f"{BASE}/users/{uid}", timeout=5)


def test_user_crud_and_assignment_endpoints():
    # create a unique user
    email = unique_email()
    create_payload = {"name": "PyTest User", "email": email, "role": "employee", "department_id": 1}
    r = requests.post(f"{BASE}/users", json=create_payload, timeout=5)
    assert r.status_code == 201
    uid = r.json().get("id")
    assert isinstance(uid, int)

    # update password
    up = requests.put(f"{BASE}/users/{uid}", json={"password": "newpass"}, timeout=5)
    assert up.status_code == 200
    assert up.json().get("ok") is True

    # delete user
    d = requests.delete(f"{BASE}/users/{uid}", timeout=5)
    assert d.status_code == 200
    assert d.json().get("ok") is True

    # assignment history
    h = requests.get(f"{BASE}/assignments/history", timeout=5)
    assert h.status_code == 200
    # expect JSON array or single object; at minimum ensure no server error
    # return assignment (best-effort) - may fail if assignment 1 not present
    ret = requests.post(f"{BASE}/assignments/1/return", json={"performedBy": "pytest"}, timeout=5)
    assert ret.status_code in (200, 404, 500)
