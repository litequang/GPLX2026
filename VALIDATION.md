# Kiểm chứng thực tế

11/11/2026, Asia/Saigon; Windows, Node v22.22.2.

| Kiểm tra đã chạy | Kết quả |
| --- | --- |
| Nguồn | 4 APK đã lấy, 2 SQLite giải mã integrity_check=ok, dùng texture25, đủ 600 giải thích |
| npm test | 41 nhóm pass, 0 fail; thêm MIME manifest của domain MHS + HTML giả loại |
| Data | 600 ID/option/topic/reference hợp lệ, 60 global critical |
| Pool/critical | A1/A: 250/20; B1: 300/30; B: 600/60; C1 trở lên: 600/60 |
| Random | 100 × 15 hạng = 1.500 bài, đúng số câu, không trùng, trong pool, một critical và đúng từng quota chủ đề CV2262 |
| Fixed | 233 bài đủ số câu, ID không trùng, reference hợp lệ; giữ ngoại lệ critical nguồn |
| Grade | Critical sai/bỏ trống không đạt dù đủ tổng điểm |
| Progress | Roundtrip, skipped=0, full history; import tính lại correct, lọc ID/option lỗi |
| Restore | Deadline cố định, lọc đáp án lỗi, clamp index, từ chối ID trùng/deadline sai |
| Storage/search | Lỗi/quota an toàn, không dấu, skipped/new, escape HTML, ngày Việt Nam |
| Manifest | Hash, 633 URL và byte sum đúng, mọi ảnh được phủ; PNG 192/512 |
| Worker Node VM | Shell/module/font/data subpath; marker sau đủ ảnh; lỗi/retry; HTML giả ảnh/module bị từ chối; không xóa cache GPLX trước |
| Scroll giả lập | Xuống ẩn, dừng giữ nguyên, lên hiện; sync baseline Next, clamp bounce, gộp rAF, focus/Tab |
| Install giả lập | Gọi prompt trước await, single-use/double-tap, dismiss/error/new offer, accepted/appinstalled/standalone ẩn nút |
| Theme giả lập | Mặc định/system/saved preference, toggle tức thì/meta/aria/storage, bootstrap trước DOM ready, storage lỗi, sync tab và giữ progress riêng |
| Palette | Một số cặp ink/muted/primary/success/error/warning và button được tính contrast ≥4,5; không thay visual/WCAG audit |
| Syntax | node --check app.js, sw.js, theme-init.js và các module/script đã sửa thành công |
| Output scan | 666 file, 29.582.584 byte, lớn nhất 790.894 byte, không file cấm, dưới 25 MiB/file |
| HTTP local | 675 URL gồm root + mọi file dist + app/CSS/theme/core/offline/data v6, 200/nonempty/MIME đúng; 30.520.544 byte |
| Comparison | 139 text/147 options, gộp 242; 0 answer-ID/global critical đổi; 600 giải thích khác |
| Triển khai | Sites private shell v6 succeeded, runtime2e06a607738cf070f577606d6a01fc7bb00008e7; GitHub main đã push. MHS domain chính chờ người dùng chép dist vào root, xem DEPLOYMENT |

## Chưa xác nhận

Công cụ browser tại nhiệm vụ này trả **browsers:[] / The browser access host is unavailable**. Phiên trước native Chrome bị từ chối vì không xác định current URL đủ tin cậy. Không dùng đường điều khiển khác để vượt giới hạn. **Chưa có browser end-to-end, screenshot hoặc visual QA**.

Chưa xác nhận responsive thật, DOM/dialog/focus/keyboard/screen reader, worker cài thật, offline/reload thật, Android PWA hoặc xác thực hosting private khi mất mạng. Worker tests chỉ Node VM; HTTP không chứng minh JavaScript chạy đúng trong DOM.

