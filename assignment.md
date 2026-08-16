# Take‑Home Assignment – Apron Management (Full‑Stack)

## Overview

We build software for **apron management** at airports – managing where aircraft arruive, park, depart, and perform ground movements.

Your task is to build a small **full‑stack application** that:

- Uses **NestJS v11** with **TypeORM** and **PostgreSQL** for the backend,
- Uses **Angular v21** with **standalone components** and **signals** for the frontend,
- Uses **PostgreSQL** to store data,
- Lets a user:
  - View and search **flight plans**,
  - See combined / linked views of related plans,
  - Manage **stand assignments**,
- Demonstrates how you:
  - Understand requirements and make reasonable assumptions,
  - Design data models and APIs around our domain,
  - Structure and implement frontend + backend code,
  - Seed data from JSON into a relational database,
  - Use tests and error handling,
  - Use AI (if you choose) in a controlled, explainable way.

We estimate this to be doable within **~2 hours with AI assistance**. It’s okay if everything is not perfect or a requirement is not completed; focus on **clarity and correctness** where you choose to spend time.

## Project Structure & Tooling

- Use a **single repository** with at least:
  - `/backend` – NestJS app,
  - `/frontend` – Angular app,
  - Docker configuration for **PostgreSQL**.
- Add scripts/commands to:
  - Start Postgres
  - Run backend and frontend,
  - Run the **seed** step that imports `flightplans.json` and `stands.json` into the DB.

---

## Provided Data

You will be given two JSON files:

1. `flightplans.json` – an array of flight plan objects, each similar to:

   ```jsonc
   {
     "id": 97238,
     "ifplid": "299428080897_1-TOU",
     "flightId": "8afc5c99-0011-5093-bbdb-05adc94f1b74",
     "flightPlanType": "TowOutMovement",
     "flightPlanAction": "Active",
     "created": "2026-03-05T15:23:37.898Z",
     "updated": "2026-03-06T07:09:02.484Z",
     "linkedFlightId": "299428080897",
     "linkedFlightPlanType": "Arrival",
     "originDate": "2026-03-06",
     "carrier": "AF",
     "flightNumber": "063",
     "calculatedCallsign": "AF 063",
     "aircraftRegistration": "FHUVQ",
     "aircraftType": "A350/9",
     "aircraftTypeIcao": "A359",
     "adep": "KEWR",
     "ades": "LFPG",
     "stand": "K21",
     "apron": "Aire_T2E_S3",
     "terminal": "Terminal_2",
     "aibt": null,
     "sta": null,
     "aobt": "2026-03-06T06:45:00.000Z",
     "std": "2026-03-06T06:40:00.000Z",
   }
   ```

2. `stands.json` – an array of stand objects, each similar to:

   ```jsonc
   {
     "stand": "F70",
     "apron": "Aire_T2F",
     "terminal": "Terminal_2",
   }
   ```

You must:

- **Seed the PostgreSQL database** using these JSON files.
- Define database columns (via your TypeORM entities) for **each key present in the JSON**:
  - For every property in the sample `flightplans.json` objects, there should be a corresponding column in your `FlightPlan` entity.
  - For every property in `stands.json`, there should be a corresponding column in your `Stand` entity.

---

## Domain: Flight Plans, Stands, and Stand Assignments

We work with three main concepts.

### 1. FlightPlans

Use the shape from `flightplans.json` as your base. Your `FlightPlan` entity should include **all keys** from the JSON objects as columns.

You may add additional convenience fields if you want (e.g. derived status), but the JSON keys should be fully represented.

### 2. Stands

All keys in `stands.json` objects must be present as columns.

You may also choose to add a derived `name` column if you want, as long as the original keys are represented.

### 3. StandAssignments

To model actual usage of a stand by a flight plan, create a separate `StandAssignment` entity that reflects the stand and flightplan assignements e.g., flightId 123
is assigned to stand ABC

**Constraint to enforce:**

> A stand cannot be assigned to two flight plans whose stand usage times overlap.

A simple time interval overlap check is enough (no advanced scheduling needed).  
You may decide how `fromTime`/`toTime` relate to fields like `sta` / `std` / `aibt` / `aobt`, and document that assumption.

---

## Backend Requirements (NestJS v11)

Use:

- **NestJS v11**,
- **TypeORM**,
- **PostgreSQL** (via Docker is preferred).

### 1. Data Model & Seeding

- Implement TypeORM entities for each table in the database.
- Implement a **seeding mechanism** that seeds the flightplans and stands data.
  - This can be a script, a bootstrap function, or a migration – whatever is simplest for you. Please document in the README how to run it.

### 2. REST Endpoints

Implement at least:

#### 2.1. List and Search Flight Plans

`GET /flight-plans`

- Query parameters:
  - `search?: string`  
     Free‑text search over useful fields, e.g. `calculatedCallsign`, `carrier`, `flightNumber`, `adep`, `ades`.
  - `flightPlanType?: string`  
     Filter by `flightPlanType` (e.g. `Arrival`, `Departure`, `TowOutMovement`).
  - `originDateFrom?: string` / `originDateTo?: string`  
     Filter by `originDate` (ISO date strings).
- Response: list of flight plans matching the criteria.

#### 2.2. Create and Update Flight Plans

`POST /flight-plans`

- Creates a new flight plan record.
- Use DTOs with validation for key fields (you don’t have to validate every single field exhaustively, but try to be reasonable).

`PATCH /flight-plans/:id`

- Partially updates an existing flight plan.

You can simplify validation; focus on obvious constraints (required fields, basic formats).

#### 2.3. Stands and Stand Assignments

`GET /stands`

- Returns all stands, including the columns from `stands.json`.

`POST /stand-assignments`

