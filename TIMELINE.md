# Tiến độ GPLX2026

## Cập nhật giao diện sáng/tối — 11/11/2026

| Chặng | Trạng thái |
| --- | --- |
| Tham khảo sivn.app | Đọc HTML public: moon/sun và lưu preference/fallback hệ thống, không điều khiển UI site |
| Theme / màu mép ngoài | Mã hoàn tất: meta/manifest bỏ xanh, canvas/safe-area khớp sáng/tối, toggle header một chạm |
| Kiểm thử | 27 nhóm pass; 670 HTTP URL và output scan qua, xem VALIDATION |
| Browser / Android | Chưa xác nhận: browser access host unavailable; chi tiết giới hạn THEME.md |
| GitHub / web shell v3 | Hoàn tất: bc75d3b đã push, deployment appgdep_6af4219bb3c88191b2e5b8f4da18e42a succeeded |

Ngày: 11/11/2026 (Asia/Saigon).

| Chặng | Trạng thái | Điều kiện hoàn thành |
| --- | --- | --- |
| 1. Nhận diện app Ôn thi GPLX 2025 | Hoàn tất | com.daotaogplx.vn_driving_theory v2.0.3/code10 |
| 2. Lấy APK và phân tích | Hoàn tất | 4 APK, 1.105 assets/native ngoài Git, không cần điện thoại tiếp |
| 3. Chuẩn hóa dữ liệu | Hoàn tất | SQLite và 600 giải thích giải mã; 632 ảnh, provenance; B592/56 ghi rõ |
| 4. Thiết kế giao diện | Mã hoàn tất, chờ visual QA | Tham khảo UI UX Pro Max, font/icon local, responsive/mobile nav |
| 5. Xây PWA | Mã hoàn tất | Học, fixed/random, timer/restore/fullhistory, handbook, import/export, worker/cache |
| 6. Kiểm thử tự động | Hoàn tất | 15 nhóm,1.500 random,662 HTTP, syntax/output scan |
| 6b. Browser/Android | Chưa xác nhận | Browser access host unavailable; không có screenshot/end-to-end |
| 7. Tài liệu bàn giao | Hoàn tất bản đầu | PROJECT_MAP/DATA_MAP/design/comparison/validation/roadmap/AGENTS |
| 8. GitHub/hosting | Hoàn tất | GitHub main đã push; Sites private trả succeeded, URL bên dưới |

Không dùng dữ liệu của dự án GPLX cũ để giả định đã trích được dữ liệu app mới. Mỗi chặng ghi kết quả thật và các giới hạn kiểm tra.

## Kết quả bàn giao

- Web riêng tư: https://gplx2026-on-thi-quang.quartzcello4.chatgpt.site
- GitHub: https://github.com/litequang/GPLX2026
- Commit mã chạy đã triển khai: `033d63e824e28429d40757b25f97e1851569ba41`.
- Deployment `appgdep_6af3e45383a4819190f1d7189e0d6c8b`, succeeded ngày 11/11/2026, không có lỗi deployment.
- Các commit sau cập nhật tài liệu có thể mới hơn runtime; không thay đổi gói đã triển khai.
- Browser/Android QA còn thiếu; xem VALIDATION và ROADMAP.

## Cập nhật header, màn học và PWA — 11/11/2026

| Công việc | Trạng thái |
| --- | --- |
| Header/bottom-nav: xuống ẩn, dừng giữ nguyên, lên hiện; transform240ms | Mã hoàn tất, tracker/adapter test qua |
| Màn học/timed gọn, bộ lọc gấp, Trước/Tiếp trước giải thích, chuyển câu căn card | Mã hoàn tất, chưa visual QA |
| Cài app header mobile/desktop, native prompt trực tiếp, tự ẩn sau cài/standalone | Lifecycle giả lập qua, chưa Chrome Android thật |
| Shell v2, URL app/CSS versioned và precache module mới | Worker mô phỏng qua |
| Kiểm thử | 21 nhóm pass, HTTP/output xem VALIDATION |
| ZIP ngoài source | dist/index.zip 28.495.820 byte giữ ở ../.tools/gplx2026-index-preserved-20261111-scroll.zip, không đóng gói |
| GitHub/hosting bản cập nhật | Hoàn tất: a444871 đã push; deployment appgdep_6af41d3b864c8191b7374d4f29df35d7 succeeded |

Browser inventory vẫn báo The browser access host is unavailable; không coi unit/EventTarget/worker mock là visual/Android QA. Bản đồ chi tiết và checklist tại UI_UPDATE.md.

## Đối chiếu chính thức, thu gọn UI, tải nền — 11/11/2026

