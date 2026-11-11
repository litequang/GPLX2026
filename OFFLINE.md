# Tải nền qua icon header — shell v4

Icon tải xuống luôn ở header sau khi dữ liệu khởi tạo, thay banner lớn ở Tổng quan. Bấm icon mở dialog dung lượng khoảng 27,9 MiB (nhãn UI làm tròn MB). Xác nhận “Tải và dùng ngoại tuyến” một lần: dialog đóng và worker tải 633 URL theo lô 6. Không render lại câu hỏi hoặc màn bài làm khi cập nhật phần trăm. Bấm icon lúc tải để xem tiến độ, lúc xong để xem đã sẵn sàng. Dấu tích/nhãn aria/title cho trạng thái ready, cảnh báo khi lỗi. Màn rất hẹp chỉ hiện icon của nút Cài app để giữ đủ chỗ cho hạng/theme/offline.

`dist/modules/offline.js` quản lý idle/downloading/ready/error, lưu lựa chọn riêng `gplx2026-offline-v1=enabled`, guard nhiều lần bấm, chỉ nhận message đúng revision. Không tải 28 MB tự động trước xác nhận. Khi đã xác nhận, lần mở sau/online sẽ tự tiếp tục hoặc tải dữ liệu revision mới. `restore` đọc marker cache trước; đã ready thì không tải lại. Xóa ảnh ngoại tuyến tắt lựa chọn tải tự động; không xóa progress/theme. Storage bị chặn vẫn tải trong phiên, không hứa nhớ được lần sau.

`activeWorker` đợi worker thay thế activated, tránh gửi yêu cầu dữ liệu mới cho worker cũ. Worker giữ task tải bằng waitUntil, broadcast revision/progress/done/error. Các URL đã cache hợp lệ được dùng lại khi retry; marker chỉ tạo sau đủ URL. Chưa dùng Background Fetch/Background Sync, không có quyền native chạy vô hạn. Android có thể dừng worker khi tắt app/tiết kiệm pin; mở lại sẽ tiếp tục từ phần đã lưu, không bảo đảm tải xong trong khi app bị đóng.

App khởi tạo shell/core/dataset/offline manifest với URL v4, worker precache cả URL thường và versioned. Nếu nâng version tiếp, đổi đồng bộ HTML/import/fetch/worker/register/HTTP tests. Manifest PWA giữ nguyên URL/id/start_url/scope để Chrome tiếp tục cập nhật WebAPK đã cài; fetch manifest network-first có kiểm MIME và fallback bản hợp lệ khi offline/lỗi xác thực.

Đã kiểm thử 5 nhóm controller với mock và worker VM; **chưa** kiểm chứng tải nền/đóng mở/quota/tiết kiệm pin/offline trên Chrome Android thật. Hosting private có thể cần mạng để xác thực trước khi vào app. Checklist: xác nhận/hủy, học và làm timed trong lúc tải, mất mạng giữa chừng, reload, đóng/mở app, cập nhật dữ liệu, lỗi quota, xóa cache rồi mở lại; label/focus và header 320/375/390 khi nút Cài app hiện.

## Sửa lỗi khởi tạo worker — shell v5

Đã kiểm tra trực tiếp hosting private bằng service-access token trong bộ nhớ: index.html trả307 về /, trong khi / trả200 HTML. Worker v4 đưa cả hai vào SHELL rồi từ chối response.redirected; browser fetch tự theo307 khiến install thất bại, registration.active về null. Thông báo cũ “cần HTTPS hoặc localhost” đánh lạc hướng trên cả PC/Android.

V5 bỏ alias index.html khỏi precache và dùng ./ cho fallback navigation; vẫn chặn redirect/auth HTML sai loại cho assets. Kiểm thử worker hiện mô phỏng index.html trả307 và dùng danh sách font thật có OFL.txt. createWorkerConnection retry register khi cài trước đó hỏng, gộp các lần bấm đồng thời; lỗi active rỗng báo worker chưa hoạt động. Dialog hiện lỗi thực, không suy ra thiếu HTTPS từ registration rỗng. Chờ install tối đa45s.

Manifest URL ổn định nhưng worker cá nhân hóa hai màu theo CacheStorage preference; cần worker cài thành công trước khi chọn theme/cài PWA để nhận màu mong muốn. Cache settings tách khỏi data và tiến độ.

## Sửa URL ảnh trên hosting — shell v6

Live-check v5 đã qua cài shell/manifest nhưng dừng ở assets/signImage/S.G,7.png. Kiểm tra HTTPS xác nhận URL raw dấu phẩy trả307 sang S.G%2C7.png, URL encoded trả200 image/png. Có21 URL dấu phẩy trong manifest offline. Worker v6 chuẩn hóa từng segment pathname (decode rồi encodeURIComponent, giữ query), dùng cùng URL canonical để tải, match và put cache; chấp nhận cả URL src thô và đã mã hóa. Không nới chặn redirect/auth HTML. Bộ test mock cả redirect index.html và ảnh dấu phẩy, kiểm cache offline raw/encoded cùng ảnh. Dataset/ảnh/raw/offline revision không đổi.
