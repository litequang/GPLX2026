# Thiết kế

Shell v3 có sáng/tối một chạm, lưu lựa chọn và màu thanh hệ thống theo canvas; palette/quy tắc/giới hạn trong [THEME.md](THEME.md).

Cập nhật shell v2 về thanh trượt, màn học gọn và nút cài PWA: [UI_UPDATE.md](UI_UPDATE.md).

Không gian học cá nhân dành cho người lớn, tiếng Việt, ưu tiên câu hỏi dễ đọc và ít bước bắt đầu học/làm bài.

Tham khảo [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), commit6ae86f61f520d6ca229d2f40e070410638c908c5, clone ngoài checkout ở ../.tools/ui-ux-pro-max, không cài global. Kết quả design-system không khớp hoàn toàn app này; dùng UX tổng quát về nhãn/trạng thái/khoảng cách và typography Vietnamese Friendly cho Be Vietnam Pro. Không áp máy móc mẫu marketing/trẻ em. Giao diện được viết trực tiếp bằng HTML/CSS/JS.

| Thành phần | Quy tắc |
| --- | --- |
| Chính | #2457df, hover#1742bc, nền#eaf0ff |
| Nền/surface | #f5f7fc/trắng |
| Chữ chính/phụ | #19263e/#61708a |
| Đúng/sai/chú ý | #167748/#b4433c/#98640b, kèm chữ/icon |
| Font | Be Vietnam Pro400/500/600/700, fallback Segoe UI/sans-serif, self-host |
| Shape | Card18px, border/shadow nhẹ, Lucide nét thống nhất |
| Desktop | Sidebar240px, topbar, hero road SVG tự vẽ, goal ring, stats/chủ đề/ôn ưu tiên |
| Responsive | 1250/1000/760/370px; mobile bottom-nav5mục + menu dialog |
| Motion | 160ms trạng thái, prefers-reduced-motion |

Đáp án học hiện đúng/sai và giải thích; bài timed chưa lộ đáp án, được đổi trước nộp. Kết quả có đúng/sai/bỏ trống, mở chi tiết, full history sau reload. Snapshot danh sách tránh nhảy câu khi thao tác.

Mục tiêu nút chính ≥44CSSpx, số câu44px/5cột trên mobile; chưa audit mọi control. Nội dung học/đáp án mobile16px, metadata nhỏ hơn cần usability test. Có focus-visible, skip-link, label, aria-pressed/current/live; không chỉ dùng màu báo kết quả. Thông báo lỗi/retry, nhắc sao lưu và xác nhận khi xóa tiến độ.

35 Lucide icon và font phục vụ local, không CDN runtime, xem THIRD_PARTY. Không cần UI framework/backend. **Chưa visual QA/browser thực tế**, không gắn nhãn WCAG hay “chuẩn tuyệt đối”. Xem VALIDATION/ROADMAP.
