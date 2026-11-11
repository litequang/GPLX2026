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