Đã đọc PDF chính thức: danh sách A1/A/B1 và 60 critical khớp, B đã sửa600/60; đủ600 answer ID khớp (598 tự trích +2 đọc ảnh), 13 câu sửa lựa chọn bằng đọc ảnh, quota CV2262 áp dụng trong bài ngẫu nhiên. Còn119 ứng viên khác chữ cần đọc ảnh, chưa rà toàn bộ hình/giải thích/mẹo/sa hình hoặc quyền tái phân phối. Không gọi toàn app là bộ chuẩn mới nhất; xem OFFICIAL_AUDIT.

## Checklist thủ công tiếp tục

1. npm start → localhost:4174: desktop1440/1280, tablet1000/760, mobile390/375; chữ/ảnh/nút và tràn ngang.
2. Câu1: chọn1sai → làm lại chọn2đúng; giải thích/bookmark/ôn sai/reload.
3. B600/60, scopeall600, A1/A250/20,B1300/30; tìm không dấu/topic/new.
4. Signs search/category/loadmore/modal; cẩm nang11 bài/2tab/linebreak/ảnh.
5. Timed chọn/đổi đápán/chuyểnroute/reload/đóngmở/timeout; nộp/xem lại/history sau reload. Thử fixed nhiều critical và nhãn nguồn.
6. Export/import originmới; correctrecompute, storageblocked/quota. Sao lưu trước xóa progress.
7. Tải đủ → ready → tắt mạng/server → reload/ảnh chưa xem/signs/handbook; lỗi/retry/xóaảnh vẫn còn progress.
8. Android install/standalone/safearea, privateauth hết hạn; workerupdate khi đang làm bài.
9. Tab/Enter/Space/1–4/arrows/Escape, focusreturn/screenreader/contrast/zoom200%.

Chỉ đánh dấu hoàn thành khi đã thực hiện và ghi bằng chứng.

## Ghi chú cập nhật shell v2

21 test gồm Node logic/EventTarget giả lập và worker VM, không xác nhận animation render hoặc Chrome Android native prompt. Đã kiểm tra lại browser inventory: host vẫn unavailable. Checklist màn hình/gesture/install/update còn thiếu ở UI_UPDATE.md.

Scan lần đầu phát hiện dist/index.zip 28.495.820 byte; giữ nguyên file bằng Move-Item sang ../.tools/gplx2026-index-preserved-20261111-scroll.zip. Lần scan và HTTP sau đã loại ZIP khỏi output; số liệu bảng trên là lần sau. Không sửa APK/database/raw hoặc ảnh gốc.

## Cập nhật shell v3

Đã kiểm tra lại browser inventory, vẫn The browser access host is unavailable. Không có ảnh/xác nhận giao diện tối hoặc màu thanh native trên POCO. 27 test là Node/EventTarget/VM, không phải browser. Cấu hình theme-color/manifest/canvas/safe-area đã đồng bộ nhưng OS/Chrome có thể áp màu riêng hoặc giữ metadata WebAPK/splash cũ. Manifest vẫn một URL/id ổn định; không yêu cầu người dùng gỡ app/xóa progress. Xem THEME.md để tiếp tục QA.

## Chặng shell v4 — 11/11/2026

- Bỏ sourceNote/link footer/sourceDialog và dòng nguồn trong chi tiết biển báo. Provenance giữ trong tài liệu và source-report.
- npm test36 nhóm qua; bài ngẫu nhiên1.500 lượt đã kiểm cả quota, không chỉ một critical. Hai nhóm official kiểm replay/idempotence/fail-closed và tiến độ có lựa chọn298 đã loại. Báo cáo PDF có hash và phạm vi riêng.
- Năm nhóm offline controller: chưa consent không tải lớn, confirm1post, resume/ready/clear, message đúngrevision/retry, storageblocked, chờ worker mới. Worker VM kiểm manifest network-first/offline/auth fallback và tài nguyênv4. Đây là mô phỏng Node, không chứng minh chạy nền Android thật.
- Theme resume kiểm body/meta/color-scheme sau pageshow/visible. Theo người dùng: status bar đã đúng; vùng native Back/Home/Recents còn xanh trong PWA mở bằng icon màn hình chính. Chưa xác nhận mã mới sửa được màu native trên thiết bị.
- Chưa có browser/visual/Android QA mới trong đợt này; hạn chế công cụ đã ghi phía trên vẫn còn.

