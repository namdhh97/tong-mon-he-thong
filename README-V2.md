# Hệ Thống Tông Môn — Balanced Verification V2

## Thay đổi
- Quy tắc kiểm tra tường minh cho 84 nhiệm vụ (24 nhiệm vụ cơ sở và 60 nhiệm vụ từ packs).
- Nhiệm vụ đơn giản: tự xác nhận; nhiệm vụ khác: báo cáo kết quả; nhiệm vụ kiểm kê: số lượng; nhiệm vụ theo thời gian: bộ đếm + báo cáo.
- Không cộng XP nếu chưa xác nhận, chưa đủ thời gian, chưa đạt số lượng, hoặc báo cáo quá ngắn/trùng báo cáo đã được duyệt.
- Lưu trạng thái báo cáo và thời gian trong key localStorage `system-missions-v1` để tương thích dữ liệu cũ.
- Giữ nguyên XP, cấp độ, danh sách nhiệm vụ, cơ chế bỏ qua và phần giao diện chính.

## Giới hạn
- V2 là cơ chế chống spam ở phía trình duyệt, **không chống được người cố tình sửa localStorage hoặc JavaScript**. Muốn chống gian lận thực sự phải chuyển XP và xác minh sang server/database.
- Bộ đếm chỉ cộng thời gian khi tab hiển thị và đang hoạt động; không chứng minh người chơi đã làm việc ngoài đời thực.
- Kiểm tra báo cáo bằng quy tắc từ vựng không xác minh được tính trung thực/ngữ nghĩa. Báo cáo có thể bị đánh giá thiếu hoặc lọt qua.
- Khi sang ngày mới, nhiệm vụ chưa hoàn thành được tổng kết theo cơ chế hiện tại; thời gian đang thực hiện không chuyển sang ngày sau.

## Cài đặt
Thay thế source hiện tại bằng thư mục `du-lich-online` trong gói ZIP sau khi sao lưu bản cũ. Trong thư mục dự án, chạy `npm install`, `npm run build`, `npm start` (cần Node.js).

## Kiểm thử thủ công
1. Mở nhiệm vụ xác nhận nhanh: phải tích xác nhận mới giao nộp được.
2. Nhiệm vụ 3 món: báo cáo + nhập đủ số lượng 3 + xác nhận.
3. Nhiệm vụ 15 phút: không thể nhận XP ngay; chờ đủ thời gian tab hiển thị và báo cáo hợp lệ.
4. Giao nộp lặp: không cộng XP lần hai.
5. Tải lại trang giữa nhiệm vụ: báo cáo, thời gian, số lượng được khôi phục.
6. Dùng lại nguyên văn báo cáo đã duyệt: phải bị yêu cầu bổ sung.
7. Bỏ qua 3 lần: cơ chế trừ XP cũ vẫn hoạt động.
8. Kiểm tra dữ liệu localStorage cũ: XP và số nhiệm vụ hoàn thành giữ nguyên.

## Lưu ý triển khai
Bản này chưa được kiểm thử end-to-end trong trình duyệt thật. Cần chạy các trường hợp trên môi trường staging trước khi đưa lên production.

## V2.1 — Quy tắc thời gian 80%
- Nhiệm vụ có thời lượng được phép giao nộp khi thời gian ghi nhận **trên 80%** thời lượng yêu cầu.
- Ngưỡng tính theo giây nguyên: `floor(durationSeconds * 0.8) + 1`. Ví dụ 5 phút: 4 phút 01 giây; 15 phút: 12 phút 01 giây.
- Vẫn cần xác nhận, báo cáo hoặc số bước/số mục theo quy tắc riêng.
- Timer chỉ tính khi tab hiển thị; chưa có xác minh độc lập từ server.
