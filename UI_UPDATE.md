# Header, màn học và cài PWA — shell v2

Ngày 11/11/2026, Asia/Saigon. Dữ liệu câu hỏi/tiến độ giữ schema và snapshot hiện tại.

## Bản đồ hành vi

`modules/chrome.js`: setupAutoHideBars gắn window scroll passive và gộp bằng requestAnimationFrame. createScrollTracker tích lũy 8px theo hướng để tránh rung; ẩn sau vùng đầu 64px, hiện khi cuộn lên hoặc sát đầu trang. Không idle timer/scrollend tự hiện khi dừng. Clamp scrollY vào khoảng hợp lệ để tránh rubber-band đổi hướng giả. CSS body.bars-hidden trượt header lên/bottom-nav xuống trong 240ms, không đổi document height. Bar ẩn có inert/aria-hidden; Tab/focus hoặc điều hướng mới hiện lại; input/select header đang focus không bị giấu. ResizeObserver đo --topbar-height.

`app.js`: renderStudy dùng main[data-view=study], tiêu đề ngắn và details#study-filters mặc định đóng. state.filtersOpen giữ qua render, toggle capture bỏ qua node tháo khỏi DOM. Search/topic/scope/new vẫn có đủ trong details. renderActiveExam dùng heading gọn với đồng hồ. questionCard đặt Trước/Tiếp ngay sau options, trước status/giải thích; retry ở explanation-heading. jumpQuestion focus card và scroll theo offset header hiện/ẩn rồi sync baseline, không quay về đầu vùng lọc.

`modules/install.js`: setupInstall khởi tạo trước fetch data, nút Cài app mobile/desktop chỉ hiện khi Chrome cấp beforeinstallprompt. Click gọi prompt() trước await để giữ user activation. Event dùng một lần; nút ẩn lúc chờ và sau accepted/appinstalled, kể cả cài từ menu browser. Standalone/minimal-ui/fullscreen/window-controls-overlay hoặc navigator.standalone đều ẩn nút. Không lưu cờ đã cài vĩnh viễn vì có thể gỡ app. Không thể buộc browser phát event khi chưa đủ điều kiện. Settings dùng cùng installer, không thêm dialog trung gian trước native prompt.

HTML manifest dùng crossorigin=use-credentials vì Site riêng tư. URL app/CSS ?v=2 tránh bị cache v1 trả bản cũ ở lần mở online; worker v2 precache cả URL versioned và module mới. Khi đổi version lần sau cập nhật APP_REVISION, HTML, SHELL và HTTP check cùng nhau. Không auto-reload làm gián đoạn bài đang làm.

## Thiết kế

Header desktop 66px, mobile tối thiểu60px + safe-area. Transition transform 240ms cubic-bezier(.22,.68,.22,1); prefers-reduced-motion bỏ transition. Màn học giảm padding đầu/card/meta, bỏ marketing heading nhiều dòng; giữ đáp án mobile16px. Header cài đặt/bộ lọc không chiếm nhiều dòng khi đang học. Trước/Tiếp ở trên phần giải thích dài, trạng thái đúng/sai vẫn hiện bên dưới.

Nguồn API: [Chrome/web.dev](https://web.dev/articles/customize-install), manifest cần credentials theo [MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest). Browser quyết định khả năng cài và giao diện xác nhận, chưa kiểm chứng trên Android thật.

## Kiểm chứng và bước tiếp tục

21 nhóm test qua, gồm 6 nhóm mới về scroll/idle/đổi hướng, baseline điều hướng, clamp/coalesce/focus, prompt synchronous/single-use, dismiss/error/new offer và installed/standalone. Worker Node VM kiểm tra module mới và app/CSS có query khi offline. Đây là hợp đồng giả lập, không phải visual/browser QA.

Browser inventory vẫn báo The browser access host is unavailable. Cần QA thật: mobile320/375/390 và desktop; xuống → đứng yên → lên, bounce, menu/select/focus; header không tràn khi Cài app hiện; mở/đóng lọc/tìm/new; chọn đáp án rồi Next trước giải thích dài; Android install/dismiss/reinstall và update từ worker v1. Xem VALIDATION/ROADMAP.
