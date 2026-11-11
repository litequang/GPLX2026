# Kiểm chứng thực tế

11/11/2026, Asia/Saigon; Windows, Node v22.22.2.

| Kiểm tra đã chạy | Kết quả |
| --- | --- |
| Nguồn | 4 APK đã lấy, 2 SQLite giải mã integrity_check=ok, dùng texture25, đủ 600 giải thích |
| npm test | 15 nhóm pass, 0 fail |
| Data | 600 ID/option/topic/reference hợp lệ, 60 global critical |
| Pool/critical | A1/A: 250/20; B1: 300/30; B: 592/56; C1 trở lên: 600/60 |
| Random | 100 × 15 hạng = 1.500 bài, đúng số câu, không trùng, trong pool, một critical |
| Fixed | 233 bài đủ số câu, ID không trùng, reference hợp lệ; giữ ngoại lệ critical nguồn |
| Grade | Critical sai/bỏ trống không đạt dù đủ tổng điểm |
| Progress | Roundtrip, skipped=0, full history; import tính lại correct, lọc ID/option lỗi |
| Restore | Deadline cố định, lọc đáp án lỗi, clamp index, từ chối ID trùng/deadline sai |
| Storage/search | Lỗi/quota an toàn, không dấu, skipped/new, escape HTML, ngày Việt Nam |
| Manifest | Hash, 633 URL và byte sum đúng, mọi ảnh được phủ; PNG 192/512 |
| Worker Node VM | Shell/module/font/data subpath; marker sau đủ ảnh; lỗi/retry; HTML giả ảnh/module bị từ chối; không xóa cache GPLX trước |
| Syntax | node --check app.js, sw.js thành công |
| Output scan | 661 file, 29.548.304 byte, lớn nhất 787.889 byte, không file cấm, dưới 25 MiB/file |
| HTTP | 662 URL gồm root + mọi file dist, tất cả 200, không rỗng, MIME ảnh/module/font đúng; 29.551.320 byte ≈ 28,2 MiB |
| Comparison | 139 text/147 options, gộp 242; 0 answer-ID/global critical đổi; 600 giải thích khác |
| Triển khai | Sites private succeeded, runtime commit 033d63e; GitHub main push thành công, xem DEPLOYMENT |

## Chưa xác nhận

Công cụ browser tại nhiệm vụ này trả **browsers:[] / The browser access host is unavailable**. Phiên trước native Chrome bị từ chối vì không xác định current URL đủ tin cậy. Không dùng đường điều khiển khác để vượt giới hạn. **Chưa có browser end-to-end, screenshot hoặc visual QA**.

Chưa xác nhận responsive thật, DOM/dialog/focus/keyboard/screen reader, worker cài thật, offline/reload thật, Android PWA hoặc xác thực hosting private khi mất mạng. Worker tests chỉ Node VM; HTTP không chứng minh JavaScript chạy đúng trong DOM.

Chưa đối chiếu chính thức nội dung/đáp án/pool/critical/quota hoặc xác nhận quyền tái phân phối. Không gọi snapshot là bộ chuẩn 2026.

## Checklist thủ công tiếp tục

1. npm start → localhost:4174: desktop1440/1280, tablet1000/760, mobile390/375; chữ/ảnh/nút và tràn ngang.
2. Câu1: chọn1sai → làm lại chọn2đúng; giải thích/bookmark/ôn sai/reload.
3. B592/56, scopeall600, A1/A250/20,B1300/30; tìm không dấu/topic/new.
4. Signs search/category/loadmore/modal; cẩm nang11 bài/2tab/linebreak/ảnh.
5. Timed chọn/đổi đápán/chuyểnroute/reload/đóngmở/timeout; nộp/xem lại/history sau reload. Thử fixed nhiều critical và nhãn nguồn.
6. Export/import originmới; correctrecompute, storageblocked/quota. Sao lưu trước xóa progress.
7. Tải đủ → ready → tắt mạng/server → reload/ảnh chưa xem/signs/handbook; lỗi/retry/xóaảnh vẫn còn progress.
8. Android install/standalone/safearea, privateauth hết hạn; workerupdate khi đang làm bài.
9. Tab/Enter/Space/1–4/arrows/Escape, focusreturn/screenreader/contrast/zoom200%.

Chỉ đánh dấu hoàn thành khi đã thực hiện và ghi bằng chứng.
