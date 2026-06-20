# cfar-engine — Cancel for Any Reason Microservice

[![CI](https://github.com/NITIN9181/cfar-engine-Cancel-for-Any-Reason-Microservice/actions/workflows/ci.yml/badge.svg)](https://github.com/NITIN9181/cfar-engine-Cancel-for-Any-Reason-Microservice/actions/workflows/ci.yml)

**Production-Grade CFAR Fintech Microservice**

`cfar-engine` is a production-grade **Cancel for Any Reason (CFAR)** fintech microservice and airline checkout simulation that acts as the direct financial counterparty for CFAR contracts, **not an insurer**.

---

## What This Is

A traveler pays a non-refundable fee at checkout. In return, they receive the right to cancel their flight for any reason and receive a partial or full refund — paid by the counterparty, not the airline. This engine prices, issues, and manages the full lifecycle of those contracts.

---

## Three Pages

| Page | Route | What It Simulates |
|---|---|---|
| **Checkout Simulation** | `/` | Airline checkout — select CFAR tier, view live pricing, create contract |
| **My Booking** | `/my-booking` | Look up contract, view timeline, execute cancellation, watch refund states |
| **Partner Config** | `/partner-config` | Admin panel — configure coverage %, fee floors, cancellation window, brand theme |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Astro.js 6 · React 18 · TypeScript 5 |
| Backend | Scala 3.4 · ZIO 2 · Tapir · Doobie · Flyway |
| Database | PostgreSQL 16 |
| Infrastructure | Docker · Docker Compose |
| CI | GitHub Actions |

---

## Run Locally (2 commands)

**Prerequisites:** Docker Desktop running.

```bash
# 1. Clone the repo
git clone https://github.com/NITIN9181/cfar-engine-Cancel-for-Any-Reason-Microservice.git
cd cfar-engine-Cancel-for-Any-Reason-Microservice

# 2. Start the full stack
docker-compose -f infra/docker-compose.yml up --build
```

| Service | URL |
|---|---|
| Frontend (Astro) | http://localhost:4321 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/docs |

Flyway automatically applies all 6 migrations and seeds partner configs + APAC route cancellation rates on first boot.

---

## Run Tests

**Frontend (Vitest — 98 tests):**
```bash
cd frontend
npm install
npm run test
```

**Backend (ZIO Test — 6 unit tests):**
```bash
# Requires Docker
docker run --rm -v "${PWD}/backend:/app" -w /app \
  sbtscala/scala-sbt:eclipse-temurin-jammy-21.0.2_13_1.10.0_3.4.2 \
  sbt test
```

---

## Architecture

```
React Islands (Astro)
    │  HTTP/REST (fetch → cfarClient.ts)
    ▼
Tapir Routes (Scala 3 / ZIO 2)
    │
    ├── ContractService ──► PricingEngine (pure, CSV-seeded)
    │                  ──► EligibilityValidator (state machine)
    │                  ──► AuditRepo (append-only log)
    │
    └── RefundService (async, fork-daemon)
    │
Doobie → PostgreSQL 16
```

---

## Pricing Engine

Deterministic, stateless, no external calls:

```
base_rate       = route historical cancel rate (CSV seed, fallback 9.5%)
dtd_multiplier  = 2.2× (≤7d) | 1.8× (≤14d) | 1.4× (≤30d) | 1.1× (≤60d) | 0.9× (>60d)
pax_multiplier  = 1.00× (1 pax) | 1.08× (2 pax) | 1.15× (3+ pax)

risk_score      = clamp(base_rate × dtd × pax, 0.05, 0.95)

partial_fee_pct = clamp(risk_score × 0.85, partner.min, partner.max)
full_fee_pct    = clamp(risk_score × 1.00, partner.min, partner.max)

fee = round(fare_amount × fee_pct, 2, HALF_UP)
```

---

## Contract State Machine

```
(created) ──► ACTIVE ──► CANCELLED ──► REFUND_INITIATED ──► REFUNDED
                    └──► EXPIRED
                    └──► VOIDED  (admin, cooling-off only)
```

All transitions are strictly validated. Reverting to `ACTIVE` is forbidden. Every transition writes an immutable audit log entry.

---

## Simulated Partners

| Partner | Theme | partner_id |
|---|---|---|
| **AeroDemo Airlines** | Navy + Amber | `aerodemo_airlines` |
| **SkyLink Asia** | Red + Yellow | `skylink_asia` |
| **Pacific Flyer** | Emerald + Orange | `pacific_flyer` |

Switch partners in real time on the Partner Config page — the entire UI re-skins instantly.

---

## API Reference

Full OpenAPI 3.1 spec served live at **http://localhost:8080/docs** (Swagger UI).

Key endpoints:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/pricing` | Calculate CFAR fee (stateless) |
| `POST` | `/api/v1/contracts` | Issue CFAR contract (idempotent) |
| `GET` | `/api/v1/contracts/:id` | Get contract by UUID |
| `POST` | `/api/v1/contracts/:id/cancel` | Cancel contract (state machine validated) |
| `GET` | `/api/v1/contracts/:id/audit` | Get immutable audit log |
| `GET` | `/api/v1/admin/partner-config` | Get partner config |
| `PUT` | `/api/v1/admin/partner-config` | Update partner config |


