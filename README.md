# GPLX 2026

PWA tiếng Việt phục vụ ôn tập cá nhân từ **Ôn thi GPLX 2025 v2.0.3** trên điện thoại người dùng. Đã đối chiếu danh sách, điểm liệt, đáp án và quota với nguồn Cục CSGT ngày 11/11/2026; phạm vi/giới hạn tại [OFFICIAL_AUDIT.md](OFFICIAL_AUDIT.md).

Repository: https://github.com/litequang/GPLX2026

Web riêng tư đã triển khai: https://gplx2026-on-thi-quang.quartzcello4.chatgpt.site

## Chạy

Cần Node ≥22.13; không cần npm install, database server hoặc backend.

```sh
npm start
```

Mở http://localhost:4174. App chạy bằng HTML/CSS/JavaScript; Node chỉ phục vụ preview, kiểm thử và trích dữ liệu. Production chỉ cần static HTTPS hosting thư mục `dist/`.

## Chức năng

- 600 câu hỏi và giải thích, 60 điểm liệt trong kho đầy đủ; 332 biển báo; 15 cấu hình hạng.
- Học theo hạng/chủ đề, tìm không dấu, câu chưa học, đánh dấu và ôn sai/bỏ trống.
- 233 bài ôn nguồn và bài ngẫu nhiên; timer/deadline, khôi phục sau reload, chấm điểm và mở lại chi tiết 30 bài gần nhất.
- 56 mẹo, 11 bài sa hình / 33 phần hướng dẫn và 8 ảnh tham khảo.
- Tiến độ local, xuất/nhập JSON, xóa ảnh cache riêng; font/icon nội bộ và tải nền ngoại tuyến dữ liệu/ảnh khoảng 27,9 MiB qua icon header; xác nhận một lần, tự tiếp tục sau gián đoạn. Xem [OFFLINE.md](OFFLINE.md).
- Header/thanh dưới: cuộn xuống ẩn, dừng giữ nguyên, lên hiện; màn học gọn, bộ lọc mở rộng và Trước/Tiếp ngay sau đáp án.
- Nút Cài app header mobile/desktop mở hộp thoại khi Chrome cho phép, tự ẩn sau cài hoặc trong chế độ ứng dụng. Chi tiết: [UI_UPDATE.md](UI_UPDATE.md).
- Icon mặt trăng/mặt trời đổi sáng/tối ngay, nhớ lựa chọn; lần đầu theo thiết bị. Màu thanh trạng thái/canvas/safe-area đồng bộ theo theme qua cấu hình PWA, xem [THEME.md](THEME.md) về giới hạn Android/Chrome.

Runtime **B600/60**, A1/A250/20, B1300/30. Snapshot Android B592/56 được giữ trong source-report; overlay chính thức phục hồi 8 membership B, vá lựa chọn 13 câu và áp quota chủ đề. Theo báo cáo nguồn thô, 233 bài cố định có 207 bài nhiều critical, 2 bài không critical, 9 bài ngoài bộ lọc gốc; các số này mô tả snapshot trước overlay. Web giữ nguyên và gọi “Bộ bài ôn từ ứng dụng”, không xác nhận đề sát hạch chính thức. Nội dung mẹo có thể gồm bộ cũ.

## Tài liệu AI tiếp tục

| Tài liệu | Nội dung |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Quy tắc trước khi sửa |
| [PROJECT_MAP.md](PROJECT_MAP.md) | Sơ đồ kiến trúc, file, hàm, route, luồng lưu/cache |
| [DATA_MAP.md](DATA_MAP.md) | Giải mã, mapping, schema, ngoại lệ và dữ liệu bỏ qua |
| [OFFICIAL_AUDIT.md](OFFICIAL_AUDIT.md), [OFFLINE.md](OFFLINE.md) | Nguồn chính thức, bản vá tái hiện được và tải nền |
| [DATA_COMPARISON.md](DATA_COMPARISON.md) | So sánh với GPLX trước đó |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Quy tắc giao diện, công cụ hỗ trợ |
| [VALIDATION.md](VALIDATION.md) | Bằng chứng kiểm tra và giới hạn |
| [ROADMAP.md](ROADMAP.md), [TIMELINE.md](TIMELINE.md) | Việc còn lại và tiến độ |
| [DEPLOYMENT.md](DEPLOYMENT.md), [THIRD_PARTY.md](THIRD_PARTY.md) | Chạy/hosting và giấy phép |

## Kiểm tra

```sh
npm test
node --check dist/app.js
node --check dist/sw.js
npm run check:deploy
```

Khi preview chạy, dùng `npm run test:http`. Unit/HTTP/worker mô phỏng không thay thế browser QA. Đọc VALIDATION trước khi khẳng định UI/PWA đã được kiểm tra.

## Tái xuất

APK ở `../source-apk-2025`, tài nguyên/native ở `../extracted-2025`, giữ ngoài Git. Không cần điện thoại sau khi đã lấy đủ APK. `scripts/unpack-apk.py` giải nén chọn lọc; `npm run extract` giải mã và chuẩn hóa. Các máy khác dùng dataset/ảnh đã commit để chạy, không cần APK hoặc khóa.

Không áp giấy phép mở cho dữ liệu/ảnh app Android khi chưa xác nhận quyền sử dụng.
