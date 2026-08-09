README.md


Con lắc kép --- Phòng thí nghiệm động lực học nâng cao
1. Tổng quan
Đây là một mô phỏng con lắc kép dùng giao diện HTML/CSS/JavaScript,
hướng tới việc quan sát và khảo sát các đại lượng cơ học của hệ con lắc
kép.

Trong giao diện hiện tại, tiêu đề dự án là "Con lắc kép --- Phòng thí
nghiệm động lực học nâng cao" và mô hình được mô tả là:

Phòng thí nghiệm động lực học --- mô hình cơ học Lagrange + RK4

Mô phỏng có một vùng canvas để hiển thị chuyển động và một bảng điều
khiển cho phép thay đổi nhiều thông số vật lý, môi trường, lực ngoài và
điều kiện ban đầu.

2. Cấu trúc dự án
Cấu trúc nên dùng khi triển khai GitHub Pages:

double-pendulum/
├── index.html
├── index.css
└── index.js
Vai trò từng file
File Chức năng

index.html Cấu trúc giao diện, bảng điều
khiển, canvas và các thành phần đo
lường

index.css Giao diện, bố cục, màu sắc, thanh
điều khiển và trạng thái hiển thị

Liên kết trong index.html
Nếu đổi tên CSS và JavaScript thành index.css và index.js, phần
<head> và cuối <body> phải dùng:

<link rel="stylesheet" href="index.css">
và:

<script src="index.js"></script>
Không cần đổi các id, class hoặc cấu trúc HTML khác chỉ vì đổi tên
file.

3. Vì sao phải dùng index.html?
GitHub Pages sẽ ưu tiên tìm file:

index.html
làm trang chính của thư mục.

Vì vậy URL dạng:

https://ten-tai-khoan.github.io/ten-repository/
có thể mở trực tiếp trang mô phỏng nếu repository có:

index.html
ở đúng thư mục được GitHub Pages phục vụ.

4. Thành phần giao diện chính
Giao diện gồm hai khu vực:

4.1. Khu vực mô phỏng
HTML sử dụng:

<canvas id="cv"></canvas>
Canvas là vùng hiển thị mô phỏng chuyển động của hệ con lắc.

Ngoài ra có nút:

▶
để thu gọn hoặc mở rộng bảng điều khiển.

4.2. Bảng điều khiển
Bảng điều khiển có nhiều nhóm thông số:

Âm thanh & tính năng thực tế

Camera & quan sát

Thông số khối lượng

Hình học & cấu trúc

Điều kiện ban đầu

Vật liệu & hao mòn ổ khớp

Không khí & gió động

Môi trường nâng cao & rung

Lực ngoại vi

Điều khiển mô phỏng

Bảng đo lường năng lượng

Cảm biến động lực học chi tiết

5. Âm thanh và tính năng thực tế
Có hai tùy chọn:

Âm thanh mô phỏng
Âm thanh mô phỏng (Gió & Khớp ma sát)
Cho phép bật/tắt âm thanh mô phỏng.

Chế độ độ mòn vô hạn
Chế độ độ mòn vô hạn (Không đứt, bỏ qua 100%)
Giao diện cung cấp tùy chọn để kiểm soát việc mô phỏng độ mòn và trạng
thái đứt.

6. Camera và quan sát
Các thông số quan sát gồm:

Zoom

Camera X

Camera Y

Lưới tọa độ

Vector vận tốc và gió

Nhãn vật lý

Giao diện hướng dẫn thao tác trực tiếp:

Kéo m₁, m₂ để thay đổi vị trí.

Kéo nền để thay đổi góc nhìn.

Cuộn chuột để zoom.

7. Hệ thống khối lượng
Mô hình cho phép điều chỉnh 8 thành phần khối lượng.

7.1. Vật 1
Ký hiệu:

m₁
Đây là khối lượng vật thứ nhất.

7.2. Vật 2
Ký hiệu:

m₂
Đây là khối lượng vật thứ hai.

7.3. Khối lượng thanh
M₁
M₂
Tương ứng với khối lượng của thanh 1 và thanh 2.

7.4. Khối lượng giữa thanh
m₁ giữa
m₂ giữa
Cho phép thêm khối lượng tập trung tại vùng giữa mỗi thanh.

7.5. Khối lượng đầu thanh
m₁ đầu
m₂ đầu
Cho phép thêm khối lượng tập trung ở đầu thanh.

