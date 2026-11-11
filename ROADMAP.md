# Việc tiếp theo

## P0

- [ ] Người dùng upload nội dung dist v6 vào root MHS cho hoclaixe.thophuong.com; kiểm tra domain trả worker v6, rồi QA icon ngoại tuyến và manifest/native dark trên Android. Gói ZIP đã kiểm đủ666 file và hash; Site private v6 succeeded không thay thế bước MHS.

- [ ] QA shell v3 trên Android thật: theme một chạm/reload/offline, header nhỏ khi có Cài app, trạng thái đúng/sai/dialog, safe-area và màu thanh native trong tab/PWA, system light/dark, gesture/3-button và splash; xem THEME.md.

- [ ] Browser/visualQA desktop/mobile theo VALIDATION, hiện host unavailable.
- [ ] Kiểm thử browser chọn đápán/filter/bookmark/signs/handbook/import/export.
- [ ] Timed bài thật: reload/đóngmở/timeout/history chi tiết.
- [ ] Worker/offline/PWA thật:633 URL, ảnh chưa xem, lỗi/retry/update, Android install.
- [ ] Private hosting xác thực hết hạn và mất mạng.
- [ ] QA shell v2: cuộn xuống/dừng/lên, bounce và focus; mobile320/375/390 có nút Cài app; lọc/đáp án/Next; Android native install/dismiss/reinstall, xem UI_UPDATE.md.
- [ ] Đọc ảnh từng trang cho 119 ứng viên khác chữ trong official-audit-report; không tự động coi là 119 lỗi. Rà lại ảnh/giải thích/mẹo/sa hình, quyền dữ liệu và cấu trúc áp dụng từ 01/03/2027. Membership/critical/600 answer ID/quota CV2262 đã kiểm, B600/60 đã sửa.
- [ ] Xác nhận quyền tái phân phối trước phát hành dữ liệu/ảnh công khai rộng rãi.

## P1

- [ ] Accessibility/usability/zoom200%: focus, screenreader, contrast, metadata và vùngbấm.
- [ ] Thông báo shellmới/chọn cập nhật khi không làm bài; hiện không auto-reload.
- [ ] Multi-tab storage event/lock: hiện state mỗi tab có thể ghi đè nhau.
- [ ] Migration/import từ GPLX cũ sau đối chiếu schema, hiện key riêng không tự nhập.
- [ ] Chia tải ảnh theo hạng, giữ nguyên ảnh/hash/revision.
- [ ] Học theo lịch nếu cần, migration/export/import tương ứng.
- [ ] Tách app.js khi phạm vi lớn hơn, cập nhật map/coretests.

## P2, cần yêu cầu riêng

- [ ] Backend/account/sync nhiều thiết bị; hiện static/local.
- [ ] Video mô phỏng/nội dung không có nguồn, cần nguồn/quyền.
- [ ] Public domain/GitHubPages; giữ audience hiện tại.

- [ ] QA shell v4: icon tải/consent/background/resume/quota, header320/375/390, màu native Back/Home/Recents khi đổi theme và đóng/mở PWA, manifest WebAPK cập nhật. Chưa có Android/browser thật.

## Đã làm

- [x] Shell v4: bỏ 3 mục nguồn khỏi UI; overlay chính thức B600/60, quota và 13 lựa chọn; icon offline tải nền/nhớ consent/resume; đồng bộ body/meta và manifest network-first. 36 nhóm test + 674 HTTP URL qua.

- [x] Shell v3: sáng/tối một chạm, bootstrap trước CSS, theme preference riêng, canvas/meta/manifest/safe-area đồng bộ; 27 nhóm test qua, chưa visual/native bar QA.

- [x] APKmới/giải mã/data/provenance/so sánh bộtrước.
- [x] UI15hạng/học/filter/wrong/saved/signs/fixed+random/timer+restore/fullhistory/handbook.
- [x] Manifest/icon/localfont/workerrevision/offline/retry/clearcache riêng.
- [x] 15testgroups/1.500random/662HTTP/outputscan.
- [x] Map/data/design/validation/AGENTS/handoffdocs.
- [x] Shell v2: auto-hide không idle timer, màn học gọn, native install header mobile/standalone; 21 nhóm test, chưa browser thật.

## Thanh Home Android — cần dữ liệu thiết bị

- [ ] Người dùng xác nhận đang ở v4. Lấy version Chrome/Android, kiểm tra meta thực tế và edge-to-edge trên thiết bị. Không kết luận cập nhật lại web sẽ tự hết. Chưa có bản vá web bổ sung đáng tin; xem kết quả rà Chromium trong THEME.md.
- [ ] Nếu yêu cầu điều khiển native ổn định trên thiết bị không theo meta: thống nhất phương án Android wrapper/bridge theme trước khi xây dựng; PWA không có API đặt màu Window native trực tiếp.

## Đợt v5

- [x] Loại index.html redirect307 khỏi SHELL, dùng root canonical, retry worker + thông báo đúng lỗi.
- [x] Manifest qua worker theo lựa chọn light/dark với URL/id ổn định, ack và cache preference riêng; chưa xác nhận màu native.
- [x] Thu nhỏ heading/mô tả chào trên mobile, bỏ badge cạnh heading ở dưới760px; chưa visual QA.
- [ ] QA PC/Android tải đủ rồi reload offline trên hosting private; đăng nhập lại có thể cần mạng.
- [ ] Kiểm tra Chrome đọc manifest dark sau chọn tối/cài lại/cập nhật, và đổi về light; không hứa đổi native ngay.
