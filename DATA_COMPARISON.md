# So sánh GPLX trước đó

So theo question ID, chuẩn NFC và gộp khoảng trắng, giữ dấu câu. comparison-report.json có hash hai JSON và danh sách ID khác. Tái tạo:

```sh
node scripts/compare-data.mjs ../gplx-pwa/dist/data/dataset.json
```

| Tiêu chí | Kết quả |
| --- | --- |
| Tổng câu | 600 ở cả hai |
| Text câu hỏi khác | 139 |
| Bộ text lựa chọn khác | 147 |
| Gộp text/options/answer khác, không trùng | 242 ID |
| ID đáp án đúng đổi | 0 |
| Global critical đổi | 0, cùng60 |
| Text giải thích khác | 600 |
| Cấu hình hạng trên web | 10→15, E cũ tách BE/C1E/CE/D1E/D2E/DE |
| Nội dung thêm trong web | 233 bài nguồn, 56 mẹo, 11 bài sa hình/33 phần |

139 và147 có giao nhau; 242 không có nghĩa242 câu hoàn toàn mới, gồm cả dấu ngoặc/dấu câu/diễn đạt. “Đáp án không đổi” là **ID lựa chọn đúng**, trong khi chữ lựa chọn có thể khác. Chưa kiểm tra mọi thay đổi ảnh hoặc độ chính xác ngữ nghĩa.

Câu1: nguồn cũ hỏi đường dùng cho “các phương tiện giao thông qua lại”; mới dùng “phương tiện giao thông đường bộ đi lại”. Giải thích cũ phân tích lựa chọn và mẹo; mới dẫn Khoản5 Điều2 Luật Trật tự an toàn giao thông đường bộ2024. Đây là mô tả app nguồn, chưa xác minh độc lập điều khoản.

Không kết luận mọi thay đổi là nâng cấp độ chính xác, hoặc tên2025/2026 bảo đảm dữ liệu mới nhất. Pool/critical theo hạng có khác cách lọc trước; xem DATA_MAP. Cần nguồn chính thức trước khi tuyên bố đề chuẩn hiện hành.
