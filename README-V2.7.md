# Hệ Thống Tông Môn V2.7 – Thiên Mệnh Ký Chủ

Kế thừa V2.6 và giữ nguyên ngân hàng 10.000 nhiệm vụ, tỷ lệ 75/25, XP, popup báo cáo, xác minh trên 80% thời lượng, điểm kỷ luật và hồi chiêu hỗ trợ.

## Mới

- 40 thành tựu có tiến độ; danh hiệu mở khóa và trang bị trong bảng Thành tựu.
- 5 chương cốt truyện theo mốc 0, 10, 50, 150, 300 nhiệm vụ hoàn thành. Cốt truyện đặt Hệ Thống là bên chọn ký chủ, nhiệm vụ đời thường là phép thử tu luyện; không thay thế cơ chế chọn nhiệm vụ ngẫu nhiên.
- Cán bộ số 007 có lời thoại theo sự kiện và ghi nhớ thống kê hoàn thành, nhóm nhiệm vụ, chuỗi, lượt xin gợi ý, bỏ nhiệm vụ. Chỉ lưu tối đa 5 lời thoại gần đây, không lưu nội dung báo cáo trong trí nhớ cán bộ.
- Dữ liệu mới nằm trong `state.officerMemory`, tương thích với localStorage key `system-missions-v1`. Tiến trình cũ vẫn được giữ; các thống kê phân loại bắt đầu tính từ lúc cập nhật.

## Triển khai

Thay `public/nhiem-vu.html` trong dự án bằng file cùng tên trong ZIP. Sau đó commit và push. Có thể mở file HTML để thử giao diện; chức năng voice cần server hiện có.

## Giới hạn

Đây là bản client-side: localStorage không chống được người cố ý sửa dữ liệu. Chưa kiểm thử end-to-end trên trình duyệt.
