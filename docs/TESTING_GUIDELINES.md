# Automated Testing Guidelines & Test Matrix

## 1. Testing Strategy
The test suite ensures regression protection across all layers of the platform:
- **Unit & Contract Tests**: Verify settings parsing, password hashing, and RFC 7807 error schema formatting.
- **Integration Tests**: Verify FastAPI routing, middleware correlation tracking, and subsystem health probes.
- **Security & Authorization Tests**: Verify JWT signing, token rotation, expired token rejection, RBAC permission barriers, and cross-tenant access denial.

---

## 2. Test Execution Commands

Run the full test suite with verbose output:
```bash
cd backend
pytest -v
```

Run test suite with code coverage analysis:
```bash
pytest --cov=app --cov-report=term-missing
```

Run a specific test module:
```bash
pytest tests/test_auth.py -v
pytest tests/test_tenants_and_users.py -v
pytest tests/test_health.py -v
```

---

## 3. Test Fixture Architecture
The test infrastructure (`backend/tests/conftest.py`) implements clean session isolation:
- **Engine**: In-memory `sqlite+aiosqlite:///:memory:` with `StaticPool` and `check_same_thread=False`.
- **Database Schema**: Dynamically created before each test function and dropped after each test function to guarantee zero cross-test pollution.
- **FastAPI Test Client**: Uses `httpx.AsyncClient` with `ASGITransport(app=app)` and dependency injection overrides on `get_db`.
