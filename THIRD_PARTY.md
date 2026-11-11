# Nguồn bên thứ ba

| Thành phần | Nguồn | Phạm vi |
| --- | --- | --- |
| 35 Lucide SVG | https://github.com/lucide-icons/lucide commit03eae6069edfc373673bd05d723491f05ba936e3 | Giữ nguyên licenses/lucide-LICENSE.txt |
| Be Vietnam Pro | Google Fonts, 12 WOFF2/4 weight tải 11/11/2026 | SIL OFL trong dist/fonts/OFL.txt |
| UI UX Pro Max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill commit6ae86f61f520d6ca229d2f40e070410638c908c5 | Công cụ tham khảo ngoài checkout, không runtime |
| Nội dung/ảnh Android | com.daotaogplx.vn_driving_theory v2.0.3 | Chưa xác nhận giấy phép mở/quyền tái phân phối, không áp MIT/OFL/Lucide license |
| Logo/hero road | SVG/hình học tự tạo | Không lấy logo/giao diện app Android |

scripts/vendor-ui.mjs tái tải từ nguồn chính thức. Lucide pin commit; Google Fonts CSS/URL có thể thay đổi khi chạy lại, phải kiểm tra diff/tăng revision. Bản commit hoạt động không CDN, không có quảng cáo/analytics SDK/token Android.
