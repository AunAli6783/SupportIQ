# Phase 08: Production Analytics, Live PowerPoint Generation & Deployment

> **Phase Status:** Planned  
> **Prerequisites:** Phase 01 through Phase 07 Completed  
> **Target Outcome:** Live store management analytics, automated executive PowerPoint report generation from database transactions, Docker containerization, and production deployment configuration.

---

## 1. Objective

Provide store administrators and executives with live analytics and automated presentation reporting directly from relational database transactions, packaged in an enterprise-grade Docker environment ready for cloud deployment.

---

## 2. Executive Analytics & Live PowerPoint Generation

SupportIQ features a native presentation builder (`python-pptx`) that transforms live database transactions into executive slides with native Office XML charts:

```
                            ADMIN INSTRUCTION
                 "Generate an executive sales report for Q3"
                                   │
                                   ▼
                           AI AGENT EXECUTOR
                                   │
                                   ▼
                       `generate_presentation` Tool
                                   │
                                   ▼
                    SQL Transaction Query (PostgreSQL)
                    • Total Revenue: 4,820,000 PKR
                    • Orders Processed: 48 Orders
                    • Top Product: NovaBook Pro 14 (18 units)
                                   │
                                   ▼
                      Native `python-pptx` Engine
                      • Slide 1: Executive Dark Navy Theme
                      • Slide 2: Category Revenue Breakdown (Bar Chart)
                      • Slide 3: Order Status Distribution (Pie Chart)
                      • Slide 4: Strategic Recommendations
                                   │
                                   ▼
             Generated File: `storage/presentations/NovaCart_Sales_Q3.pptx`
             In-Chat Download Card: [📥 Download PowerPoint (.pptx)]
```

---

## 3. Production Containerization (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: novacart_db
      POSTGRES_USER: novacart_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://novacart_admin:${DB_PASSWORD}@db:5432/novacart_db
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - SERPER_API_KEY=${SERPER_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
    depends_on:
      - db
    volumes:
      - ./storage:/app/storage

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 4. Verification & Testing Plan

1. **Docker Compose Build Test:** Run `docker-compose up --build` -> Verify DB, FastAPI backend, and Next.js frontend initialize cleanly.
2. **End-to-End Shopping Journey:** Open `http://localhost:3000`, place an order, open the floating AI widget, cancel the order -> Verify database updates instantly.
3. **Automated Test Suite:** Execute `pytest tests/` -> Verify 100% pass rate across all database, security, and tool unit tests.

---

## 5. Phase Checklist

- [ ] Connect `generate_presentation` tool to live database transaction queries.
- [ ] Implement multi-stage `Dockerfile.backend` and `Dockerfile.frontend`.
- [ ] Create `docker-compose.yml` for unified stack deployment.
- [ ] Implement `/health` endpoint checking DB, ChromaDB, and LLM readiness.
- [ ] Run full end-to-end integration and smoke test suite.