Ảnh người dùng gửi sau cài lại xác nhận phần nền native dưới ở chế độ sáng đồng bộ, nhưng chế độ tối vẫn sáng. Ảnh đang dùng bộ lọcB592, không có icon offline; chưa xác nhận sau runtimev4. Đây là bằng chứng do người dùng cung cấp, không phải browser automation/QA do agent thực hiện.

11/11/2026: người dùng đã xác nhận bản mới v4; không còn coi web cũ là giả thuyết đủ để giải thích thanh Home dark. ADB vẫn không thấy thiết bị, chưa có version Chrome/Android hoặc QA native. Rà mã Chromium cho thấy nhánh manifest khác nhánh page-theme/edge-to-edge, xem THEME. Không có sửa runtime mới hoặc tuyên bố đã fix.

## Shell v5 — bằng chứng hosting và giới hạn

Đã kiểm tra HTTPS của Site private bằng service access đúng Site: /index.html307, /200; SW/JSON/CSS/JS/ảnh đúng loại, WOFF2 hosting application/octet-stream (worker cho phép). Các URL này được kiểm qua HTTP, không phải browser. Đây là nguyên nhân install v4 thất bại; local server không chuyển hướng nên HTTP local trước đây không bắt được. Worker test v5 tái hiện alias307 và dùng root chuẩn.

Browser inventory mới: browsers:[] / The browser access host is unavailable. Chưa có responsive visual, cài worker/browser thật, native Android Home hoặc đóng/mở/offline thật. Không coi 40 nhóm Node/VM hoặc script live-worker (nếu chạy) là bằng chứng native/PWA đã qua.

## Sửa URL ảnh trên hosting — shell v6

Live-check v5 đã qua cài shell/manifest nhưng dừng ở assets/signImage/S.G,7.png. Kiểm tra HTTPS xác nhận URL raw dấu phẩy trả307 sang S.G%2C7.png, URL encoded trả200 image/png. Có21 URL dấu phẩy trong manifest offline. Worker v6 chuẩn hóa từng segment pathname (decode rồi encodeURIComponent, giữ query), dùng cùng URL canonical để tải, match và put cache; chấp nhận cả URL src thô và đã mã hóa. Không nới chặn redirect/auth HTML. Bộ test mock cả redirect index.html và ảnh dấu phẩy, kiểm cache offline raw/encoded cùng ảnh. Dataset/ảnh/raw/offline revision không đổi.

## Hosting chính của người dùng — hoclaixe.thophuong.com

Người dùng xác nhận URL thực là https://hoclaixe.thophuong.com/, không phải Site private preview. Kiểm tra trực tiếp: / và /index.html đều200 HTML, ảnh comma raw/encoded đều200; các chuyển hướng được tìm thấy trước đó chỉ xảy ra ở Site preview. Lỗi thực của domain chính tái hiện bằng live-worker VM: Invalid shell response: manifest.webmanifest. Header thực là200 application/octet-stream, JSON hợp lệ.

V6 cho phép octet-stream riêng cho .webmanifest và bắt buộc parse JSON/kiểm id/start_url/icons trước cache; không áp ngoại lệ cho .json/module/ảnh và vẫn từ chối HTML giả loại. Unit regression kiểm trường hợp MIME MHS và HTML/octet-stream. Sau sửa, script đã chạy với tài nguyên HTTPS thật của domain: cài shell qua; tải633 URL; dark/light manifest đúng; fallback root và2ảnh mẫu khi mô phỏng offline qua;676request/17.755.587byte. Đây là worker local trong Node VM + cache mô phỏng, không phải browser Android. Chưa xác nhận server chính đã nhận mã v6; phải kiểm revision công khai sau triển khai.
