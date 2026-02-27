# Delivery Plan, Testing & Metrics

## 1) Milestones (Matches 3-Day Roadmap)

### Day 1 — Cost Model + Serialization
- Weight slider (0-50)
- Fix hardcoded weight=15 in algorithms
- Serialize board state to JSON
- localStorage save/load logic

### Day 2 — Explanations
- Add `trace[]` to algorithms
- Explanation panel UI (right sidebar)
- Template text for trace events

### Day 3 — History UI + Polish + AI Explanation
- History dropdown with Load/Delete
- Replay from saved run
- **AI Explanation Feature: Post-run**
  - Backend endpoint `POST /api/explain`
  - Build Run Digest after animation completes
  - UI box `#ai-explanation` below grid
  - Fallback text if AI fails
- Test all features work together

## 2) Testing Strategy (practical)
### Cost model
- weight=0 behaves like unweighted (for Dijkstra cost comparisons)
- numeric weights change total cost and path decisions
- turn penalty calculation works correctly where applicable

### Serialization
- serialize → deserialize restores walls/weights/start/target/settings
- history capped at 5 items

### Trace correctness
- relax events: new cost is lower than old
- found_target occurs exactly once if path exists

### AI Explanation Feature
- Only successful runs (path found) trigger AI explanation
- Output is exactly 5 sentences (includes one counterfactual starting with "If")
- No jargon; uses only digest numbers (visitedCount, pathLength, etc.)
- AI does not invent steps or data beyond provided digest

## 3) Metrics (for learning + debugging)
- Total path cost
- Path length
- Visited nodes count
- Trace event count
- Max frontier size (optional)

## 4) Risks & mitigations
- Trace overhead → make it optional
- localStorage size → sparse + cap 5
- Explanation correctness → generate only from trace (no guessing)
- AI API failure → fallback deterministic text
- AI hallucination → strict guardrails in prompt + translation-only mode

## 4.1) AI Explanation Test Checklist

| Scenario | Expected Result |
|----------|----------------|
| Failure run (no path) | No explanation shown |
| Server down / API error | Fallback: 5-sentence deterministic paragraph from `server.js:generateFallback()` including visited count, grid coverage, path length, straight-line distance, detour steps, wall/weight counts, counterfactual |
| Slow API response | Loading state shown, then explanation |

## 5) Decided Defaults
- **Weight slider:** 0–50, default 15
- **Explain mode:** Dijkstra + A* show g/h/f. BFS/DFS show simpler text.
- **History:** Load restores grid. User clicks Visualize to replay.
- **Out of scope:** ~~pause/step controls~~ (**✅ Implemented** via `AnimationController`), live AI narration (step-by-step during animation), trace export, storing AI explanation in history

---

## 6) Existing Test Files

| File | Description |
|------|-------------|
| `tests/algorithmDescriptionsSchema.test.js` | Validates schema of all 8 algorithm description objects |
| `tests/weightImpactAnalyzer.test.js` | Tests weight impact analysis logic |
