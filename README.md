# Apron Management — Take-Home Assignment

A small full-stack app for searching flight plans, viewing linked flight-plan groups, and
managing stand assignments at an airport apron.

- **Backend**: NestJS v11 + TypeORM + PostgreSQL — `/backend`
- **Frontend**: Angular v21 (standalone components + signals) + Tailwind CSS v4 — `/frontend`
- **Database**: PostgreSQL via Docker Compose — `docker-compose.yml`

## 1. How to run

### Prerequisites

- Node.js 20+ and npm
- Docker Desktop (for PostgreSQL)

> **Note on this environment**: this project was developed in a sandbox without Docker available,
> so the stack was verified against a natively-installed PostgreSQL 17 instead of
> `docker-compose up` during development. The schema, seed script, and every endpoint below were
> exercised end-to-end this way (seeded ~5.8k flight plans + stands, created/queried stand
> assignments, confirmed the 409 conflict path) — only the Docker Compose path itself is untested,
> since Docker wasn't installed here. It should behave identically; please flag it if it doesn't.

### Start PostgreSQL

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with database `apron_management`, user/password
`apron`/`apron` (see `docker-compose.yml`).

### Backend

```bash
cd backend
npm install
cp .env.example .env   # already points at the docker-compose defaults
npm run start:dev      # starts the API on http://localhost:3000
```

`TypeOrmModule` uses `synchronize: true` (see `src/config/typeorm.config.ts`) so tables are
created automatically from the entities on first boot — no separate migration step needed for
this take-home. Run this once before seeding (or just start the app, then stop it).

### Seed the database

```bash
cd backend
npm run seed
```

This reads `../data/flightplans.json` and `../data/stands.json` and upserts them into Postgres in
chunks (stands first, then flight plans — see `src/seed/seed.ts`). It's safe to re-run.

`stands.json` contains 168 duplicate `stand` codes (out of 513 rows) with differing
apron/terminal values — the seed script dedupes by keeping the last occurrence of each code,
since `stand` is the primary key.

### Frontend

```bash
cd frontend
npm install
npm start               # starts the Angular dev server on http://localhost:4200
```

The frontend talks to the API at `http://localhost:3000` (see
`frontend/src/environments/environment.ts`). Make sure the backend is running first.

### Tests

```bash
cd backend && npm test    # Jest — unit tests, no DB required
cd frontend && npm test   # Vitest (via `ng test`) — component tests
```

## 2. Data model

### `FlightPlan` (`backend/src/flight-plans/flight-plan.entity.ts`)

