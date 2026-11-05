# Hệ Thống Tông Môn V3.0 — Sắc Lệnh Hệ Thống

Nâng cấp từ V2.9, giữ nguyên thứ tự và ID 10.000 nhiệm vụ, tỉ lệ 7.500 hữu ích / 2.500 giải trí, XP, điểm kỷ luật, thành tựu, cốt truyện, cán bộ 007, chỉ tiêu cá nhân và favicon.

## Thay đổi
- Nhiệm vụ được hiển thị theo 6 phần: giới thiệu, bối cảnh, hành động, điều kiện hoàn thành, lời cán bộ, phần thưởng.
- 9.916 nhiệm vụ sinh mới có dữ liệu nội dung có cấu trúc, liên kết hành động với khu vực/bối cảnh và lời thoại. 84 nhiệm vụ gốc được giữ nguyên, có phần giới thiệu và bối cảnh chung để bảo toàn tương thích.
- Bỏ nhãn sinh nội dung kiểu “Bí cảnh 4 · Tối ưu · ... · 9”.
- Nội dung của nhiệm vụ và popup báo cáo được đồng bộ.

## Giới hạn
10.000 nhiệm vụ vẫn dùng tổ hợp mẫu, không phải 10.000 câu chuyện viết tay độc lập. Chưa kiểm thử tương tác end-to-end trên trình duyệt. Xác minh hành động ngoài đời vẫn dựa trên tự báo cáo và thời gian client.

## Kiểm tra
`python3 tests/check_v30.py` (yêu cầu Node.js).
