# ⚙️ CON LẮC KÉP — PHÒNG THÍ NGHIỆM ĐỘNG LỰC HỌC

> **Mô phỏng tương tác con lắc kép phục vụ học tập, giảng dạy và khảo sát các hiện tượng động lực học.**

---

## 📌 Giới thiệu

**Con lắc kép — Phòng thí nghiệm động lực học** là mô phỏng tương tác được xây dựng bằng **HTML, CSS và JavaScript**, cho phép người học trực tiếp thay đổi các tham số của hệ và quan sát phản ứng của chuyển động theo thời gian.

Mô phỏng tập trung vào việc trực quan hóa:

* Chuyển động của hệ con lắc kép
* Điều kiện ban đầu
* Khối lượng và hình học
* Trọng trường
* Ma sát và tiêu hao năng lượng
* Lực cản không khí
* Gió và môi trường
* Lực tác dụng bên ngoài
* Rung điểm treo
* Động năng và thế năng
* Động lượng và mô-men động lượng
* Vận tốc và gia tốc
* Chuyển động của khối tâm

---

## 🧩 Cấu trúc dự án

```text
double-pendulum/
│
├── index.html
├── index.css
└── index.js
```

| File         | Chức năng                                     |
| ------------ | --------------------------------------------- |
| `index.html` | Cấu trúc và các thành phần của giao diện      |
| `index.css`  | Thiết kế giao diện và bố cục                  |
| `index.js`   | Logic mô phỏng, tính toán vật lý và tương tác |

### Liên kết file

Trong `index.html`:

```html
<link rel="stylesheet" href="index.css">
<script src="index.js"></script>
```

> ⚠️ Ba file nên được đặt cùng thư mục nếu sử dụng các đường dẫn trên.

---

# 🔬 Mô hình vật lý

Mô phỏng sử dụng mô hình:

**Cơ học Lagrange + phương pháp tích phân RK4**

### Lagrange

Phương pháp Lagrange được sử dụng để mô tả động lực học của hệ thông qua các tọa độ suy rộng của con lắc.

Các đại lượng cơ bản gồm:

```text
θ₁
θ₂
ω₁
ω₂
α₁
α₂
```

Trong đó:

* `θ₁`, `θ₂`: góc của hai thanh
* `ω₁`, `ω₂`: vận tốc góc
* `α₁`, `α₂`: gia tốc góc

### RK4

**Runge–Kutta bậc 4 (RK4)** được sử dụng để tích phân hệ phương trình vi phân theo thời gian.

Điều này giúp mô phỏng chuyển động liên tục của hệ trên máy tính.

---

# ⚙️ Các thông số mô phỏng

## 1. Khối lượng

Mô phỏng cho phép điều chỉnh:

```text
m₁
m₂
M₁
M₂
m₁ giữa
m₂ giữa
m₁ đầu
m₂ đầu
```

Các thông số này cho phép khảo sát ảnh hưởng của sự phân bố khối lượng đến chuyển động.

---

## 2. Hình học

Các thông số hình học:

```text
L₁
L₂
d₁
d₂
r₁
r₂
```

Trong đó:

* `L₁`, `L₂`: chiều dài thanh
* `d₁`, `d₂`: đường kính thanh
* `r₁`, `r₂`: bán kính vật

---

## 3. Điều kiện ban đầu

```text
θ₁
θ₂
ω₁
ω₂
```

Đây là nhóm thông số đặc biệt quan trọng khi khảo sát sự phụ thuộc của chuyển động vào điều kiện ban đầu.

Một thay đổi rất nhỏ trong điều kiện ban đầu có thể dẫn tới sự khác biệt đáng kể trong quỹ đạo theo thời gian.

---

# 🌍 Trọng trường

Thông số:

```text
g
```

Có thể khảo sát các trường hợp:

| Môi trường        |          `g` |
| ----------------- | -----------: |
| 🌎 Trái Đất       |  `9.81 m/s²` |
| 🌙 Mặt Trăng      |  `1.62 m/s²` |
| 🔴 Sao Hỏa        |  `3.71 m/s²` |
| 🪐 Mộc Tinh       | `24.79 m/s²` |
| ∅ Không trọng lực |     `0 m/s²` |

---

# 🧲 Ma sát và hao mòn

Mô phỏng có các tham số:

```text
b₁
b₂
f₁
f₂
wearRate
```

Có thể khảo sát:

* Ma sát nhớt
* Ma sát khô
* Tiêu hao năng lượng
* Hao mòn khớp
* Ảnh hưởng của ma sát đến biên độ chuyển động

---

# 🌬️ Không khí và gió

Các thông số môi trường gồm:

```text
T
p
wind
windAng
gust
gustP
Cd
rodCd
```

Có thể bật:

