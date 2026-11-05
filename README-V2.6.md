# Hệ Thống Tông Môn V2.6 — Ngân hàng 10.000 nhiệm vụ

## Nội dung
- 10.000 nhiệm vụ có tiêu đề riêng: 7.500 nhiệm vụ hữu ích (75%) và 2.500 nhiệm vụ giải trí (25%).
- Giữ nguyên 84 nhiệm vụ cũ và chỉ số ID để tương thích dữ liệu V2.5.
- 9.916 nhiệm vụ mới được tạo tại thời điểm tải trang bằng tổ hợp chủ đề, hành động, đối tượng và lời thoại, không cần tải tệp dữ liệu từ máy chủ.
- 50 nhiệm vụ mỗi ngày, gồm 37 hữu ích và 13 giải trí, vẫn theo quota độ khó `[8,7,5,12,10,8]`.
- Ưu tiên nhiệm vụ chưa gặp bằng `seenMissionIds` trong localStorage; khi hết kho mới lặp lại.
- Các nhiệm vụ mới có hướng dẫn hành động và kết quả cần báo cáo, nhiều nhiệm vụ có thời lượng 3/5/8/12 phút và phải vượt 80% thời lượng.
- Giữ nguyên popup báo cáo, gợi ý trong chat, hồi chiêu, điểm kỷ luật và hình phạt của V2.5.

## Lưu ý chất lượng
10.000 nhiệm vụ là **10.000 tổ hợp nhiệm vụ có tiêu đề riêng**, không phải 10.000 kịch bản viết tay độc lập. Nhiệm vụ được phối từ mẫu hành động, chủ đề, đối tượng, tình huống và câu thoại; người chơi lâu dài vẫn có thể cảm nhận các mô-típ giống nhau. Đề xuất tiếp tục biên tập thủ công và thử nghiệm nội dung với người chơi.

## Giới hạn kỹ thuật
Lưu tiến trình và bộ đếm ở trình duyệt (localStorage); không ngăn được người cố ý sửa dữ liệu. Các nhiệm vụ mới có thời lượng chỉ được tính khi trang đang hiển thị, giống V2.5.
