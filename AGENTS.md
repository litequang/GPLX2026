# GPLX2026 — hướng dẫn AI tiếp tục

Đây là dự án mới từ app `com.daotaogplx.vn_driving_theory` v2.0.3, repository https://github.com/litequang/GPLX2026. Không sửa hoặc lấy nhầm dữ liệu từ sibling `gplx-pwa` (repo GPLX cũ).

Đọc README.md, PROJECT_MAP.md, DATA_MAP.md, DESIGN_SYSTEM.md, VALIDATION.md và ROADMAP.md. Trước mỗi thay đổi kiểm tra `git status`; cập nhật TIMELINE.md khi hoàn tất chặng và thông báo tiến độ thường xuyên.

Quy tắc:

- dist là mã chạy trực tiếp, không phải thư mục build được xóa tùy ý. Node phục vụ preview/kiểm thử/xuất dữ liệu; runtime không có backend.
- Nội dung thô giữ bằng source-report/comparison-report. Thay đổi theo nguồn chính thức chỉ qua content/official-2026.json + scripts/official-overlay.mjs; đọc OFFICIAL_AUDIT.md. Không gọi toàn bộ app là bộ chính thức mới nhất.
- Dữ liệu nằm trong texture25.imeg đã giải mã; texture24 chỉ phục vụ đối chiếu. Hai file mã hóa và libapp.so gốc ở ngoài Git.
- ZCORRECT đánh số từ 1. DIGROUPA1/DIGROUPB1 là cờ điểm liệt theo hạng. B592/56 là snapshot Android; runtime đã sửa thành B600/60 theo CV2262 được xác minh 11/11/2026. Không hoàn tác về số nguồn thô.
- Overlay kiểm tra phụ lục ID/critical, phục hồi 8 membership B và vá 13 câu đã đọc PDF; 600 answer ID không đổi. Các thay đổi khác cần bằng chứng chính thức và bản vá before/after, không sửa JSON tay.
- Bộ bài NETEST có thể có nhiều câu điểm liệt theo nguồn; không áp tiêu chuẩn đúng một câu cho dữ liệu gốc. Chế độ ngẫu nhiên dùng quota chủ đề CV2262 và đúng một critical; xem OFFICIAL_AUDIT. Chưa tự chuyển cấu trúc từ 01/03/2027.
- Dữ liệu nguồn phải escape trước khi hiển thị HTML. Không đưa HTML nguồn trực tiếp vào innerHTML.
- Không commit APK/DB/libapp.so/token/tiến độ cá nhân. Không gán giấy phép mở cho dữ liệu và hình ảnh bên thứ ba.
- Kiểm tra dist trước đóng gói: không ZIP/raw/secrets, không file trên 25 MiB; file bị Git ignore vẫn có thể bị packager copy.
- Chỉ tạo một Site, dùng project_id đã lưu trong .openai/hosting.json. Không tái sử dụng ID Site của GPLX cũ. Không force-push.
- Mọi kiểm thử phải ghi bằng chứng thật. Không ghi UI/browser/offline thực tế đã qua nếu chỉ chạy unit/HTTP hoặc worker mô phỏng.

Kiểm tra khi sửa phần liên quan:

```sh
npm test
node --check dist/app.js
node --check dist/sw.js
npm run check:deploy
```

Đọc OFFLINE.md khi sửa tải nền; không hứa worker chạy vô hạn khi Android đóng app. Giữ consent riêng, marker đúng revision, chờ worker mới activate.

Khi sửa shell, tăng APP_REVISION trong worker. Khi đổi dữ liệu, tái xuất offline manifest. Giữ migration khi đổi schema tiến độ. Khi đổi cấu trúc, cập nhật PROJECT_MAP/DATA_MAP và việc còn lại trong ROADMAP.