| Chặng | Trạng thái |
| --- | --- |
| Bỏ 3 mục nguồn thừa trên UI | Hoàn tất; tài liệu nguồn được giữ |
| Đọc nguồn chính thức | CV2262 và bộ600 từ Cục CSGT; TT108 bản ký trang1/36–38 |
| Dataset | B600/60; 600 answer ID khớp; vá13 lựa chọn; quota bài ngẫu nhiên; revision e9638aa2aa05be26 |
| Icon offline header | Consent1lần, tải nền, progress/ready/retry, resume lần mở sau; chưa Android thật |
| Vùng native Android | Người dùng mở PWA bằng icon; trên đúng, dưới Back/Home/Recents xanh. Đã sửa manifest fetch/theme resume/canvas, chưa xác nhận màu thực tế |
| Kiểm tra | 36 nhóm, 1.500 bài quota, 674 HTTP, 666 file output qua |
| Publish | GitHub a7c30f1 đã push; Sites appgdep_6af428bdbeb88191af22f0fb237ceedb succeeded, xem DEPLOYMENT |

Chi tiết cho AI tiếp theo: OFFICIAL_AUDIT.md, OFFLINE.md, PROJECT_MAP.md, VALIDATION.md; còn119 ứng viên text và QA browser/Android.

Người dùng gửi ảnh PWA sau cài lại: giao diện sáng hết xanh và nền dưới đồng bộ; giao diện tối native gesture/Home bar còn trắng. Ảnh còn0/592, chưa có icon offline nên chưa kiểm chứng runtime v4. Không ghi lỗi màu native đã được giải quyết hoàn toàn.

## Rà thanh Home dark sau xác nhận bản mới — 11/11/2026

Người dùng xác nhận v4. Đã đọc Chromium CL8077818 và controller hiện hành: màu native phụ thuộc nhánh manifest/edge-to-edge và bản Chrome. Cấu hình web cần thiết đã có ở v4; chưa tìm được sửa runtime bổ sung có cơ sở. ADB rỗng; cần version Chrome/Android và tái hiện thiết bị. Không đổi palette/manifest tối cố định hoặc fullscreen để che triệu chứng. Chỉ cập nhật tài liệu, không triển khai lại runtime.

## Sửa lỗi tải, manifest theo theme và lời chào — 11/11/2026

| Chặng | Trạng thái |
| --- | --- |
| Chẩn đoán hosting thật | index.html307→/; root200. Worker cũ từ chối redirect nên cài thất bại |
| Sửa worker | Canonical root, retry registration, lỗi không còn suy ra thiếu HTTPS |
| Manifest theo theme | Cache preference riêng, ack/re-read cùng URL, giữ identity; chưa Android native |
| Lời chào mobile | 19px, mô tả11px, ít khoảng trống, bỏ badge cạnh heading |
| Kiểm tra | 40 nhóm Node/VM;675 HTTP local;666 outputfiles qua |
| Browser | Host vẫn unavailable; chưa visual/native QA |
| GitHub/Sites | Runtime0237d3d đã push; appgdep_6af4304c31dc8191a03b96a40d687789 succeeded |

## Sửa URL ảnh trên hosting — shell v6

Live-check v5 đã qua cài shell/manifest nhưng dừng ở assets/signImage/S.G,7.png. Kiểm tra HTTPS xác nhận URL raw dấu phẩy trả307 sang S.G%2C7.png, URL encoded trả200 image/png. Có21 URL dấu phẩy trong manifest offline. Worker v6 chuẩn hóa từng segment pathname (decode rồi encodeURIComponent, giữ query), dùng cùng URL canonical để tải, match và put cache; chấp nhận cả URL src thô và đã mã hóa. Không nới chặn redirect/auth HTML. Bộ test mock cả redirect index.html và ảnh dấu phẩy, kiểm cache offline raw/encoded cùng ảnh. Dataset/ảnh/raw/offline revision không đổi.

## Hosting chính của người dùng — hoclaixe.thophuong.com

Người dùng xác nhận URL thực là https://hoclaixe.thophuong.com/, không phải Site private preview. Kiểm tra trực tiếp: / và /index.html đều200 HTML, ảnh comma raw/encoded đều200; các chuyển hướng được tìm thấy trước đó chỉ xảy ra ở Site preview. Lỗi thực của domain chính tái hiện bằng live-worker VM: Invalid shell response: manifest.webmanifest. Header thực là200 application/octet-stream, JSON hợp lệ.

V6 cho phép octet-stream riêng cho .webmanifest và bắt buộc parse JSON/kiểm id/start_url/icons trước cache; không áp ngoại lệ cho .json/module/ảnh và vẫn từ chối HTML giả loại. Unit regression kiểm trường hợp MIME MHS và HTML/octet-stream. Sau sửa, script đã chạy với tài nguyên HTTPS thật của domain: cài shell qua; tải633 URL; dark/light manifest đúng; fallback root và2ảnh mẫu khi mô phỏng offline qua;676request/17.755.587byte. Đây là worker local trong Node VM + cache mô phỏng, không phải browser Android. Chưa xác nhận server chính đã nhận mã v6; phải kiểm revision công khai sau triển khai.