Các thông số này làm cho mô hình có thể biểu diễn nhiều cấu hình phân bố
khối lượng khác nhau.

8. Hình học và cấu trúc
Các thông số hình học gồm:

Chiều dài
L₁
L₂
là chiều dài hai thanh.

Đường kính thanh
d₁
d₂
Bán kính vật
r₁
r₂
Các thông số này được sử dụng để mô tả kích thước hình học của hệ.

9. Điều kiện ban đầu
Có bốn thông số quan trọng:

θ₁
θ₂
ω₁
ω₂
Trong đó:

θ₁: góc ban đầu của thanh thứ nhất.

θ₂: góc ban đầu của thanh thứ hai.

ω₁: vận tốc góc ban đầu của thanh thứ nhất.

ω₂: vận tốc góc ban đầu của thanh thứ hai.

Đây là nhóm thông số rất quan trọng khi khảo sát tính nhạy cảm của con
lắc kép đối với điều kiện ban đầu.

10. Gia tốc trọng trường
Thông số:

g
có thể thay đổi trong giao diện.

Có sẵn các lựa chọn:

Thiên thể / trạng thái Giá trị

Trái Đất 9.81 m/s²
Mặt Trăng 1.62 m/s²
Sao Hỏa 3.71 m/s²
Mộc Tinh 24.79 m/s²
Không trọng lực 0 m/s²

Điều này cho phép so sánh chuyển động của hệ trong các trường trọng lực
khác nhau.

11. Vật liệu và hao mòn
Có các lựa chọn vật liệu:

s1 - Vật liệu gốc
s2 - Thép
s3 - Titanium
s4 - Sắt
s5 - Dây thừng
Giao diện mô tả nhóm này liên quan đến khả năng chịu lực ly tâm và tốc
độ hao mòn khớp nối khi quay nhanh.

Ngoài vật liệu, có:

b₁
b₂
là các hệ số nhớt/giảm chấn.

Và:

f₁
f₂
là các thông số ma sát khô.

Thông số:

wearRate
là hệ số mòn cơ bản.

12. Không khí và gió
Mô phỏng cung cấp một nhóm thông số môi trường khá rộng.

12.1. Nhiệt độ
T
Giao diện cho phép thay đổi nhiệt độ.

12.2. Áp suất
p
12.3. Gió tĩnh
wind
12.4. Hướng gió
windAng
12.5. Gió giật
gust
12.6. Chu kỳ gió giật
gustP
12.7. Hệ số cản
Cd
cho vật và:

rodCd
cho thanh.

Có thể bật/tắt:

Cản không khí
Bật gió
13. Môi trường chất lưu
Có thêm các thông số:

μ
ρf
Trong đó giao diện mô tả:

μ: độ nhớt.

ρf: mật độ chất lưu.

Có tùy chọn:

Lực đẩy Archimedes
để xét thêm lực đẩy nổi trong mô phỏng.

14. Môi trường nâng cao và rung
Nhóm này gồm:

Hệ số ρ khí
Hệ số nhớt môi trường
Biên độ rung
Tần số rung
Hướng rung
Các thông số cho phép khảo sát hệ trong môi trường có chuyển động hoặc
rung của điểm treo.

15. Lực ngoại vi
Mô phỏng cho phép tác dụng một lực ngoài:

F
với:

Hướng lực
Thời gian
Có thể chọn lực tác dụng lên:

m₁
hoặc:

m₂
Sau khi thiết lập thông số, dùng nút:

Tác dụng lực
để kích hoạt lực ngoài.

16. Điều khiển mô phỏng
Có hai thông số chính:

Tốc độ thời gian
speed
Cho phép tăng hoặc giảm tốc độ diễn tiến của mô phỏng.

Vệt quỹ đạo
trail
Cho phép điều chỉnh độ dài vệt quỹ đạo của vật.

Các nút:

Tạm dừng
Reset hệ thống
cho phép dừng/tiếp tục và đưa hệ về trạng thái ban đầu.

17. Mô hình cơ học
Theo mô tả trong giao diện, mô phỏng sử dụng:

mô hình cơ học Lagrange + RK4
Điều này cho biết hai thành phần chính:

Phương pháp Lagrange
Dùng để xây dựng động lực học của hệ cơ học thông qua tọa độ suy rộng,
chẳng hạn các góc của hai thanh.

RK4
RK4 là phương pháp Runge--Kutta bậc 4 dùng để tích phân phương trình vi
phân theo thời gian.

