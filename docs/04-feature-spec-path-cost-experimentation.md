# Feature Spec — Path Cost Experimentation (Beyond fixed weight=15)

## 1) Problem (Feynman)
If weight is always 15, learners only see “one kind of bad road.”
True experimentation means changing cost values and observing how decisions change.

## 2) MVP Capabilities
- User can choose a numeric weight value (slider/input)
- Painting weights assigns that numeric value
- Algorithms treat weight as numeric (no hardcoded 15 assumptions)
- UI shows run summary: total path cost, visited nodes, path length

## 3) Cost Model (Keep Existing Logic)

**The cost calculation formula is unchanged.** Weight is now fully configurable.

Current behavior:
- Base move: 1
- Turn penalty: calculated by existing `getDistance()` function
- Weight: `node.weight` (user-configurable 0–50 via slider)

```js
// Edge cost = getDistance(from, to)[0] + to.weight
// getDistance already handles turn penalty internally
```

> **✅ Done:** All hardcoded `weight === 15` checks have been removed. No instances remain in the codebase (verified via grep).

## 4) UI Spec (MVP)

### Weight Slider
- Label: "Weight: 15" (updates as slider moves)
- Range: 0–50, default 15
- Location: **sidebar Controls panel** under "Weight Value" section

### Interaction
- Keep existing "hold W + click" to paint weights
- Painted weight uses current slider value

### Run Summary (after Visualize completes)
- `#resultsBar` below grid showing **Path Cost**, **Length**, **Visited**
- Also reflected in the **Insight** sidebar panel with live metrics

## 5) Algorithm Requirements
- Weighted algorithms must treat `node.weight` as numeric
- ~~Remove logic like `weight === 15 ? 15 : 1`~~ **✅ Done** — no hardcoded weight assumptions remain
- Ensure clearing path doesn’t wipe weights unless user clears board

## 6) Acceptance Criteria
- Changing weight value changes the chosen path or total cost
- Running same grid with weight=5 vs weight=30 yields noticeably different outcomes
- No crashes caused by assumptions about weight=15

## 7) Out of Scope
- ~~Compare mode~~ **✅ Implemented** — `algorithmCompare.js` (133 LOC) provides a comparison modal with side-by-side table of all 8 algorithms
- Diagonal movement
- Preset terrains (Sand/Water/Swamp)