```text
Cản không khí
Bật gió
```

và thay đổi các tham số để khảo sát ảnh hưởng của môi trường đến chuyển động.

---

# 🌊 Môi trường chất lưu

Mô phỏng hỗ trợ thêm:

```text
μ
ρf
```

cũng như tùy chọn:

```text
Lực đẩy Archimedes
```

Nhờ đó có thể khảo sát hệ trong những điều kiện môi trường khác nhau.

---

# 📳 Rung điểm treo

Các tham số:

```text
Biên độ rung
Tần số rung
Hướng rung
```

cho phép khảo sát phản ứng của hệ khi điểm treo có dao động.

---

# 💥 Lực ngoại vi

Có thể tác dụng lực ngoài thông qua:

```text
F
Hướng lực
Thời gian
```

và lựa chọn tác dụng lên:

```text
m₁
```

hoặc:

```text
m₂
```

Sau khi thiết lập thông số, sử dụng nút:

**Tác dụng lực**

để đưa lực vào mô phỏng.

---

# 📊 Hệ thống đo lường

Mô phỏng cung cấp bảng đo lường động lực học theo thời gian thực.

## Góc

```text
θ₁
θ₂
```

## Vận tốc góc

```text
ω₁
ω₂
```

**Đơn vị:** `rad/s`

## Gia tốc góc

```text
α₁
α₂
```

**Đơn vị:** `rad/s²`

---

# 🏃 Vận tốc và gia tốc

Các đại lượng:

```text
|v₁|
|v₂|
```

Đơn vị:

```text
m/s
```

và:

```text
|a₁|
|a₂|
```

Đơn vị:

```text
m/s²
```

---

# 🔗 Lực và mô-men

Mô phỏng hiển thị:

```text
T₁
T₂
```

là lực căng thanh theo cách biểu diễn của mô phỏng.

Mô-men ma sát:

```text
τ_f1
τ_f2
```

Công suất tiêu hao:

```text
P_loss
```

Đơn vị:

```text
W
```

---

# ⚡ Năng lượng

Hệ thống theo dõi:

```text
K
U
E
ΔE
W_ext
Loss
```

Trong đó:

| Ký hiệu | Ý nghĩa                         |
| ------- | ------------------------------- |
| `K`     | Động năng                       |
| `U`     | Thế năng                        |
| `E`     | Cơ năng                         |
| `ΔE`    | Độ thay đổi/sai lệch năng lượng |
| `W_ext` | Công của lực ngoài              |
| `Loss`  | Năng lượng tiêu hao             |

Đây là nhóm đại lượng quan trọng để kiểm tra sự trao đổi và thất thoát năng lượng trong mô phỏng.

---

# 🎯 Khối tâm

Vị trí khối tâm được biểu diễn dưới dạng:

```text
CM = (xCM, yCM)
```

với đơn vị:

```text
m
```

---

# 🌀 Động lượng và mô-men động lượng

Động lượng:

```text
|P|
```

Đơn vị:

```text
kg·m/s
```

Mô-men động lượng:

```text
|L|
```

Đơn vị:

```text
kg·m²/s
```

---

# 🎥 Điều khiển mô phỏng

Các chức năng chính:

```text
▶ / Tạm dừng
↻ Reset hệ thống
```

Ngoài ra có:

```text
Zoom
Camera X
Camera Y
Lưới tọa độ
Vector vận tốc và gió
Nhãn vật lý
Vệt quỹ đạo
Tốc độ thời gian
```

### Điều khiển chuột

* **Kéo vật** để thay đổi vị trí.
* **Kéo nền** để di chuyển camera.
* **Cuộn chuột** để zoom.

---

# 🧪 Các thí nghiệm đề xuất

## Thí nghiệm 01 — Điều kiện ban đầu

Giữ nguyên các thông số khác và thay đổi rất nhỏ:

```text
θ₂
```

So sánh hai quỹ đạo theo thời gian.

### Mục tiêu

Quan sát sự nhạy cảm của hệ đối với điều kiện ban đầu.

---

## Thí nghiệm 02 — Chiều dài con lắc

Thay đổi:

```text
L₁
L₂
```

Quan sát:

* Quỹ đạo
* Vận tốc
* Gia tốc
* Năng lượng

---

## Thí nghiệm 03 — Trọng trường

Lần lượt chọn:

```text
Trái Đất
Mặt Trăng
Sao Hỏa
Mộc Tinh
Không trọng lực
```

So sánh chuyển động.

---

## Thí nghiệm 04 — Ma sát

Tăng:

```text
b₁
b₂
```

Quan sát sự suy giảm chuyển động.

Sau đó thay đổi:

```text
f₁
f₂
```

để khảo sát ma sát khô.

---

## Thí nghiệm 05 — Cản không khí

