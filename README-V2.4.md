# Hệ Thống Tông Môn V2.4 — Kỷ luật tông môn

- Điểm kỷ luật bắt đầu 0, độc lập với XP/cấp độ. Bỏ nhiệm vụ liên tiếp bị trừ 2, 3, 5, 5... điểm; hoàn thành nhiệm vụ đặt lại chuỗi bỏ.
- Điểm kỷ luật dưới -10 sẽ khai trừ tạm thời. Lần 1: 5 phút; lần 2: 10 phút; lần 3: 30 phút; từ lần 4: 10 × số lần phút.
- Trong thời gian khai trừ không thể nhận hoặc giao nộp nhiệm vụ. Khi hết hạn điểm kỷ luật được đặt về -5; số lần khai trừ vẫn lưu.
- “Khó quá cán bộ ơi”: 2 lượt gợi ý, mỗi lượt cách nhau ít nhất 30 giây; sau đó phải xác nhận rõ ràng mới bỏ nhiệm vụ và bị trừ điểm kỷ luật.
- Giữ cơ chế giao nộp trên 80% thời lượng, báo cáo trong popup, và dữ liệu người chơi hiện có trong localStorage.
- Lưu ý: trạng thái lưu trong localStorage chỉ chống thao tác spam thông thường; người có quyền chỉnh trình duyệt có thể can thiệp. Cần backend để xác minh chống gian lận thực sự.

## Cập nhật
Thay `public/nhiem-vu.html` bằng file cùng tên trong bản V2.4. Có thể giữ nguyên các file khác.
