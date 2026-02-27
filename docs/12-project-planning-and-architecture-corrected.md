# Project Planning & Architecture

## Project Name: **Pathfinding Visualizer** (`pathfinding_algorithms`)

---

## 1. Core Requirements

**What problem does this project solve?**
This project makes abstract pathfinding algorithms tangible and understandable. It solves the educational gap where students and learners struggle to grasp *how* algorithms like Dijkstra, A*, BFS, and DFS actually explore a graph and make decisions. By animating every node visit, cost evaluation, and path reconstruction step on an interactive grid, it turns a textbook concept into a visual, hands-on experience.

**Main Features & Functionalities:**

| Feature | Description |
|---|---|
| **8 Pathfinding Algorithms** | Dijkstra, A*, Greedy Best-first, Swarm, Convergent Swarm, Bidirectional Swarm, BFS, DFS |
| **Animated Visualization** | Frame-by-frame exploration with pause/resume/step-forward controls and 3 speed levels (fast/average/slow). Playback controls are shown in animated modes (Average/Slow); Fast runs without visible playback controls. |
| **Interactive Grid** | Click to place walls, hold `W` to place weighted nodes (adjustable slider 0–50), drag start/target endpoints with live recalculation |
| **7 Maze Generators** | Recursive division, vertical/horizontal skew variants, random walls, random weights, staircase, blank grid |
| **Step-by-Step Insight Panel** | Real-time Feynman-style explanations of each algorithm decision: node selection reason, cost breakdowns (g/h/f), neighbor evaluation, frontier size, visited count |
| **AI-Powered Summaries** | Server-side OpenAI integration generating 5-sentence beginner-friendly run summaries (with deterministic fallback when no API key) |
| **Weight Impact Analysis** | Post-run analysis showing how weighted nodes affected the path, detour costs, efficiency rating, and counterfactual comparisons |
| **Run History** | LocalStorage-persisted history (up to 5 runs) with load/replay/delete capability and full board state restoration |
| **Algorithm Comparison** | Modal with side-by-side table of all 8 algorithms covering optimality, completeness, complexity, heuristics, and per-algorithm detail modals with pseudocode |
| **Onboarding Tutorial** | 7-slide animated walkthrough with keyboard navigation and accessibility (ARIA, focus trap) |
| **Configurable Cost Model** | Search logic uses turn-penalty-aware movement costs: straight = 1, 90° turn = 2, 180° turn = 3 (plus node weights). Note: current results-bar `Path Cost` display sums base + node weights, not turn penalties. |

**Target Audience:**
Computer science students, self-learners, and educators seeking an interactive tool to teach or learn graph traversal and pathfinding algorithms. The Feynman-style explanations, onboarding tutorial, and jargon avoidance indicate a beginner-to-intermediate audience.

---

## 2. User Flow

```text
1. OPEN APP → 7-slide onboarding tutorial introduces concepts
                 ↓ (Skip or complete)
2. MAZE SELECTION → Onboarding card-grid modal: pick a maze pattern or start blank
                 ↓
3. CONFIGURE GRID → Interact with the grid:
     • Click cells to toggle walls
     • Hold W + click to place/remove weighted nodes
     • Drag the weight slider (0–50) to set weight value
     • Drag start (green) / target (red) endpoints to reposition
                 ↓
4. SELECT ALGORITHM → Choose from the playback-pod dropdown at the bottom
     • Navbar algorithm names open info modals (informational) rather than changing active algorithm
     • Sidebar "Controls" tab shows algorithm description
     • "More Info" opens a detail modal with pseudocode
     • "Compare All" opens side-by-side table
                 ↓
5. SET SPEED → Choose Fast / Average / Slow from the speed dropdown
                 ↓
6. VISUALIZE → Click "Visualize!" button
     • Exploration phase: cells light up as the algorithm visits them
     • Insight panel (sidebar "Insight" tab) updates live:
         – Current step number, node coordinates, g/h/f costs
         – "What's Happening?" natural-language explanation
         – Frontier size and visited count metrics
     • Playback controls (Pause / Resume / Step Forward) appear in Average/Slow modes
                 ↓
7. PATH DRAWN → Shortest path animates with directional arrows
     • Results bar shows: Path Cost, Length, Visited count
     • "Why This Path?" weight impact analysis renders
     • AI Summary auto-requests from server (or fallback)
     • Run auto-saved to History (sidebar "Controls" tab)
                 ↓
8. POST-RUN INTERACTION →
     • Drag endpoints → instant recalculation (no re-animation)
     • Clear Path / Clear Walls / Clear Board buttons
     • Select a different algorithm and re-run
     • Browse History → Load a past run to restore full board state
     • Replay a past run to re-animate it
     • Generate a new maze from the sidebar dropdown
```