Bật:

```text
Cản không khí
```

Sau đó thay đổi:

```text
Cd
rodCd
```

So sánh với trường hợp không có cản.

---

## Thí nghiệm 06 — Lực ngoài

Thay đổi:

```text
F
Hướng lực
Thời gian
```

Sau đó tác dụng lên `m₁` hoặc `m₂`.

Quan sát sự thay đổi của:

```text
v
a
K
U
E
```

---

## Thí nghiệm 07 — Rung điểm treo

Thay đổi:

```text
Biên độ rung
Tần số rung
Hướng rung
```

Quan sát phản ứng của hệ.

---

# 🎓 Ứng dụng trong dạy học

Mô phỏng có thể hỗ trợ các chủ đề:

* Chuyển động quay
* Động lực học
* Vận tốc góc
* Gia tốc góc
* Năng lượng
* Động lượng
* Mô-men động lượng
* Ma sát
* Lực cản
* Lực ngoài
* Trọng trường
* Khối tâm
* Dao động
* Mô phỏng số

Đặc biệt phù hợp để sử dụng như một **phòng thí nghiệm ảo**, giúp học sinh quan sát trực tiếp mối quan hệ giữa tham số đầu vào và kết quả chuyển động.

---

# 🛠️ Quy tắc phát triển

Khi chỉnh sửa dự án, cần phân biệt rõ:

### HTML

Chịu trách nhiệm về:

```text
Cấu trúc
Nội dung
Nút
Thanh điều khiển
Canvas
Bảng đo
```

### CSS

Chịu trách nhiệm về:

```text
Màu sắc
Bố cục
Kích thước
Font
Responsive
Hiệu ứng giao diện
```

### JavaScript

Chịu trách nhiệm về:

```text
Tính toán vật lý
Mô phỏng
Animation
Tương tác
Cảm biến
Năng lượng
Điều khiển
```

> **Tách file không được làm thay đổi mô hình vật lý.**

Nếu mục tiêu chỉ là tổ chức lại mã nguồn, cần giữ nguyên logic tính toán và chỉ chuyển phần mã sang file tương ứng.

---

# 🌐 Triển khai GitHub Pages

Cấu trúc khuyến nghị:

```text
double-pendulum/
├── index.html
├── index.css
└── index.js
```

`index.html` là trang chính.

Trong HTML:

```html
<link rel="stylesheet" href="index.css">
<script src="index.js"></script>
```

Sau khi đưa lên GitHub Pages, cần kiểm tra:

* `index.html` tồn tại.
* `index.css` tồn tại.
* `index.js` tồn tại.
* Tên file viết đúng chính xác.
* Đường dẫn trong HTML chính xác.
* Ba file nằm đúng thư mục.
* JavaScript không phát sinh lỗi trong Console.

---

# 🔍 Checklist trước khi công bố

```text
☐ index.html hoạt động
☐ index.css được tải
☐ index.js được tải
☐ Canvas hiển thị
☐ Con lắc chuyển động
☐ Nút Tạm dừng hoạt động
☐ Reset hoạt động
☐ Zoom hoạt động
☐ Camera hoạt động
☐ Thay đổi khối lượng hoạt động
☐ Thay đổi chiều dài hoạt động
☐ Thay đổi góc hoạt động
☐ Thay đổi vận tốc góc hoạt động
☐ Thay đổi trọng trường hoạt động
☐ Ma sát hoạt động
☐ Cản không khí hoạt động
☐ Gió hoạt động
☐ Lực ngoài hoạt động
☐ Bảng năng lượng hoạt động
☐ Cảm biến hoạt động
☐ Không có lỗi Console
☐ GitHub Pages tải đủ 3 file
```

---

# 📁 Phiên bản mã nguồn

```text
Project
│
├── index.html
├── index.css
└── index.js
```

**HTML** → giao diện
**CSS** → thiết kế
**JS** → mô phỏng vật lý

---

# 🏁 Kết luận

**Con lắc kép — Phòng thí nghiệm động lực học** được xây dựng theo hướng mô phỏng trực quan, cho phép người học thay đổi nhiều tham số và quan sát trực tiếp sự biến đổi của hệ.

Việc tách dự án thành ba file:

```text
index.html
index.css
index.js
```

giúp mã nguồn dễ quản lý, bảo trì và triển khai trên GitHub Pages hơn, đồng thời vẫn giữ nguyên chức năng của mô phỏng khi phần vật lý trong JavaScript không bị thay đổi.

---

<div align="center">

## ⚙️ CON LẮC KÉP — PHÒNG THÍ NGHIỆM ĐỘNG LỰC HỌC

**Interactive Physics Simulation**

**© 2026 | © Copyright ATCX. All rights reserved**

</div>