Every key in `flightplans.json` has a matching column, typed close to the source (`timestamptz`
for datetime fields, `date` for `originDate`, everything else nullable `varchar` unless the
sample data shows it's always present). `id` is used as-is from the JSON as a numeric primary key
(not auto-generated) since the source system already assigns stable integer ids.

`stand` / `apron` / `terminal` on `FlightPlan` are kept as plain denormalized text columns
mirroring the JSON, **not** a foreign key to `Stand`. This is deliberate: that data is a
historical snapshot from the source system (a flight plan might reference a stand that isn't in
the current `stands.json`, or none at all), and the assignment brief explicitly asks for a
separate `StandAssignment` entity to model *actual* stand usage. Modeling `stand` as a FK would
either reject valid historical rows during seeding or force a synthetic "unknown stand" — worse
than just keeping it as text and doing real relational assignment tracking via
`StandAssignment`.

### `Stand` (`backend/src/stands/stand.entity.ts`)

`stand` (the code, e.g. `F70`) is used as the primary key since it's unique in `stands.json` and
is exactly what `flightplans.json` and stand assignments reference it by. `apron`/`terminal` are
nullable, matching the source data (some stands have `null` apron/terminal).

### `StandAssignment` (`backend/src/stand-assignments/stand-assignment.entity.ts`)

The real relational link between a flight plan and a stand: `flightPlanId` (FK → `FlightPlan.id`),
`standId` (FK → `Stand.stand`), `fromTime`/`toTime` (`timestamptz`), optional `remarks`.

**Assumption**: `fromTime`/`toTime` represent the actual occupancy window and are supplied
directly by the client when creating an assignment (the brief allows deciding how they relate to
`sta`/`std`/`aibt`/`aobt` — in a real system you'd likely default them from those fields, but for
this exercise the caller sets them explicitly, which keeps the API simple and testable).

## 3. Business logic

### No overlapping stand assignments

Enforced in `StandAssignmentsService.create()`
(`backend/src/stand-assignments/stand-assignments.service.ts`):

1. Validates the referenced `FlightPlan` and `Stand` exist (404 if not).
2. Inside a DB transaction, loads existing assignments for the target stand with a pessimistic
   write lock (`SELECT ... FOR UPDATE`), so two concurrent requests for the same stand can't both
   pass the check.
3. Checks each existing assignment against the new one using a half-open interval overlap test
   `[fromTime, toTime)` (pure function in `overlap.ts`, unit-tested in `overlap.spec.ts`):
   `existing.fromTime < new.toTime && new.fromTime < existing.toTime`. Back-to-back windows
   (one ends exactly when the next starts) are **not** treated as overlapping.
4. On conflict, throws `ConflictException` (409) with a message like `"Stand F70 already occupied
   between 2026-03-06T10:00:00.000Z and 2026-03-06T12:00:00.000Z"`.

This is application-level locking rather than a DB exclusion constraint (which would need the
`btree_gist` Postgres extension) — a reasonable simplification for this scope; see Section 4.

### Linked flight plans (`GET /flight-plans/:id/linked`)

Rule, implemented in `FlightPlansService.findLinked()`: I initially assumed "same
`linkedFlightId`" would be enough, but inspecting the actual sample data showed the real
relationship is asymmetric — a child plan's (e.g. a `TowOutMovement`'s) `linkedFlightId` points to
the **`ifplid` of its originating Arrival**, while the Arrival plan itself has
`linkedFlightId: null`. A plain "same `linkedFlightId`" match would find sibling tow movements but
miss the arrival they both link back to.

So the actual rule: resolve a "root" id for the group — the plan's own `linkedFlightId` if
present, otherwise its own `ifplid` — then return every flight plan whose `ifplid` equals that
root, or whose `linkedFlightId` equals that root, plus the queried plan itself. This correctly
groups e.g. `Arrival` + `TowOutMovement` + `TowInMovement` that share one physical aircraft
rotation.

## 4. Scope & tradeoffs

- **No pagination UI**: `GET /flight-plans` supports `limit`/`offset` (default `limit=100`) as a
  pragmatic addition beyond the spec, given the dataset is ~5.8k rows — but the frontend doesn't
  expose paging controls, it just relies on search/filtering to narrow results.
- **No auth**: out of scope for this exercise.
- **Validation is intentionally light**: DTOs validate types/required-ness on the "obvious"
  fields (ids, required strings, date strings) rather than exhaustively validating every field
  (e.g. ICAO code formats, enum values for `flightPlanType`).
- **Overlap protection is app-level, not DB-level**: a Postgres exclusion constraint
  (`EXCLUDE USING gist`) would give a hard DB guarantee against races, but requires the
  `btree_gist` extension and a bit more setup. The transactional pessimistic-lock approach used
  here is correct for a single-instance backend and simpler to reason about for this scope.
- **`synchronize: true`** instead of migrations — fine for a from-scratch take-home, would be
  replaced with proper TypeORM migrations in a real project.
- **Docker Compose path specifically untested**: Docker wasn't available in the environment this
  was built in, so the full stack was verified against a native PostgreSQL install instead (see
  the note in Section 1). The `docker-compose.yml` itself — i.e. `docker compose up -d` — hasn't
  been exercised, though it's a standard single-service Postgres container and should just work.

Everything was reviewed for correctness: backend (`npm run build`, `npm test`) and frontend
(`npm run build`, `npm test`) pass, and the full stack was exercised live end-to-end (DB seeded,
every endpoint hit directly including the 409 overlap-conflict path, both apps run together in a
browser) against a native Postgres install, per the note in Section 1.
