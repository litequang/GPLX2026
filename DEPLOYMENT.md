# Chạy và triển khai

Node≥22.13, `npm start` → http://localhost:4174, không cần npm install. Server127.0.0.1; không exposeLAN/firewall. Có PORT và PREVIEW_URL nếu thay cổng.

Production: staticHTTPS phục vụ nội dung dist, đúng MIMEJS/CSS/JSON/webmanifest/ảnh/WOFF2; hashrouter không cần rewrite. Scope/URL tương đối hỗ trợ subpath. Không cần Node/backend ở production. localStorage/CacheStorage riêng mỗi origin/browser; đổi origin phải export/import.

SitesID cốđịnh trong .openai/hosting.json: `appgprj_6af3da19926881918b14804d80550a09`, static.directory=dist. Không tạo Sitekhác hoặc dùng ID GPLXcũ. URLdựkiến: https://gplx2026-on-thi-quang.quartzcello4.chatgpt.site . Chỉ coi live sau deploysuccess, ghi kết quả ở TIMELINE.

Quy trình: checks → sourcehelper push đúngcommit/đónggói ngoài checkout → save/deployprivate → poll nonterminal → ghi SHA/URL → GitHubpush. Token chỉ memory/stdin, khôngfile/log/args. Giữ audience.

check:deploy scan cả fileignore, chặn raw/archive/secrets/symlink/file>25 MiB. Không bỏ ZIP/archive vào dist; archive ở ../.tools. APK/DB/native/keys/progress luôn ngoàiGit. Dataset/ảnh chuẩn hóa commit có chủý để web độc lập.

GitHuborigin: https://github.com/litequang/GPLX2026.git . Git/npm trong checkoutmới, kiểmtraremote, khôngforcepush. Sites source là đíchkhác, không được làm mất originGitHub.
