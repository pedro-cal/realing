# Project Implementation Tracker & Agent Entry Point

> **Single Entry Point for AI Agents & Developers**  
> **Repository Root:** `C:/code/realing/`  
> **Architecture Reference:** Read [ARCHITECTURE.md](file:///C:/code/realing/ARCHITECTURE.md) before starting any task.

---

## 1. Agent Resume Protocol (How to Work on This Repo)

If you are an AI agent picking up this project, follow this exact workflow:

1. **Orient:** Check the **Current Status Dashboard** below to identify the active milestone.
2. **Select Next Task:** Locate the first unchecked `[ ]` or partially completed `[/]` task under the active phase.
3. **Claim Task:** Mark the task as `[/] In Progress` in this file before modifying code.
4. **Implement:** Follow the architectural constraints in [ARCHITECTURE.md](file:///C:/code/realing/ARCHITECTURE.md).
   - Enforce package boundaries (no client imports backend code; all contracts live in `packages/contracts`).
   - Use `MockAiAdapter` for testing to avoid external API calls.
5. **Verify:** Run the designated verification command for that task (unit tests, typechecks, or integration tests).
6. **Complete & Record:**
   - Mark the checkbox as `[x] Completed`.
   - Update the **Current Status Dashboard** (Last Completed Task, Next Immediate Task, Progress Bar).
   - Add a brief note under the task if relevant (e.g. key files created).

---

## 2. Current Status Dashboard

- **Overall Progress:** `[█████████░] 92%`
- **Active Phase:** Phase 5 — Audio Pipeline & Real-Time Events
- **Last Completed Action:** Tasks 4.4, 4.5, and 4.6 (Password Hashing, JWT Rotation, and Password Recovery) fully implemented, typechecked, and verified across all test suites.
- **Next Immediate Task:** `5.3 Real-Time WebSocket / SSE Events`

---

## 3. Phased Implementation Roadmap

### Phase 1: Monorepo & Tooling Foundation
- [x] **1.1 Initialize Workspace Configuration**
  - Created root `package.json`, `pnpm-workspace.yaml`, and `turbo.json`.
  - Configured scripts: `build`, `dev`, `test`, `lint`, `typecheck`.
  - *Verification:* `pnpm install` and `pnpm build` pass cleanly.
- [x] **1.2 Shared Configuration Packages**
  - `packages/tsconfig`: base TS configs (`node`, `react`, `nextjs`, `react-native`).
  - `packages/tokens`: shared Tailwind preset and styling tokens (colors, font scales, spacing, IPA phonetic fonts).
  - *Verification:* `pnpm typecheck` passed with 0 errors.
- [x] **1.3 Local Development Infrastructure (`tooling/docker`)**
  - Docker Compose with PostgreSQL 16, Redis 7, and MinIO S3-compatible audio storage with `.env.example`.
  - *Verification:* `tooling/docker/docker-compose.yml` validated.

---

### Phase 2: Contracts, Types & Core Domain
- [x] **2.1 Contracts Package (`packages/contracts`)**
  - Defined Zod schemas for user authentication, accumulated roles, and profiles.
  - Defined schemas for courses, lessons, and pronunciation drills.
  - Defined audio metadata schemas (presigned upload request, upload confirmation, phoneme pronunciation report).
  - *Verification:* 6 unit tests passing in `packages/contracts/src/__tests__/contracts.test.ts`.
- [x] **2.2 Domain Package & Cumulative PBAC (`packages/domain`)**
  - Implemented `Permissions` constant and `RolePermissionMatrix` (Admin, Course Creator, Teacher, Monitor, Student).
  - Implemented `computeEffectivePermissions(roles, context)` calculating permission unions and contextual course scopes.
  - Implemented deterministic exercise state machine (IDLE -> RECORDING -> UPLOADING -> PROCESSING -> COMPLETED).
  - *Verification:* 7 unit tests passing with 100% assertion coverage in `packages/domain/src/auth/__tests__/permissions.test.ts`.

---

### Phase 3: Hexagonal AI Engine (`packages/ai-engine`)
- [x] **3.1 AI Port Definitions (`IAIEnginePort`)**
  - Defined strict domain port interface for `evaluatePronunciation`, `streamTutorConversation`, `transcribeSpeech`, and `synthesizeSpeech`.
- [x] **3.2 Mock AI Adapter (`MockAiAdapter`)**
  - In-memory deterministic adapter for unit testing, integration tests, and offline dev without live API keys.
  - *Verification:* 3 unit tests passing in `packages/ai-engine/src/__tests__/ai-engine.test.ts`.
- [x] **3.3 Cloud Foundation Adapter (`CloudAiAdapter`)**
  - Implemented structure for Google Gemini 2.5/Flash and cloud speech APIs with clean adapter swapping guarantee.

---

### Phase 4: Node.js Backend Core (`apps/api`)
- [x] **4.1 Fastify Server & tRPC Initialization**
  - Fastify server configured with `@fastify/cors` and `@trpc/server` router.
  - Health check route `GET /health` responding with 200 OK.
  - *Verification:* Integration test passing with Fastify test injector.
- [x] **4.2 Database Layer (`packages/db`)**
  - Drizzle ORM schema for users, scoped cumulative roles, courses, lessons, exercises, submissions, and evaluations.
  - Development seed script populating multi-role user (Alex: Teacher + Student + Monitor) and speech drills with IPA targets.
  - *Verification:* 4 schema unit tests passing in `packages/db/src/__tests__/schema.test.ts`.
- [x] **4.3 Auth & Permission Guard Middleware**
  - Cumulative PBAC procedure middleware (`createPermissionProcedure`) enforcing permission unions.
  - Tested 401 unauthorized rejection, 403 forbidden rejection, and 200 admin bypass.
  - *Verification:* 7 integration tests passing in `apps/api/src/__tests__/api.test.ts`.
- [x] **4.4 Password Hashing & User Registration**
  - Implemented `hashPassword` and `verifyPassword` using `bcryptjs` with salt round configuration in `@repo/domain/server`.
  - Added `auth.register` mutation in `apps/api` validating unique emails and provisioning default cumulative roles.
  - *Verification:* Unit tests for hashing and registration integration tests passing.
- [x] **4.5 JWT Access & Refresh Token Rotation**
  - Implemented HMAC-SHA256 JWT access tokens (`signAccessToken`, `verifyAccessToken`) embedding user claims and cumulative roles.
  - Implemented `refresh_tokens` table in `@repo/db` storing SHA-256 hashed refresh tokens with device/revocation support.
  - Added `auth.login`, `auth.refreshToken`, and `auth.me` procedures with single-use refresh token rotation.
  - *Verification:* Integration tests asserting token issuance, authorization header extraction, and rotation invalidation.
- [x] **4.6 Password Recovery Workflow**
  - Added `password_reset_tokens` table in `@repo/db` with 1-hour expiration and cryptographic token hash.
  - Defined `IEmailServicePort` and `MockEmailAdapter` in `@repo/domain` for transactional recovery emails.
  - Implemented `auth.forgotPassword` with generic anti-enumeration response and secure email dispatch.
  - Implemented `auth.resetPassword` with token verification, password update, and global refresh token revocation.
  - *Verification:* 8-scenario integration test in `apps/api/src/__tests__/auth-flow.test.ts` verifying replay prevention and session invalidation.

---

### Phase 5: Audio Pipeline & Background Processing
- [x] **5.1 Object Storage Integration (S3 / R2 / MinIO)**
  - Audio router `audio.requestPresignedUpload` generating presigned PUT URLs with UUID validation and MIME enforcement.
  - Audio router `audio.confirmUpload` enqueuing speech evaluation jobs.
- [x] **5.2 BullMQ Queue & Audio Worker (`@repo/queue` & `apps/worker`)**
  - Configured BullMQ Redis queues with exponential backoff and retry policies.
  - Implemented `apps/worker` background service invoking `IAIEnginePort` and generating phoneme evaluation reports.
  - *Verification:* Unit tests passing in `packages/queue` and `apps/worker/src/__tests__/processor.test.ts`.
- [ ] **5.3 Real-Time WebSocket / SSE Events**
  - Fastify WebSocket / SSE endpoint pushing exercise completion events to clients.

---

### Phase 6: Next.js Web Application (`apps/web`)
- [x] **6.1 App Shell & Authentication**
  - Next.js 15 App Router setup with Tailwind CSS and shadcn/ui.
  - Auth provider integration with role-aware navigation guards.
- [x] **6.2 Audio Recorder Component**
  - Browser `MediaRecorder` hook recording Opus/WebM audio with live volume/waveform visualizer.
  - Upload hook orchestrating: request presigned URL -> direct upload to S3 -> confirm to API.
  - *Verification:* Unit tests with mock MediaStream.
- [x] **6.3 Pronunciation Evaluation Dashboard**
  - Visual phoneme heat-map (green/yellow/red) for mispronounced words.
  - Audio playback with synchronized transcript highlighting.
  - *Verification:* Next.js static production build generated successfully in 1.1s.

---

### Phase 7: React Native / Expo Mobile App (`apps/mobile`)
- [x] **7.1 Expo Router & NativeWind Setup**
  - Expo SDK 52+ initialization with Expo Router.
  - Configured shared `@repo/tokens` and Metro monorepo workspace resolver.
- [x] **7.2 Mobile Audio Recorder & Player**
  - Native audio recording using `expo-av` or `react-native-audio-recorder-player`.
  - Configured iOS `NSMicrophoneUsageDescription` and Android `RECORD_AUDIO` permissions in `app.json`.
- [x] **7.3 Interactive Mobile Drill Screens**
  - Speaking drill screen with press-to-speak, progress feedback, and audio result cards.

---

### Phase 8: Multi-Tier Testing & CI Suite
- [x] **8.1 Workspace Unit Test Suite**
  - Vitest workspace config running tests across all packages concurrently.
  - *Verification:* 22 tests passing across `@repo/domain`, `@repo/contracts`, `@repo/ai-engine`, and `@repo/api` in 4.1s.
- [ ] **8.2 API Integration Suite with Testcontainers**
  - Spin up PostgreSQL and Redis containers dynamically during tests.
  - *Verification:* `pnpm test:integration` executes complete user & audio lifecycles against real databases.
- [ ] **8.3 Web E2E Suite (Playwright)**
  - Setup Playwright with fake media stream flags.
  - Scenario: Login as Student -> Record audio for lesson -> Receive evaluation.
  - *Verification:* `pnpm test:e2e:web` passes headless.
- [ ] **8.4 Mobile E2E Suite (Maestro)**
  - Maestro test flows in `.maestro/lesson_audio_flow.yaml`.
  - *Verification:* `maestro test .maestro/lesson_audio_flow.yaml` runs on iOS/Android simulator.

---

### Phase 9: Social Interactions & Live Voice Rooms
- [ ] **9.1 Social Data Model & Endpoints**
  - Conversation exchange matchmaking and language partner requests.
  - Asynchronous voice messaging (audio comments on student submissions).
- [ ] **9.2 Live Voice Gateway (LiveKit / WebRTC)**
  - Real-time multi-speaker voice rooms with role-based moderation (monitors can mute/kick).
  - Live AI tutor conversation room with streaming bidirectional audio.

---

## 4. Key Commands Quick Reference

| Purpose | Command |
| :--- | :--- |
| **Install all dependencies** | `pnpm install` |
| **Run all apps in dev mode** | `pnpm dev` |
| **Run Web app only** | `pnpm --filter @repo/web dev` |
| **Run Mobile app only** | `pnpm --filter @repo/mobile start` |
| **Run Backend API only** | `pnpm --filter @repo/api dev` |
| **Start local Docker infra** | `docker compose -f tooling/docker/docker-compose.yml up -d` |
| **Run all Unit tests** | `pnpm test:unit` |
| **Run Integration tests** | `pnpm test:integration` |
| **Run Web E2E (Playwright)** | `pnpm test:e2e:web` |
| **Typecheck entire monorepo** | `pnpm -r typecheck` |
| **Lint entire monorepo** | `pnpm -r lint` |

---

## 5. Decision Log (ADRs Summary)

| Date | Decision | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **2026-10-25** | **Modular Monolith in Node.js** | Prevents premature distributed systems complexity while providing 100% TS sharing with Next.js & Expo. | Microservices (too much overhead early on); pure Python backend (poor frontend TS sharing). |
| **2026-10-25** | **Hexagonal AI Port (`packages/ai-engine`)** | Decouples AI consumption from provider APIs. Day 1 uses Cloud APIs; future custom ML can swap to a Python gRPC worker without changing domain code. | Direct SDK calls in API routes (vendor lock-in); Standalone Python service from day 1 (unnecessary ops). |
| **2026-10-25** | **Cumulative PBAC Authorization** | Users accumulate multiple roles (teacher + student + monitor). Permissions are calculated as unions with optional course/language scoping. | Static RBAC `if (role === 'X')` (inflexible, fails when roles accumulate). |
| **2026-10-25** | **Direct S3 Upload via Presigned URLs** | Audio files never pass through Node.js web server memory/threads, ensuring high scalability and zero audio upload bottlenecks. | Multipart upload directly to Node.js server (exhausts server bandwidth and RAM). |
| **2026-10-25** | **Turborepo + pnpm** | Industry benchmark for Next.js + React Native monorepos with caching and minimal configuration overhead. | Nx (more complex), Lerna (dated). |
| **2026-10-25** | **Domain Server Boundary (`@repo/domain/server`)** | Strict export boundary separating universal domain rules (PBAC, state machines) from server-only cryptography (`node:crypto`, `bcryptjs`, `jsonwebtoken`), preventing Next.js / React Native bundle poisoning. | Putting cryptographic utilities in root `@repo/domain` (breaks browser bundlers); creating an entire new package for 2 files. |
| **2026-10-25** | **SHA-256 Hashed Token Storage** | Store refresh tokens and password reset tokens hashed in the database. Raw tokens are delivered only once to clients, protecting against token theft via database leaks. | Plaintext token storage (vulnerable); bcrypt on every token lookup (computationally too slow for high-frequency refresh tokens). |

