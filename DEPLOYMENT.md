# Bản đang chạy — shell v5

Native Sites tool trả succeeded ngày 11/11/2026, giữ audience riêng tư.

- Web: https://gplx2026-on-thi-quang.quartzcello4.chatgpt.site
- Runtime commit: `0237d3d26909c0d2659d07e14ef1a0969419cb2c`, đã push source Site và GitHub main.
- Deployment: `appgdep_6af4304c31dc8191a03b96a40d687789`.
- Saved version: `appgprj_6af3da19926881918b14804d80550a09~appgver_1afdcd1e49d88191b99702bffb8d13ba`.
- Archive: ../.tools/gplx2026-offline-manifest-v5-site.tar.gz, đúng runtime SHA, ngoài Git/dist.
- Sửa precache root thay index.html307, retry worker/thông báo, manifest theo theme qua worker và heading mobile nhỏ.
- 40 nhóm Node/VM, 675 HTTP local; kiểm tra live-worker có ghi riêng ở VALIDATION. Không xác nhận Android/browser/native QA.

## Lịch sử v4

# Bản đang chạy — shell v4

Ngày 11/11/2026, native Sites tool trả status succeeded. Web riêng tư: https://gplx2026-on-thi-quang.quartzcello4.chatgpt.site

- Runtime commit: `a7c30f1a5db001966b36ec3e2c2586ad818a9e8c`, đã push GitHub main và source repository của Site.
- Deployment: `appgdep_6af428bdbeb88191af22f0fb237ceedb`.
- Saved version: `appgprj_6af3da19926881918b14804d80550a09~appgver_75c0105ba35c819192575af12a54ae76`.
- Archive: ../.tools/gplx2026-official-v4-site.tar.gz, đóng gói đúng runtime commit; không nằm trong Git/dist.
- B600/60, quota CV2262, vá13 lựa chọn; icon offline tải nền/consent/resume; bỏ3 mục nguồn trong UI; manifest network-first, theme resume/canvas. 36 nhóm test và674 URL HTTP qua.
- User gửi ảnh bản còn B592: sau cài lại nền gesture/Home bar sáng đã đồng bộ, chuyển tối vẫn trắng. Đây là bằng chứng người dùng của phiên trước runtime v4, không xác nhận v4 hết lỗi native. Chưa có browser/device QA cho v4, ADB hiện không có thiết bị.
- Commit tài liệu sau runtime không thay dist/hosting; không cần publish lại chỉ vì ghi biên bản.

## Lịch sử triển khai trước

# Chạy và triển khai

## Bản hiện tại — shell v3, sáng/tối, 11/11/2026

Đã triển khai riêng tư thành công: https://gplx2026-on-thi-quang.quartzcello4.chatgpt.site

- Runtime commit: `bc75d3b5e28b2404e8cd318b42a774e3ad68b73d`, đã push GitHub main.
- Deployment: `appgdep_6af4219bb3c88191b2e5b8f4da18e42a`, succeeded.
- Saved version: `appgprj_6af3da19926881918b14804d80550a09~appgver_59e276623afc8191a64c5e2aa45f8fe3`.
- Archive: ../.tools/gplx2026-theme-v3-site.tar.gz; shell-v3 precache cả theme bootstrap/CSS.
- 27 nhóm test và 670 URL HTTP qua. Chưa visual/Android native bar QA; giới hạn manifest/splash/OS được ghi rõ trong THEME.md.
- Commit tài liệu sau runtime không thay đổi dist hoặc dữ liệu học.

## Lịch sử shell v2, 11/11/2026

Đã triển khai riêng tư thành công: https://gplx2026-on-thi-quang.quartzcello4.chatgpt.site

- Runtime commit: `a444871b18643b6fa02115859a0e890262c7329b` (GitHub main đã push).
- Deployment: `appgdep_6af41d3b864c8191b7374d4f29df35d7`, status succeeded.
- Saved version: `appgprj_6af3da19926881918b14804d80550a09~appgver_27eeda97d9a48191902af65b95e66a8b`.
- Shell gplx2026-shell-v2, app/CSS ?v=2; 21 test groups và 666 HTTP URL qua. UI/Android thật chưa xác nhận, xem VALIDATION/UI_UPDATE.
- Archive ngoài checkout: ../.tools/gplx2026-scroll-v2-site.tar.gz. ZIP phát hiện trong dist được giữ riêng ngoài output; không đóng gói/commit.

Commit tiếp theo chỉ ghi tài liệu triển khai, không đổi dist hoặc snapshot dữ liệu. Các ID/commit bên dưới là lịch sử bản đầu.

## Hướng dẫn và lịch sử bản đầu

Node≥22.13, `npm start` → http://localhost:4174, không cần npm install. Server127.0.0.1; không exposeLAN/firewall. Có PORT và PREVIEW_URL nếu thay cổng.

Production: staticHTTPS phục vụ nội dung dist, đúng MIMEJS/CSS/JSON/webmanifest/ảnh/WOFF2; hashrouter không cần rewrite. Scope/URL tương đối hỗ trợ subpath. Không cần Node/backend ở production. localStorage/CacheStorage riêng mỗi origin/browser; đổi origin phải export/import.

Site ID cố định trong .openai/hosting.json: `appgprj_6af3da19926881918b14804d80550a09`, static.directory=dist. Không tạo Site khác hoặc dùng ID GPLX cũ.

Đã triển khai thành công, audience riêng tư: https://gplx2026-on-thi-quang.quartzcello4.chatgpt.site

Runtime commit: `033d63e824e28429d40757b25f97e1851569ba41`.
Deployment ID: `appgdep_6af3e45383a4819190f1d7189e0d6c8b`.
Saved version ID: `appgprj_6af3da19926881918b14804d80550a09~appgver_c4d92a45cca08191869cb7db3b2e39e0`.
Trạng thái native tool: succeeded ngày 11/11/2026. Deployment success không thay thế browser QA. Commit tài liệu sau runtime không cần triển khai lại nếu dist/hosting không đổi.

Quy trình: checks → sourcehelper push đúngcommit/đónggói ngoài checkout → save/deployprivate → poll nonterminal → ghi SHA/URL → GitHubpush. Token chỉ memory/stdin, khôngfile/log/args. Giữ audience.

check:deploy scan cả fileignore, chặn raw/archive/secrets/symlink/file>25 MiB. Không bỏ ZIP/archive vào dist; archive ở ../.tools. APK/DB/native/keys/progress luôn ngoàiGit. Dataset/ảnh chuẩn hóa commit có chủý để web độc lập.

GitHuborigin: https://github.com/litequang/GPLX2026.git . Git/npm trong checkoutmới, kiểmtraremote, khôngforcepush. Sites source là đíchkhác, không được làm mất originGitHub.
