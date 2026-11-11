# GPLX2026 — hướng dẫn AI tiếp tục

Đây là dự án mới từ app `com.daotaogplx.vn_driving_theory` v2.0.3, repository https://github.com/litequang/GPLX2026. Không sửa hoặc lấy nhầm dữ liệu từ sibling `gplx-pwa` (repo GPLX cũ).

Đọc README.md, PROJECT_MAP.md, DATA_MAP.md, DESIGN_SYSTEM.md, VALIDATION.md và ROADMAP.md. Trước mỗi thay đổi kiểm tra `git status`; cập nhật TIMELINE.md khi hoàn tất chặng và thông báo tiến độ thường xuyên.

Quy tắc:

- dist là mã chạy trực tiếp, không phải thư mục build được xóa tùy ý. Node phục vụ preview/kiểm thử/xuất dữ liệu; runtime không có backend.
- Giữ câu hỏi, đáp án và nội dung theo nguồn. Không sửa cho giống bộ cũ hoặc tự khẳng định là bộ đề chính thức hiện hành.
- Dữ liệu nằm trong texture25.imeg đã giải mã; texture24 chỉ phục vụ đối chiếu. Hai file mã hóa và libapp.so gốc ở ngoài Git.
- ZCORRECT đánh số từ 1. DIGROUPA1 và DIGROUPB1 là cờ điểm liệt theo hạng, không phải đáp án thay thế. Pool B có 592 câu trong snapshot, không tự đổi thành 600.
- Trong pool B có 56 câu điểm liệt; 60 là số của kho toàn bộ. Không sửa membership/critical để khớp kỳ vọng khi chưa xác minh nguồn.
- Bộ bài NETEST có thể có nhiều câu điểm liệt theo nguồn; không áp tiêu chuẩn đúng một câu cho dữ liệu gốc. Chế độ ngẫu nhiên tự tạo đúng một câu điểm liệt theo hạng và ghi rõ mục đích ôn tập.
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

Khi sửa shell, tăng APP_REVISION trong worker. Khi đổi dữ liệu, tái xuất offline manifest. Giữ migration khi đổi schema tiến độ. Khi đổi cấu trúc, cập nhật PROJECT_MAP/DATA_MAP và việc còn lại trong ROADMAP.