---

## 3. Protocol Choice

| Layer | Protocol/Model | Details |
|---|---|---|
| **Client ↔ Server** | **HTTP/HTTPS** | Express serves static files and a single REST-style API endpoint |
| **API Endpoint** | `POST /api/explain` | Accepts a JSON run digest, returns an AI-generated explanation. Rate-limited to 30 requests per 15-minute window per IP |
| **External API** | **HTTPS** (OpenAI) | Server proxies to `https://api.openai.com/v1/chat/completions` using `gpt-4o-mini`. Gracefully falls back to deterministic template on failure or missing key |
| **Interaction Model** | **Client-side interactive SPA** | All pathfinding computation, animation, grid manipulation, and state management happen in the browser. The server is a thin static-file host + AI proxy. Near-instant feedback for all grid interactions; animated feedback for algorithm runs |
| **Data Sync** | **No WebSockets / No polling** | The AI explanation is a one-shot `fetch` POST. All other data flows are purely client-side (DOM manipulation + LocalStorage). There is no real-time multi-user or server-push functionality |

---

## 4. Architecture

| Aspect | Detail |
|---|---|
| **Server Framework** | **Express.js** (Node.js) — minimal server for static file serving and a single API route |
| **Client Framework** | **Vanilla JavaScript** (no React/Vue/Angular) — prototype-based OOP (`Board` constructor) with jQuery for Bootstrap modals and dropdowns |
| **Module System** | **CommonJS** (`require` / `module.exports`) bundled via **Browserify** into a single bundle.js |
| **CSS Framework** | **Bootstrap 3.3.7** (CDN) + custom CSS (cssBasic.css, cssPokemon.css) |
| **Architectural Pattern** | **Client-Side Monolith with a thin server proxy** |

```text
┌──────────────────────────────────────────────────────┐
│                    Browser (SPA)                     │
│                                                      │
│  board.js ──────── Central Controller (Board)        │
│    ├── node.js ............. Grid cell data model    │
│    ├── getDistance.js ....... Turn-aware cost calc   │
│    ├── pathfindingAlgorithms/                        │
│    │     ├── astar.js                                │
│    │     ├── weightedSearchAlgorithm.js              │
│    │     ├── unweightedSearchAlgorithm.js            │
│    │     └── bidirectional.js                        │
│    ├── animations/                                   │
│    │     ├── animationController.js (pause/step)     │
│    │     ├── launchAnimations.js (timed)             │
│    │     ├── launchInstantAnimations.js (sync)       │
│    │     └── mazeGenerationAnimations.js             │
│    ├── mazeAlgorithms/ (6 generators)                │
│    └── utils/                                        │
│          ├── aiExplain.js ─── fetch /api/explain ─┐  │
│          ├── algorithmDescriptions.js (registry)  │  │
│          ├── explanationTemplates.js (Feynman)    │  │
│          ├── gridMetrics.js (pure)                │  │
│          ├── historyStorage.js (localStorage)     │  │
│          ├── historyUI.js (run cards)             │  │
│          ├── runSerializer.js (board → JSON)      │  │
│          ├── weightImpactAnalyzer.js (analysis)   │  │
│          ├── algorithmCompare.js (modal)          │  │
│          ├── algorithmModal.js (modal)            │  │
│          └── mazeSelector.js (maze UI)            │  │
├──────────────────────────────────────────────────────┤
│                 HTTP POST /api/explain               │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│              Express Server (server.js)              │
│  • helmet (CSP, security headers)                    │
│  • express-rate-limit (30 req/15min)                 │
│  • Static file serving (/public)                     │
│  • POST /api/explain → OpenAI proxy (gpt-4o-mini)    │
│  • Deterministic fallback on API failure             │
└──────────────────────────────────────────────────────┘
```

---

## 5. Data Storage

| Storage Type | Mechanism | What's Stored | Persistence |
|---|---|---|---|
| **Run History** | `localStorage` (key: `"pfv:runs:v1"`) | Last 5 algorithm runs — full grid state (walls, weights, start/target positions), algorithm settings, and results (path cost/length/visited count). JSON-serialized array. | Survives page refresh. Lost on clearing browser data. Max 5 runs (LIFO eviction). |
| **Sidebar Preference** | `localStorage` (key: `"sidebarOpen"`) | Boolean sidebar open/closed state | Survives refresh |
| **Grid State** | **In-Memory** (JS objects) | The entire `Board` instance: `nodes` dictionary, `boardArray`, animation queues, trace events, algorithm selection, mouse/keyboard state | **Lost on page refresh** — no auto-save of grid layout |
| **AI Explanations** | **Transient** (DOM only) | Rendered into `#ai-explanation-text` element | Lost on refresh or re-run |
| **Server State** | **Stateless** | No database, no sessions, no cookies. Each `/api/explain` request is independent. API key read from `.env` at startup. | N/A |

