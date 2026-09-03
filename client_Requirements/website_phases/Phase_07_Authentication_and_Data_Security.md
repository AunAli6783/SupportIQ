# Phase 07: Authentication & Cross-Customer Data Security (JWT + Ownership Enforcement)

> **Phase Status:** Planned  
> **Prerequisites:** Phase 02 & Phase 06 Completed (User models & database action tools ready)  
> **Target Outcome:** Industry-standard JWT authentication and strict multi-tenant authorization guards preventing cross-customer data leakage, unauthorized order tampering, and prompt injection attacks.

---

## 1. Objective

Ensure that the AI agent only accesses and modifies records belonging to the **currently authenticated customer**. Customers cannot query other users' order details, delivery addresses, or initiate returns on unauthorized orders.

---

## 2. Security & Authorization Architecture

```
 Customer Logs In
        │
        ▼
 POST /api/v1/store/auth/login
        │
        ▼
 Issues Signed JWT Token (contains customer_id: "CUS-102")
        │
        ▼
 Customer asks AI: "Where is order NC-10001?" (Belongs to CUS-001)
        │
        ▼
 AI Agent receives query + verified customer_id: "CUS-102"
        │
        ▼
 Tool Execution: get_order_status(order_id="NC-10001", requesting_customer_id="CUS-102")
        │
        ▼
 DB Lookup: order.customer_id ("CUS-001") != requesting_customer_id ("CUS-102")
        │
        ▼
 🚨 ACCESS DENIED: "Customer ID CUS-102 is not authorized to access order NC-10001."
```

---

## 3. Implementation Details

### Step 7.1: JWT Authentication & Token Verification (`src/auth/security.py`)

```python
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.config.settings import settings

security_bearer = HTTPBearer(auto_error=False)

def create_access_token(customer_id: str, email: str) -> str:
    """Generate signed JWT session token."""
    expire = datetime.utcnow() + timedelta(days=7)
    payload = {"sub": customer_id, "email": email, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")

def get_current_customer_id(credentials: HTTPAuthorizationCredentials = Security(security_bearer)) -> str:
    """Extract and verify authenticated customer ID from Bearer token."""
    if not credentials:
        return ""
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload.get("sub", "")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")
```

---

### Step 7.2: Multi-Layer Security Guardrails (`src/agent/security.py`)

1. **Anti-SQL Injection Inspection:** Rejects queries containing raw SQL manipulation (`DROP TABLE`, `UNION SELECT`, `OR 1=1`).
2. **System Prompt Protection:** Blocks attempts to leak system instructions, API keys, or raw vector embeddings.
3. **Cross-Customer Ownership Barrier:** Enforced directly in tool functions (`order_tool.py`, `action_tools.py`).

---

## 4. Verification & Testing Plan

1. **Authorization Enforcement Test:** Log in as `CUS-002`, query order `NC-10001` (`CUS-001`) -> Verify `SECURITY DENIED` response with zero data leakage.
2. **Authorized Access Test:** Log in as `CUS-001`, query order `NC-10001` -> Verify full order details returned.
3. **JWT Expiration Test:** Send expired or malformed token -> Verify `401 Unauthorized` response.

---

## 5. Phase Checklist

- [ ] Implement `src/auth/security.py` with JWT token signing and decoding.
- [ ] Connect FastAPI dependencies to extract authenticated customer identity.
- [ ] Pass verified customer identity to agent tool executions.
- [ ] Add unit tests for cross-customer authorization rejection.
- [ ] Add prompt injection regression tests.
