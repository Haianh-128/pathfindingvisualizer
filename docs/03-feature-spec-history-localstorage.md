# Feature Spec — Run History (localStorage, 5-run)

## 1) Goal
Allow users to:
- View last 5 runs
- Load a run (restore grid + settings)
- Replay (re-run algorithm to animate)
- Delete runs

## 2) Design Principles
- Store **sparse** data, not full node objects.
- Store enough to reconstruct:
  - dimensions + start/target
  - walls list
  - weights list (+ numeric value)
  - settings (algo, speed, cost model)
  - result summary (optional)

## 3) Storage Schema
Key: `pfv:runs:v1` (managed by `historyStorage.js`, MAX_RUNS = 5)

```json
{
  "id": "1700000000000",
  "timestamp": 1700000000000,
  "version": 1,
  "grid": {
    "height": 22,
    "width": 60
  },
  "nodes": {
    "start": "10-5",
    "target": "10-40"
  },
  "walls": ["3-4", "3-5"],
  "weights": [{"id": "8-9", "value": 15}],
  "settings": {
    "algorithm": "dijkstra",
    "heuristic": "manhattanDistance",
    "speed": "average",
    "weightValue": 15,
    "algorithmKey": "dijkstra"
  },
  "result": {
    "found": true,
    "pathLength": 42,
    "pathCost": 123,
    "nodesVisited": 800
  }
}
```

> **Note:** Schema produced by `runSerializer.js` (143 LOC). Uses timestamp-based `id`, stores `heuristic` in settings (contrary to earlier removal note), and has no `name` field.

## 4) Operations
- Save run: `unshift` + cap 5
- Load list: render menu
- Load run: rebuild board state then render
- Replay: run algorithm again (do not store per-frame)
- Delete: remove by id

## 5) UI Spec
- History section in the **sidebar Controls panel** (`#historyList`), not navbar
- Run cards with two states:
  - **Pending run cards** — show live progress during visualization (token-based lifecycle)
  - **Saved run cards** — show algorithm name, timestamp, summary (cost/pathLen/visited)
    - Actions: **Load** / **Replay** / **Delete**
- **"Clear All History"** button at bottom of history section
- **Run context tracking** — distinguishes between `visualize` vs `replay` mode
- **Locked state** — UI locked during active animations to prevent conflicts

> **Implementation:** `historyUI.js` (534 LOC) manages the full history UI lifecycle.

## 6) Edge Cases (MVP: Keep Simple)
- **Viewport mismatch:** `historyUI.js:loadRun()` restores walls/weights/start/target/settings but uses the **current board dimensions** (does not rebuild grid to stored dimensions)
- **localStorage full:** Cap at 5 runs, show console warning if save fails
- **Corrupt data:** Catch JSON parse errors, clear bad entries

## 7) Acceptance Criteria
- After Visualize completes, run is saved to History
- Refresh page → History list still shows runs
- Load restores grid (walls, weights, start, target)
- User clicks Visualize to replay

## 8) Out of Scope (MVP)
- Rename runs
- Export/import history
- Cloud sync