- Body:
  - `flightPlanId: number | string`,
  - `standId: string`,
  - `fromTime: string` (ISO),
  - `toTime: string` (ISO),
  - `remarks?: string`.
- Validation:
  - `flightPlanId` points to an existing `FlightPlan`,
  - `standId` points to an existing `Stand`,
  - There is **no overlapping assignment** for the chosen stand in the interval `[fromTime, toTime)`.
- On conflict, return a 4xx status (e.g. `409 Conflict`) with a clear message (e.g. “Stand F70 already occupied between X and Y”).

`GET /stand-assignments`

- Optional query parameters:
  - `standId?: string`,
  - `from?: string` / `to?: string`.
- Returns assignments matching the filters, preferably including basic embedded flight plan and stand info.

#### 2.4. Linked Flight Plans Endpoint

`GET /flight-plans/:id/linked`

- Given a `FlightPlan.id`, return other `FlightPlan` entries logically linked to it, e.g. by `linkedFlightId`.
- For example, if an arrival and a tow movement share a `linkedFlightId`, return them together.

You can define the exact rule (e.g. “all plans with the same `linkedFlightId` and/or `linkedFlightPlanType`”), but **document your rule in the README**.

### 5. Backend Testing

Add at least one **backend test**, for example:

- Unit test for the stand assignment service that verifies the overlap/conflict logic.

We’re interested in how you structure tests, not total coverage.

---

## Frontend Requirements (Angular v21)

Use:

- **Angular v21**,
- **Standalone components**,
- **Signals** for state management.

**We are not expecting a pixel perfect UI design, we are mainly focusing on state management, performance, etc...**

### 1. Main Functional Areas

Provide at least:

1. **Flight Plan Search & List**
2. **Flight Plan Detail / Linked View**
3. **Stand Assignment View**

Routing is a plus but not mandatory.

### 2. Flight Plan Search & List

Implement a view that:

- Offers:
  - A free‑text **search input** (mapped to `GET /flight-plans?search=`),
  - Optional filter for `flightPlanType`.
- Displays a **list of flight plans** with key info, for example:
  - `calculatedCallsign` (or `carrier + flightNumber`),
  - `flightPlanType`,
  - `adep` → `ades`,
  - `originDate`,
  - A relevant time (e.g. `sta` or `std`, depending on type).
- Uses a **reusable “flight plan card” component**.
- On click of a flight plan:
  - Shows a **detail / linked view** (new route or inline).

Use **signals** to manage search term, filters, current list, and selected flight plan.

### 3. Flight Plan Detail / Linked View

For a selected flight plan:

- Show the detailed fields (mapping from your `FlightPlan` entity).
- Call `GET /flight-plans/:id/linked` and show the “group”:
  - E.g. list each linked plan with:
    - `flightPlanType`,
    - `adep` → `ades`,
    - key time fields (`sta`, `std`, `aibt`, `aobt`),
    - maybe `stand` / `apron` / `terminal`.

If `StandAssignments` exist for any of these plans:

- Show assigned stand(s),
- `fromTime` / `toTime`,
- `remarks`.

### 4. Stand Assignment View

Implement a view for stands and stand assignments:

- Display a list of **stands** (`GET /stands`).
- Allow selecting a stand and/or a time window and show assignments from `GET /stand-assignments`.
- Allow creating a new assignment:
  - Select a flight plan (e.g. dropdown or simple search),
  - Select a stand,
  - Set `fromTime` and `toTime`,
  - Submit to `POST /stand-assignments`,
  - Display server validation/conflict errors.

Use signals for key data (stands, assignments, selected stand, etc.).

### 5. Frontend Testing

Add at least one **frontend test**, e.g.:

- A test for a simple component (like the flight plan card), or
- A service test using `HttpClientTestingModule`.

---

## README & Documentation

Please include a **README.md** that explains:

1. **How to run**:
   - Prerequisites (Node, Docker, etc.),
   - How to start the database (and auth if applicable),
   - Commands to:
     - Run the backend,
     - Run the frontend,
     - Seed the database from the provided JSON files.
2. **Data model**:
   - How you modeled `FlightPlan` and `Stand` from the JSON (including any renaming),
   - How `StandAssignment` relates to them,
   - Any non‑obvious type decisions (e.g. `id` as number vs string).
3. **Business logic**:
   - How you enforce “no overlapping stand assignments”,
   - How you define “linked” flight plans in `GET /flight-plans/:id/linked`,
4. **Scope & tradeoffs**:
   - Features you simplified or skipped,
   - What you would improve with more time.
5. **AI usage (if applicable)**:
   - Where you used AI (e.g. scaffolding, boilerplate, tests),
   - How you reviewed and adapted the generated code.

---

## What We’ll Do in the Review

In the follow‑up session, we’ll ask you to:

- Start the stack (DB, backend, frontend) and demonstrate:
  - Loading data from the DB (seeded from the JSON files),
  - Searching and listing flight plans,
  - Viewing detailed and linked views for a flight plan,
  - Viewing stands and assignments,
  - Creating a stand assignment and seeing it appear (including real‑time update).
- Walk us through key parts of your implementation:
  - Entity definitions and how they map to the JSON keys,
  - Seeding logic from the JSON files,
  - Conflict detection for stand assignments,
  - Angular components using signals,
- Explain:
  - Design choices and tradeoffs,
  - How you approached testing,
  - How you used AI (if you did), and how you validated its output.

If any requirement is unclear, it’s fine to make reasonable assumptions—just mention them briefly in the README.

## Submission

Please create a private GitHub repo and ensure that the following user has access to the code: jarred-utt_adbsg. When this is done, please send a link to the repo via email to jarred.utt@adbsafegate.com.