Trong mô phỏng số, chất lượng kết quả phụ thuộc vào mô hình động lực
học, bước thời gian và cách xử lý các hiệu ứng phụ như ma sát, lực cản
và lực ngoài.

18. Các đại lượng động học được hiển thị
Bảng cảm biến hiển thị:

Góc
θ₁
θ₂
đơn vị độ.

Vận tốc góc
ω₁
ω₂
đơn vị:

rad/s
Gia tốc góc
α₁
α₂
đơn vị:

rad/s²
19. Vận tốc và gia tốc không gian
Giao diện hiển thị:

|v₁|
|v₂|
đơn vị:

m/s
và:

|a₁|
|a₂|
đơn vị:

m/s²
Những đại lượng này giúp quan sát chuyển động của hai vật theo thời
gian.

20. Lực và mô-men
Bảng đo lường hiển thị:

T₁
T₂
được ghi là lực căng thanh.

Ngoài ra:

τ_f1
τ_f2
là mô-men ma sát.

Công suất tiêu tán:

P_loss
được hiển thị theo đơn vị watt.

21. Năng lượng
Mô phỏng có bảng năng lượng gồm ba thanh đo:

Động năng
K
Thế năng
U
Tiêu hao
Loss
Ngoài ra cảm biến hiển thị:

K
U
E
ΔE
W_ext
Trong đó:

K: tổng động năng.

U: tổng thế năng.

E: cơ năng toàn phần.

ΔE: sai lệch cơ năng.

W_ext: công của lực ngoài.

Nhóm thông số này đặc biệt hữu ích khi kiểm tra sự trao đổi năng lượng
trong hệ.

22. Khối tâm
Giao diện hiển thị tọa độ khối tâm:

CM = (xCM, yCM)
đơn vị:

m
Đây là một đại lượng quan trọng khi phân tích chuyển động tổng thể của
hệ.

23. Động lượng
Mô phỏng hiển thị:

|P|
với đơn vị:

kg·m/s
Đây là độ lớn của động lượng tuyến tính của hệ theo cách hiển thị của mô
phỏng.

Ngoài ra có:

|L|
với đơn vị:

kg·m²/s
là độ lớn mô-men động lượng được hiển thị.

24. Mật độ không khí
Cảm biến môi trường hiển thị:

ρ
với đơn vị:

kg/m³
Thông số này liên quan đến trạng thái môi trường không khí được sử dụng
trong mô phỏng.

25. Ý nghĩa giáo dục
Mô phỏng phù hợp để minh họa nhiều nội dung cơ học:

Chuyển động quay.

Vận tốc góc.

Gia tốc góc.

Động lực học hệ nhiều vật.

Ảnh hưởng của điều kiện ban đầu.

Trao đổi động năng và thế năng.

Ma sát và tiêu hao năng lượng.

Lực cản môi trường.

Tác dụng của lực ngoài.

Ảnh hưởng của trọng trường.

Ảnh hưởng của khối lượng và chiều dài.

Chuyển động của khối tâm.

Động lượng và mô-men động lượng.

Mô phỏng số bằng phương pháp RK4.

26. Một số thí nghiệm đề xuất
Thí nghiệm 1 --- Ảnh hưởng của góc ban đầu
Giữ nguyên:

m₁ = m₂
L₁ = L₂
ω₁ = ω₂ = 0
Thay đổi θ₂ một lượng nhỏ.

Quan sát sự khác biệt của quỹ đạo theo thời gian.

Mục tiêu: khảo sát tính nhạy cảm của chuyển động con lắc kép đối với
điều kiện ban đầu.

Thí nghiệm 2 --- Ảnh hưởng của chiều dài
Giữ các thông số khối lượng không đổi.

Thay đổi:

L₁
L₂
Quan sát:

Chu kỳ chuyển động.

Tốc độ của vật.

Quỹ đạo.

Năng lượng.

Thí nghiệm 3 --- Ảnh hưởng của trọng trường
Lần lượt chọn:

Trái Đất
Mặt Trăng
Sao Hỏa
Mộc Tinh
Không trọng lực
Quan sát sự thay đổi của chuyển động.

Thí nghiệm 4 --- Ma sát
Tăng:

b₁
b₂
và quan sát tốc độ suy giảm chuyển động.

Sau đó thay đổi:

f₁
f₂
để khảo sát ảnh hưởng của ma sát khô.

Thí nghiệm 5 --- Cản không khí
Bật:

Cản không khí
Sau đó thay đổi:

