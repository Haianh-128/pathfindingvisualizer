# Feature Spec: Insight Panel Feynman Tooltips

## 1. Overview & Objective
Thêm các biểu tượng `?` (dấu hỏi chấm nhỏ) bên cạnh các tiêu đề trong tab "Insight". Khi người dùng di chuột (hover) vào biểu tượng này, một tooltip sẽ xuất hiện giải thích ý nghĩa của mục đó bằng ngôn ngữ cực kỳ đơn giản, dễ hiểu theo phương pháp **Feynman Technique** (giải thích cho người mới bắt đầu hoặc học sinh hiểu được).

Mục tiêu: Đạt được triết lý "Educational pathfinding visualizer" – giúp học sinh không chỉ nhìn thấy thuật toán chạy mà còn hiểu tận gốc các thuật ngữ khô khan.

## 2. Technical Approach (Hướng Implement)
Vì dự án không dùng framework phức tạp (chỉ Vanilla JS + jQuery + Bootstrap 3.3.7), ta sẽ tận dụng tối đa các thư viện đang có sẵn:

*   **UI - Icon dấu hỏi (`?`)**: 
    *   Sử dụng icon glyphicon của Bootstrap sẵn có: `<span class="glyphicon glyphicon-question-sign"></span>` hoặc một icon SVG đơn giản kèm CSS tròn.
    *   Thêm class CSS (ví dụ: `.insight-tooltip-icon`) để style: màu xám nhạt mờ (`opacity: 0.6`), nhỏ nhắn (`font-size: 12px`), lề trái (`margin-left: 5px`), khi trỏ chuột vào thành hình bàn tay (`cursor: help`) và sáng lên (`opacity: 1`).
*   **Tương tác (Hover Behavior)**: 
    *   Sử dụng thành phần **Tooltip của Bootstrap 3**. Chỉ cần thêm attributes vào HTML icon: `data-toggle="tooltip" data-placement="right" title="Nội dung giải thích..."`.
    *   Kích hoạt Tooltip bằng một dòng lệnh jQuery nhỏ ở cuối file script hoặc trong init: `$('[data-toggle="tooltip"]').tooltip();`.
    *   **Fallback**: Nếu không muốn dùng tooltip JS của Bootstrap để tối ưu hiệu năng, có thể làm **Pure CSS Tooltip**: dùng attribute `data-tooltip` trên icon, và dùng pseudo-element `::after` trong CSS để hiển thị nội dung khi `:hover`. (Khuyến khích cách này vì khớp với định hướng "CSS-only animations" của giao diện Dark Stage mới).

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

## 4. Kế hoạch Implement (Không sửa code ngay bây giờ)

Nếu tiến hành implement, quy trình sẽ theo 3 bước sau:

1.  **Bước 1: Cập nhật CSSBasic.css**
    *   Viết CSS cho class `.insight-tooltip-icon` (margin, color, transition).
    *   (Tùy chọn) Viết Pure CSS Tooltip nếu không dùng Bootstrap JS để giữ UI chuẩn phong cách *Glassmorphism/Dark Stage* (tooltips nổi lên với backdrop-filter: blur).
2.  **Bước 2: Chèn HTML vào `index.html`**
    *   Tìm cụm `<h5 class="sidebar-section-title">` trong `#panelInsight`.
    *   Gắn thêm snippet `<span class="glyphicon glyphicon-question-sign insight-tooltip-icon" data-toggle="tooltip" title="[Text Giải thích]"></span>` bên cạnh thẻ `h5` hoặc vào trong thẻ `h5`.
3.  **Bước 3: Khởi tạo/Kiểm tra (Scripting)**
    *   Nếu dùng Bootstrap Modal Tooltip, thêm `$('[data-toggle="tooltip"]').tooltip();` vào lúc khởi tạo trang.
    *   Kiểm tra accessibility: Đảm bảo có thẻ `aria-label` cho Screen Reader đọc được nội dung tooltip.
