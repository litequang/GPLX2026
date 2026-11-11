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

## Sửa vùng điều hướng hệ điều hành — shell v4

Người dùng xác nhận thanh trạng thái trên đã đúng màu, vùng Back/Home/Recents dưới vẫn xanh. Phần này thuộc cửa sổ Chrome/WebAPK, khác bottom-nav của app. Chưa có bằng chứng thiết bị để khẳng định nguyên nhân; màu metadata WebAPK cũ là một khả năng. Giữ nguyên manifest URL/id; đổi worker fetch manifest sang network-first/no-cache, kiểm MIME và fallback khi offline/auth. Không gắn query đổi vị trí manifest vì Chrome khuyến cáo giữ URL để PWA đã cài còn cập nhật được.

Theme-init đồng bộ html và body backgroundColor, colorScheme cùng meta color-scheme/theme-color khi boot, DOM ready, đổi theme, pageshow và trở lại visible. themes.css phủ canvas tối thiểu100dvh; phần dưới dùng max-safe-area + bottom offset theo hướng dẫn Chrome để nền app kéo vào vùng gesture. CSS chỉ tô vùng web được cấp, không gọi được Android Window.setNavigationBarColor cho vùng native ba nút.

Chrome có các lỗi/khác biệt theo phiên bản về native navbar, tham khảo Chromium issue40759522 và554055703; chưa biết phiên bản Chrome/Android hiện tại của thiết bị. Theo https://web.dev/articles/manifest-updates, WebAPK cài trước đó có chu kỳ cập nhật manifest riêng; đóng/mở PWA online chưa bảo đảm cập nhật ngay. Không hứa sửa hoàn toàn vùng native khi chưa thử trên máy thật, không yêu cầu xóa dữ liệu học hay cài lại.

Bằng chứng người dùng bổ sung: ảnh sáng/tối PWA mở từ màn hình chính sau cài lại cho thấy gesture/Home bar đã hết xanh, nhưng vẫn trắng ở dark. Trong ảnh còn B592 và chưa có icon tải nên đây là trạng thái trước runtime v4, chưa kiểm chứng phần body/meta/resume/manifest network-first mới. Không thay manifest bằng các trường navigationColor của TWA hoặc theme_colors thử nghiệm khi chưa được hỗ trợ; cấu hình Android native/TWA không phải API của website PWA hiện tại.

## Kết quả rà soát thanh Home sau v4 — 11/11/2026

Người dùng xác nhận đang ở bản mới có icon tải/B600; không tiếp tục quy vấn đề cho web cũ. Chưa có phiên bản Chrome/Android hoặc kết nối ADB (adb devices rỗng); chưa có kiểm thử DOM/native trực tiếp của agent. Vùng native dark chưa được xác nhận đã khắc phục.

Đã đọc nguồn Chromium: commit 0a6ab4f0e2ce17e572b05400ae6eacd7fc5389f0 (06/08/2026, CL8077818) đưa màu manifest vào native navigation bar của Webapp/WebAPK. Trong BaseCustomTabActivity main, màu trang động được truyền cho controller ở nhánh drawEdgeToEdge; nhánh thường dùng ColorProvider của intent/manifest. Điều kiện/feature rollout phụ thuộc bản Chrome và thiết bị; code main không chứng minh thiết bị có hỗ trợ. Nguồn: https://chromium.googlesource.com/chromium/src/+/0a6ab4f0e2ce17e572b05400ae6eacd7fc5389f0%5E%21/ và https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/android/java/src/org/chromium/chrome/browser/customtabs/BaseCustomTabActivity.java .

V4 đã có viewport-fit=cover, html/body background + color-scheme, meta đổi theo lựa chọn, lifecycle reapply, manifest network-first. Không có API web chuẩn gọi Android Window.setNavigationBarColor hay ép Chrome bật feature edge-to-edge. Không đổi manifest sang tối cố định (sẽ lệch light), không đổi display sang fullscreen chỉ để che thanh, không tạo manifest Blob/thay URL hoặc thêm thuộc tính TWA không được PWA hỗ trợ. Chưa có bản vá runtime thêm với bằng chứng đáng tin; không commit thay đổi CSS giả làm đã fix.

Hướng tiếp tục: lấy version Chrome/Android và tái hiện trên thiết bị cùng bản v4; kiểm tra bản Chrome hỗ trợ/đã cập nhật và nhánh edge-to-edge. Nếu cần điều khiển chủ động trên thiết bị không theo meta, cân nhắc Android wrapper có bridge theme và xử lý edge-to-edge/native background; đây là thay đổi kiến trúc/cách cài, chưa được yêu cầu xây dựng và chưa triển khai. Xem hướng dẫn Android: https://developer.android.com/develop/ui/views/layout/edge-to-edge .

## Thử cơ chế manifest như đổi xanh → sáng — shell v5

Theo yêu cầu mới của người dùng, đã bổ sung manifest theo preference qua service worker, thay vì chỉ đổi meta. Static manifest vẫn light làm fallback. Khi trang được worker v5 điều khiển, theme-init gửi set-theme bằng MessageChannel, đợi worker lưu __theme vào gplx2026-settings-v1 rồi thay node link để manifest được đọc lại; URL/id/name/start_url/scope/icons không đổi. Worker trả hai màu #0b1220 khi dark, #f5f7fc khi light; response no-store, template mạng và cache vẫn kiểm JSON/identity/MIME. Chỉ nhận message client cùng origin/scope. Giữ preference qua worker restart, không xóa cùng ảnh offline.

Đây là lớp bổ sung cho việc cài/cập nhật metadata, không phải API điều khiển native: WebAPK đã cài có lịch cập nhật riêng, cài bằng cơ chế bỏ qua service worker vẫn có thể nhận fallback sáng. Chưa xác nhận native Home đổi màu trên Android thật; không khẳng định bấm theme là thanh hệ thống đổi ngay. Chọn theme mong muốn sau khi worker sẵn sàng rồi Chrome mới đọc manifest/cài app. Không yêu cầu gỡ app làm mất tiến độ; sao lưu nếu người dùng tự cài lại.

40 nhóm test tổng: thêm ack/current-sequence/worker change/error, manifest dark/light cùng identity, preference sau restart/offline và từ chối client ngoài scope. Kiểm tra này là Node/EventTarget/VM; browser inventory vẫn unavailable trong đợt v5.