Cd
rodCd
So sánh với trường hợp không có cản.

Thí nghiệm 6 --- Tác dụng lực ngoài
Chọn:

F
Hướng lực
Thời gian
Sau đó chọn vị trí tác dụng:

m₁ hoặc m₂
và nhấn:

Tác dụng lực
Quan sát sự thay đổi của vận tốc, năng lượng và quỹ đạo.

Thí nghiệm 7 --- Rung điểm treo
Tăng:

Biên độ rung
Tần số rung
Hướng rung
Quan sát phản ứng của hệ.

27. Quy trình kiểm tra mô phỏng
Khi phát triển hoặc chỉnh sửa code, nên kiểm tra theo thứ tự:

Mở trang khi chưa có ngoại lực.

Kiểm tra hai vật xuất hiện đúng vị trí.

Kiểm tra nút Tạm dừng.

Kiểm tra Reset.

Thay đổi m₁, m₂.

Thay đổi L₁, L₂.

Thay đổi θ₁, θ₂.

Thay đổi ω₁, ω₂.

Thay đổi g.

Bật/tắt cản không khí.

Bật/tắt gió.

Thay đổi ma sát.

Tác dụng lực ngoài.

Kiểm tra bảng năng lượng.

Kiểm tra cảm biến động lực học.

Kiểm tra thao tác kéo vật bằng chuột.

Kiểm tra zoom và camera.

Kiểm tra GitHub Pages sau khi đổi tên file.

28. Lưu ý khi tách file
Khi tách một file HTML lớn thành ba file, nguyên tắc an toàn là:

HTML → chỉ chứa cấu trúc trang
CSS  → chứa phần <style>
JS   → chứa phần <script>
Không nên viết lại các phương trình vật lý chỉ vì tách file.

Mục tiêu của việc tách file là thay đổi cấu trúc lưu trữ mã nguồn,
không thay đổi mô hình vật lý.

29. Kiểm tra tên file
Nếu sử dụng:

index.html
index.css
index.js
thì trong HTML phải có:

<link rel="stylesheet" href="index.css">
và:

<script src="index.js"></script>
Ba file cần nằm cùng thư mục:

double-pendulum/
├── index.html
├── index.css
└── index.js
Không được để:

index.html
css/index.css
js/index.js
trừ khi đường dẫn trong HTML cũng được đổi tương ứng.

30. Triển khai GitHub Pages
Quy trình cơ bản:

Bước 1
Đưa ba file lên repository:

index.html
index.css
index.js
Bước 2
Kiểm tra index.html có tham chiếu đúng:

<link rel="stylesheet" href="index.css">
<script src="index.js"></script>
Bước 3
Vào phần cấu hình GitHub Pages.

Chọn branch chứa mã nguồn của dự án.

Bước 4
Mở URL GitHub Pages.

Nếu trang chỉ hiện tiêu đề mà không có mô phỏng, kiểm tra trước:

Tên file JS.

Tên file CSS.

Đường dẫn trong index.html.

Console của trình duyệt.

Việc file JS có được tải hay không.

31. Trạng thái file HTML hiện tại
File index.html hiện tại đã có tên index.html, nhưng nội dung đang
tham chiếu:

<link rel="stylesheet" href="double-pendulum.css">
và:

<script src="double-pendulum.js"></script>
Nếu bạn đã đổi tên hai file thành:

index.css
index.js
thì cần sửa hai đường dẫn trên thành:

<link rel="stylesheet" href="index.css">
<script src="index.js"></script>
Đây là bước quan trọng để GitHub Pages tải đúng các file.

32. Kết luận
Dự án là một phòng thí nghiệm mô phỏng con lắc kép với nhiều khả năng
điều chỉnh.

Các nhóm chính gồm:

Khối lượng
↓
Hình học
↓
Điều kiện ban đầu
↓
Trọng trường
↓
Ma sát
↓
Không khí
↓
Gió
↓
Chất lưu
↓
Rung điểm treo
↓
Lực ngoài
↓
Mô phỏng số
↓
Đo lường năng lượng
↓
Cảm biến động lực học
Khi chỉnh sửa dự án, cần ưu tiên nguyên tắc:

Tách file không đồng nghĩa với thay đổi vật lý.

Nếu mục tiêu là giữ nguyên mô phỏng ban đầu, phần tính toán vật lý trong
JavaScript cần được giữ nguyên và chỉ thay đổi vị trí lưu trữ mã nguồn.
