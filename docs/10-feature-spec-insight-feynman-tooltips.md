# Feature Spec: Insight Panel Feynman Tooltips

> **Status: ✅ FULLY IMPLEMENTED**

## 1. Overview & Objective
Add `?` (question mark) icons next to section titles in the "Insight" tab. When users hover over these icons, a tooltip explains the meaning in simple, beginner-friendly language following the **Feynman Technique**.

Goal: Achieve the "Educational pathfinding visualizer" philosophy — help students not only see the algorithm run but understand the dry terminology.

> **Implementation note:** The original spec was written in Vietnamese, but the actual implementation uses **English** tooltips (matching the app's current `LANGUAGE_POLICY = "english"` in `server.js`). The tooltip copy lives in `INSIGHT_TOOLTIP_COPY` in `board.js` (lines ~80–108).

## 2. Technical Approach (Implementation)
The project uses Vanilla JS + jQuery + Bootstrap 3.3.7, leveraging existing libraries:

*   **UI - Question mark icon (`?`)**: 
    *   Uses `<button class="insight-tooltip-icon">` with Bootstrap glyphicons: `<span class="glyphicon glyphicon-question-sign"></span>`
    *   CSS class `.insight-tooltip-icon` in `cssBasic.css`: grey, small (font-size: 12px), margin-left, cursor: help, brightens on hover
    *   Each icon has `aria-label` and `aria-hidden="true"` on the glyphicon span for accessibility
*   **Hover Behavior**: 
    *   Uses **Bootstrap 3 Tooltip** component. `initInsightTooltips()` in `board.js` initializes jQuery `.tooltip()` with custom template
    *   Tooltip content set via `applyInsightTooltipCopy()` which reads from `INSIGHT_TOOLTIP_COPY` object
*   **Dynamic Tooltip Swapping**: 
    *   `syncCostTooltipsForAlgorithmMode()` swaps cost tooltips when Swarm algorithms are selected:
      - Standard mode: g = "distance from start", h = "estimated distance to target", f = "g + h total"
      - Swarm mode: g → Score, h → Heuristic, f → Score (Total)

## 3. Nội dung Giải thích theo chuẩn Feynman (The Feynman Explanations)

Dưới đây là các định nghĩa "bình dân học vụ" sẽ được đặt vào thuộc tính `title` hoặc `data-tooltip` của từng mục tương ứng trong file `index.html`:

### 3.1. Current Event (Bước hiện tại)
*   *Vị trí chèn:* Gần thẻ `<h5 class="sidebar-section-title">Current Event</h5>`
*   *Feynman Explain:* "Đoạn mã giống như đang đọc một quyển sách. Số này cho bạn biết thuật toán đang 'đọc' tới bước thứ mấy từ lúc bắt đầu chạy. Bước càng cao nghĩa là nó đã phải suy nghĩ rất lâu."

### 3.2. Current Node (Ô đang xét)
*   *Vị trí chèn:* Gần `<h5 class="sidebar-section-title">Current Node</h5>`
*   *Feynman Explain:* "Đây là 'chỗ đứng' hiện tại của thuật toán. Giống như bạn đang đứng ở một ngã tư, thuật toán đang đứng ở tọa độ này để nhìn ngó xung quanh xem nên đi đường nào tiếp."

### 3.3. Costs (g, h, f)
*(Nếu muốn tooltip chi tiết cho từng loại chi phí bên cạnh ID `gLabel`, `hLabel`, `fLabel`)*
*   **g (Chi phí đã đi):** "Độ xa của đoạn đường bạn đã đổ mồ hôi bước đi từ vạch xuất phát đến vị trí hiện tại."
*   **h (Chi phí ước tính):** "Khoảng cách chim bay (ước lượng) từ chỗ bạn đang đứng đến đích. Đây chỉ là đoán mò, chưa chắc đã đi được đường chim bay thật."
*   **f (Tổng chi phí):** = g + h. "Là tổng hợp của 'đã đi bao rát chân' cộng với 'còn xa bao nhiêu nữa'. Thuật toán luôn lười biếng và sẽ ưu tiên chọn ô có số dòng `f` này nhỏ nhất!"

### 3.4. What's Happening? (Đang xảy ra chuyện gì?)
*   *Vị trí chèn:* Gần `<h5 class="sidebar-section-title">What's Happening?</h5>`
*   *Feynman Explain:* "Nơi đây giống như công cụ 'đọc suy nghĩ' của thuật toán. Nó tường thuật trực tiếp lý do tại sao nó lại chọn ô này mà bỏ qua ô khác trong tích tắc vừa rồi."

### 3.5. Algorithm Metrics (Chỉ số thuật toán)
*(Có thể đặt tooltip tổng, hoặc tách ra 2 tooltip cho Frontier Size và Visited)*
*   **Frontier Size (Số ngã rẽ dự bị):** "Danh sách các ô tiếp theo mà thuật toán đã nhìn thấy nhưng chưa quyết định đi. Giống như danh sách các quán ăn bạn có thể rẽ vào nhưng đang đứng cân nhắc."
*   **Visited Count (Số ô đã khám phá):** "Tổng số ô mà thuật toán đã thực sự bước chân vào và kiểm tra. Con số này càng lớn, thuật toán càng phải đi lạc và mò mẫm nhiều (kém hiệu quả hơn)."

### 3.6. Cost Model (Mô hình chi phí)
*   *Vị trí chèn:* Gần `<h5 class="sidebar-section-title">Cost Model</h5>`
*   *Feynman Explain:* "Đây là 'Luật Tính Tiền' của bản đồ. Đi thẳng thì mượt không tróc vẩy. Nhưng nếu phải ngoặt gấp, thuật toán sẽ bị phạt thêm điểm (tốn sức hơn). Mảnh đất có tạ (Weight) giống như đầm lầy, đi qua cực kỳ tốn năng lượng."

### 3.7. Why This Path? (Tại sao lại là đường này?)
*   *Vị trí chèn:* Gần `<h5 class="sidebar-section-title">Why This Path?</h5>`
*   *Feynman Explain:* "Khi đã đến đích, thuật toán sẽ nhìn lại toàn bộ hành trình và giải thích vì sao đoạn đường màu vàng vừa vẽ ra lại là lựa chọn khôn ngoan và tiêu ít năng lượng nhất."

### 3.8. AI Summary (Tóm tắt từ AI)
*   *Vị trí chèn:* Gần `<h5 class="sidebar-section-title">AI Summary</h5>`
*   *Feynman Explain:* "Một con Trí Tuệ Nhân Tạo (AI) thực thụ đã ngồi xem toàn bộ quá trình chạy và tóm tắt lại bằng 3 câu tiếng người đơn giản nhất cho bạn."

## 4. Implementation Status

All 3 steps have been completed:

1.  **✅ Step 1: CSS in `cssBasic.css`**
    *   `.insight-tooltip-icon` class implemented with margin, color, transition, hover effects.
2.  **✅ Step 2: HTML in `index.html`**
    *   `<button class="insight-tooltip-icon">` elements with `<span class="glyphicon glyphicon-question-sign">` added next to every sidebar section title in `#panelInsight`.
    *   Each icon has `aria-label` for accessibility and `data-tooltip-key` for dynamic content.
3.  **✅ Step 3: Scripting in `board.js`**
    *   `initInsightTooltips()` initializes Bootstrap tooltips via jQuery `.tooltip()` with custom template.
    *   `applyInsightTooltipCopy()` sets content from `INSIGHT_TOOLTIP_COPY` object.
    *   `syncCostTooltipsForAlgorithmMode()` dynamically swaps cost tooltips for Swarm algorithms (g/h/f → Score/Heuristic/Score) — this was **not anticipated in the original spec** but was added during implementation.
