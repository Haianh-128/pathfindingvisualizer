# Accessibility (A11Y) Guidelines

## Overview
This document outlines accessibility considerations for the Pathfinding Visualizer. While full accessibility compliance is **not required for MVP**, these guidelines ensure the tool is usable by a wider audience and can be incrementally improved.

---

## 1) Current State

### What Works
- Basic mouse interaction for drawing
- Visual feedback via colors and animations
- Text labels in legend and navbar
- **ARIA labels** on tutorial overlay (`aria-modal="true"`, `aria-label`), insight tooltip icons (`aria-label`, `aria-hidden`), and various interactive elements
- **Tutorial keyboard navigation** — full keyboard support: ArrowLeft/Right navigation, Escape to close, Tab trapping within modal
- **Insight tooltip icons** with `aria-label` attributes for screen reader access

### What's Still Missing
- **Grid keyboard navigation** — cannot navigate cells via keyboard
- **Screen reader grid descriptions** — no ARIA live regions for algorithm progress
- **`prefers-reduced-motion` support** — animations not adapted
- **`prefers-contrast: high` support** — no high-contrast mode
- **Color-blind friendly palette** — no alternative patterns for all node states
- **Comprehensive focus indicators** — partial coverage only

---

## 2) MVP Accessibility (Minimal Effort)

### 2.1 Color Contrast
**Problem:** Some colors may be hard to distinguish, especially for colorblind users.

**Quick Fixes:**
- Ensure text has at least 4.5:1 contrast ratio against background
- Add patterns/icons alongside colors for node types

| Node Type | Current Color | Suggested Enhancement |
|-----------|---------------|----------------------|
| Wall | Dark grey | Keep (high contrast) |
| Weight | Purple with icon | ✅ Already has icon |
| Visited | Blue gradient | Add subtle pattern |
| Shortest Path | Yellow | Keep (high contrast) |
| Start | Triangle icon | ✅ Already has icon |
| Target | Circle icon | ✅ Already has icon |

### 2.2 Focus Indicators
**Problem:** When tabbing through UI, no visible focus ring.

**Quick Fix (CSS):**
```css
button:focus,
a:focus,
.dropdown-toggle:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

### 2.3 Button Labels
**Problem:** Some buttons lack descriptive text for screen readers.

**Quick Fix (HTML):**
```html
<!-- Add aria-label to icon-only buttons -->
<button aria-label="Clear the board" id="startButtonClearBoard">
  Clear Board
</button>

<!-- Add sr-only text for visual elements -->
<div class="start" aria-label="Start node"></div>
```

---

## 3) Post-MVP Accessibility

### 3.1 Keyboard Navigation

#### Grid Navigation
```
Arrow keys: Move focus between cells
Enter/Space: Toggle wall on focused cell
W + Enter: Toggle weight on focused cell
S: Set start node at focused cell
T: Set target node at focused cell
```

**Implementation Approach:**
```javascript
// Add tabindex to cells
currentHTMLRow += `<td id="${newNodeId}" class="${newNodeClass}" tabindex="0"></td>`;

// Add keyboard handler
document.addEventListener('keydown', (e) => {
  const focused = document.activeElement;
  if (focused.tagName === 'TD') {
    const [row, col] = focused.id.split('-').map(Number);
    switch(e.key) {
      case 'ArrowUp': focusCell(row - 1, col); break;
      case 'ArrowDown': focusCell(row + 1, col); break;
      case 'ArrowLeft': focusCell(row, col - 1); break;
      case 'ArrowRight': focusCell(row, col + 1); break;
      case 'Enter':
      case ' ':
        toggleWall(focused.id);
        break;
    }
  }
});
```

#### Control Navigation
- Tab through navbar items
- Enter to activate buttons
- Escape to close dropdowns

### 3.2 Screen Reader Support

#### ARIA Live Regions
```html
<!-- Announce algorithm progress -->
<div id="algorithmStatus" aria-live="polite" class="sr-only">
  <!-- Updated dynamically -->
  Visiting node 10-15. Distance: 27.
</div>

<!-- Announce completion -->
<div id="completionStatus" aria-live="assertive" class="sr-only">
  <!-- Updated on finish -->
  Path found! Total cost: 45. Path length: 23 nodes.
</div>
```

#### Grid Description
```html
<table id="board" role="grid" aria-label="Pathfinding grid">
  <caption class="sr-only">
    A grid for pathfinding visualization. 
    Use arrow keys to navigate, Enter to toggle walls.
  </caption>
</table>
```

### 3.3 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Provide instant state changes instead */
  .visited {
    background-color: rgba(0, 190, 218, 0.75);
  }
  
  .shortest-path {
    background-color: rgb(255, 254, 106);
  }
}
```

### 3.4 High Contrast Mode
```css
@media (prefers-contrast: high) {
  .wall {
    background-color: #000;
    border: 2px solid #fff;
  }
  
  .visited {
    background-color: #0000ff;
    border: 1px solid #fff;
  }
  
  .shortest-path {
    background-color: #ffff00;
    border: 2px solid #000;
  }
}
```

---

## 4) Accessibility Checklist

### MVP (Do Now)
- [x] Add `aria-label` to navbar buttons — **Done** (tutorial overlay, tooltip icons)
- [x] Add keyboard support for tutorial modal — **Done** (ArrowLeft/Right, Escape, Tab trapping)
- [ ] Add focus outlines to all interactive elements
- [ ] Ensure 4.5:1 text contrast ratio
- [ ] Add `alt` text to any images

### Post-MVP (Do Later)
- [ ] Implement keyboard grid navigation
- [ ] Add ARIA live regions for status updates
- [ ] Add screen reader descriptions
- [ ] Support `prefers-reduced-motion`
- [ ] Support `prefers-contrast: high`
- [ ] Test with screen reader (VoiceOver/NVDA)

---

## 5) Testing Tools

### Automated
- **Lighthouse** (Chrome DevTools) — Accessibility audit
- **axe DevTools** — Browser extension
- **WAVE** — Web accessibility evaluation

### Manual
- **Keyboard-only navigation test**
- **Screen reader test** (VoiceOver on Mac, NVDA on Windows)
- **Color contrast checker** (WebAIM)
- **Zoom test** (200% browser zoom)

---

## 6) Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)
