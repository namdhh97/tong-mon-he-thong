# Hệ Thống Tông Môn V2.9 — Tu luyện linh hoạt

- Giữ ngân hàng 10.000 nhiệm vụ, mỗi ngày tối đa 50 lượt, 75% hữu ích và 25% giải trí.
- Người chơi chọn chỉ tiêu 5, 10 hoặc 20 nhiệm vụ/ngày, mặc định 10; có thể đổi bất kỳ lúc nào.
- Chỉ tiêu là động lực, không phải hình phạt: không đạt chỉ tiêu không trừ kỷ luật.
- Khi đổi ngày: nhiệm vụ chưa nhận tự thu hồi; nhiệm vụ đang làm chuyển sang ngày mới và được bảo lưu tối đa 24 giờ tính từ lần chuyển ngày đầu tiên.
- Nhiệm vụ bảo lưu chiếm một trong 50 lượt ngày mới. Nếu quá hạn, tự thu hồi không trừ điểm kỷ luật.
- Chủ động bỏ nhiệm vụ vẫn giữ cơ chế phạt hiện tại.
- Giữ khóa localStorage `system-missions-v1`, không xóa dữ liệu XP, thành tựu, danh hiệu và ký ức cán bộ.
- Lưu ý: thời gian bảo lưu được tính từ lúc trang nhận biết ngày mới; nếu không mở trang nhiều ngày, nhiệm vụ đang làm sẽ không còn được bảo lưu. Thời gian xác minh hiện vẫn chỉ là cơ chế phía trình duyệt.

## Kiểm tra

```bash
python3 tests/check_v28.py
python3 tests/check_v29.py
```