**No relational/NoSQL database, no IndexedDB, no cookies, no session storage.**

---

## 6. Reliability & Delivery Guarantees

### Error Handling

| Layer | Strategy | Details |
|---|---|---|
| **Server** | `try/catch` + graceful fallback | OpenAI API call wrapped in try/catch; on failure, generates deterministic template-based explanation and returns it as `source: "fallback"`. Invalid request body returns 400 with structured error JSON. |
| **Server Security** | `helmet` + `express-rate-limit` | CSP headers, rate limiting (30 req/15min), request body validation (`algorithmKey`, `visitedCount` required). IP-based logging on limit exceeded. |
| **Client – AI Explain** | `fetch` catch + DOM fallback | On network/API error, renders a simplified "visited X nodes, path Y steps" message. Hides loading spinner. |
| **Client – History Storage** | Partial `try/catch` | `saveRun`, `loadRuns`, and `deleteRun` wrap storage access in try/catch and return safe defaults. `clearHistory()` currently calls `localStorage.removeItem` directly (no try/catch). |
| **Client – Algorithms** | Return-value based | Algorithms return failure states on invalid/unreachable scenarios, but not all failure exits are explicit `false` (some paths fall through with `undefined`). `launchAnimations` treats non-success as failure state. |
| **Client – DOM** | Defensive checks + tolerant fallbacks | Many DOM lookups are guarded (`if (!element) return`) and optional wrappers are null-checked. Some direct lookups assume expected elements exist. |
| **Client – General** | **No global try/catch or error boundary** | There is no window-level error handler. Unhandled errors propagate to the browser console. No crash-recovery UI. |

### State & Concurrency

| Concern | Mechanism |
|---|---|
| **Single-threaded model** | All code runs on the main thread. No Web Workers, no shared-memory concurrency. |
| **Interaction locking** | `board.buttonsOn` acts as a global mutex — set to `false` during algorithm execution/animation, blocking user input (wall painting, algorithm switching, history actions). Re-enabled on completion or failure. |
| **Pending run tokens** | `historyUI` uses unique `"pending-{timestamp}-{random}"` tokens to prevent stale pending-run updates — `updatePendingRun` and `resolvePendingRun` verify token matches before applying state changes. |
| **Throttled rendering** | History list re-renders are throttled to 100ms intervals during animations to prevent DOM thrashing. |
| **Drag recalculation** | When `algoDone === true` and user drags an endpoint, `redoAlgorithm()` triggers `instantAlgorithm()` (synchronous — no animation delays), ensuring immediate consistent state. |
| **Race-condition scope** | UI race conditions between animation and direct user input are strongly reduced by single-threading + `buttonsOn`; however async AI responses are not token-guarded and can overwrite newer run summaries if responses arrive out of order. |

### Execution/Logic Reliability

| Concern | Status |
|---|---|
| **Retry / Backoff** | **None.** No retry logic exists anywhere — neither for the OpenAI API call, nor for localStorage writes, nor for animation frame scheduling. A single failure is final. |
| **Timeouts** | **None on client.** The OpenAI `fetch` call has no explicit timeout — it relies on browser defaults. Server-side rate limiting uses a 15-minute window but no per-request timeout. |
| **Animation Recovery** | The `AnimationController` uses recursive `setTimeout` (not `setInterval`), so each frame must complete before the next is scheduled. If a callback throws, the animation chain can break without automatic recovery. `stop()` fully resets state, providing a manual escape. |
| **Graceful Degradation** | AI explanation degrades from OpenAI → deterministic fallback → simple "visited X" string. Maze generation errors re-enable buttons via try/catch in `mazeSelector.runAnimatedMaze`. |
| **Data Integrity** | Run serialization is a point-in-time snapshot. No checksums or versioning beyond `version: "1.0"`. LocalStorage has a 5-run LIFO cap preventing unbounded growth. |

---

## Change Log vs Previous Plan

The following were corrected while keeping the rest unchanged:

1. Navbar algorithm items are informational (open modals), not selection controls.
2. Playback controls visibility is speed-dependent (shown in Average/Slow, hidden in Fast).
3. `clearHistory()` is not wrapped in try/catch.
4. Algorithm failure returns are not uniformly explicit `false`.
5. Global race-free claim narrowed; async AI response ordering can still cause stale overwrite.
6. Cost-model note clarified: turn penalties are used in search logic, but results-bar path-cost display does not include turn penalties.
7. Minor DOM-wrapper mismatch acknowledged as tolerant (null-checked optional wrappers).
