# Giao diện sáng/tối và màu thanh hệ thống — shell v3

Ngày 11/11/2026, Asia/Saigon.

## Hành vi

Header có nút icon mặt trăng/mặt trời, bấm đổi ngay giữa light/dark, không có menu chọn. Icon hiển thị hành động tiếp theo: mặt trăng để bật tối, mặt trời để bật sáng. Có title, aria-label và aria-pressed cập nhật theo trạng thái, dùng được bằng bàn phím. SVG là hình học trong HTML; fade/rotate tuân theo prefers-reduced-motion hiện có.

Lần đầu theo prefers-color-scheme của thiết bị. Lựa chọn thủ công lưu ở `gplx2026-theme-v1` với giá trị light/dark và ưu tiên hơn hệ thống. Không sửa dữ liệu học, schema progress hoặc đáp án. Các tab cùng origin đồng bộ theme qua storage event; khi chưa chọn thủ công, đổi theme hệ thống được áp dụng. Storage bị chặn vẫn đổi được trong phiên hiện tại.

Tham khảo HTML công khai của https://www.sivn.app/: nút moon với nhãn “Chuyển sang giao diện tối”, và bootstrap đọc lựa chọn trước khi render, fallback theo hệ thống. Không điều khiển/thử tương tác trực tiếp website tham chiếu; không sao chép bộ CSS, nội dung hay thương hiệu của site.

## File và luồng

1. `dist/theme-init.js?v=3` là script classic chạy trong head trước CSS. Đọc preference an toàn, đặt html[data-theme], root background và color-scheme, cập nhật meta theme-color/Apple status style trước khi nội dung vẽ. Không phụ thuộc dataset hoặc app.js.
2. `dist/themes.css?v=3` tải sau styles.css: light dùng palette cũ; dark thay token và các trạng thái card/control/đúng/sai/chọn/điểm liệt/kết quả/cẩm nang/dialog. Không invert/filter ảnh nguồn; hình biển báo/sơ đồ có nền trắng để giữ khả năng đọc.
3. DOMContentLoaded gắn đúng một click handler vào #theme-toggle. Click cập nhật ngay root/meta/label và lưu preference, không rerender màn câu hỏi hoặc reset vị trí/tiến độ.
4. Script và CSS được precache trong sw.js shell-v3, cả URL thường và ?v=3; HTML và app/CSS dùng version mới để thoát cache shell cũ ở lượt mở online. HTTP check đồng bộ URL versioned.

| Thành phần | Sáng | Tối |
| --- | --- | --- |
| Canvas / theme-color runtime | #f5f7fc | #0b1220 |
| Surface | #fff | #131e30 |
| Chữ chính | #19263e | #e7edf7 |
| Chữ phụ | #61708a | #a0aec4 |
| Link/accent | #2457df | #91b0ff |
| Action button / chữ | #2457df / trắng | #315acc / trắng |

## Mép ngoài và giới hạn nền tảng

Manifest mặc định đổi theme_color từ xanh sang #f5f7fc, trùng background_color/canvas sáng. Meta theme-color được đổi theo lựa chọn ngay khi chạy. html/body, header, bottom-nav và lớp safe-area trên/dưới dùng cùng var(--bg), kể cả khi bars trượt ẩn. Native input dùng color-scheme phù hợp. Manifest URL/id/start_url giữ ổn định, không tạo PWA thứ hai khi đổi theme.

Manifest static không lưu tùy chọn của từng người: splash/khung trước khi JavaScript chạy dùng màu sáng mặc định. Android/Chrome/iOS quyết định cách áp dụng theme-color và có thể lưu metadata WebAPK cũ hoặc áp màu hệ thống. Không thể điều khiển tuyệt đối màu thanh điều hướng native trên mọi phiên bản bằng CSS. Script chống flash cho phần trang sau khi tải, không bảo đảm thay được splash của OS trước đó. Không yêu cầu gỡ/cài lại hoặc xóa dữ liệu học.

Tài liệu nền tảng: [MDN — app colors](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Customize_your_app_colors), [Chrome — edge-to-edge](https://developer.chrome.com/docs/css-ui/edge-to-edge).

## Bằng chứng và việc còn lại

27 nhóm test qua: 6 nhóm theme mới kiểm tra mặc định/ghi nhớ/toggle tức thì/meta/label/progress độc lập/khởi tạo sớm/storage lỗi/system và multi-tab. Một số cặp màu semantic của hai palette và button đạt contrast tính toán ≥4,5; không coi đây là chứng nhận accessibility/WCAG toàn app. Worker VM kiểm tra theme-init và theme CSS versioned vẫn phục vụ khi offline.

Browser inventory vẫn unavailable; chưa có screenshot, visual QA hoặc xác nhận màu thanh native trên POCO/Android thật. Cần thử sáng/tối trong tab và PWA, system light/dark, reload/offline, đổi theme khi đang làm bài/đang ẩn bars, phone 320/375/390 khi nút Cài app hiện, dialog và từng trạng thái đúng/sai; kiểm tra safe-area/gesture/3-button navigation, đóng mở PWA và splash.
