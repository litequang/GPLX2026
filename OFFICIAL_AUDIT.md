# Đối chiếu nguồn chính thức — 11/11/2026

Phạm vi: kiểm tra danh sách theo hạng, điểm liệt, đáp án đánh số, phân bổ chủ đề và một số cách viết trong bộ 600 câu. Không xác nhận toàn bộ mẹo/giải thích/sa hình/ảnh là quy định mới nhất. Chưa tìm thấy bộ câu hỏi thay thế mới hơn trên các nguồn chính thức đã kiểm tra; không suy ra rằng không thể có cập nhật ở nguồn khác.

## Tài liệu và kết quả

1. [Danh mục văn bản Cục CSGT](https://csgt.bocongan.gov.vn/index.php/van-ban) đang cung cấp Công văn 2262/CSGT-P5 ngày 07/05/2025 và bộ 600 câu. Ngày hiển thị của mục bộ câu hỏi là 05/05/2026; đây không tự chứng minh nội dung là một ngân hàng câu hỏi mới.
2. [Hướng dẫn trên Cổng Chính phủ](https://xaydungchinhsach.chinhphu.vn/huong-dan-su-dung-bo-600-cau-hoi-dung-de-sat-hach-lai-xe-co-gioi-duong-bo-119250513110514585.htm) và PDF gốc Công văn 2262: B trở lên dùng 600 câu/60 điểm liệt; A1/A dùng 250/20; B1 dùng 300/30. Phụ lục A1, B1 và toàn bộ 60 ID điểm liệt khớp snapshot.
3. PDF bộ 600 câu (188 trang) tải từ csgtmedia.bocongan.gov.vn: so sánh đủ 600 ID và đáp án. 598 đáp án lấy từ hình học gạch chân; câu 204 (trang PDF 47) và 302 (trang 71) kiểm tra hình trực tiếp vì đường gạch/đáp án hai cột làm bộ đọc tự động không đáng tin. Cả 600 số đáp án khớp snapshot, không đổi answer ID.
4. [Thông tư 108/2026/TT-BCA trên Cổng Bộ Công an](https://vanban.bocongan.gov.vn/co-so-du-lieu-van-ban/thong-tu-quy-dinh-ve-sat-hach-cap-giay-phep-lai-xe-cap-su-dung-giay-phep-lai-xe-quoc-te-1784191590?tab=attributes): bản ký 38 trang dạng scan. Đọc hình trang 1, 36–38: ban hành 29/06/2026; Điều 41 khoản 1 có hiệu lực từ 01/07/2026 nhưng khoản 2 quy định nội dung sát hạch mới áp dụng từ 01/03/2027. Khoản 6 giữ các phần liên quan của Thông tư 12/2025 đến hết 28/02/2027. Chưa chuyển ứng dụng sang cấu trúc tương lai.

Link tải PDF, SHA-256 và bản vá cụ thể nằm trong `content/official-2026.json`. Báo cáo máy ở `official-audit-report.json`. Bản gốc PDF/ZIP và PNG đọc văn bản nằm ngoài Git tại `../.tools/official-audit-20261111`; tuyệt đối không xem các file HTML tải nhầm là PDF hợp lệ. Không vô hiệu hóa kiểm tra TLS.

## Thay đổi đã áp dụng

- Khôi phục membership B cho ID 5,46,59,62,64,71,72,93. Đây là câu đã có trong kho 600, không phải thêm câu mới. B tăng từ 592/56 của cờ Android lên 600/60 theo hướng dẫn chính thức. Bốn câu điểm liệt được phục hồi vào bộ lọc B là 64,71,72,93.
- Tạo bài ngẫu nhiên theo quota dưới đây, ngoài ra đúng một câu điểm liệt; mọi quota lấy từ các câu không điểm liệt để tránh tính hai lần.
- Đọc trực tiếp 10 trang PDF rồi cập nhật lựa chọn trả lời của 13 câu: 65,121,141,216,298,417,419,420,421,422,423,467,592. Các trang PDF tương ứng: 17,28,33,51,69,108,109,110,125,184. Câu 298 bỏ lựa chọn 4 thừa, trả lựa chọn 3 về “Cầm máu cho người bị nạn”; đáp án đúng vẫn là 2. Câu 592 lựa chọn 3 là “Cả 2 xe đều đúng.” thay vì “sai”. Câu 141 chỉ sửa lựa chọn 1, không chép thiếu chữ “giấy” trong lựa chọn 2 của PDF.
- Không đổi nội dung câu hỏi, answer ID, explanation, memoryTip, hình ảnh hoặc thứ tự NETEST. Vì câu 298 bỏ một lựa chọn sai thừa, import/readProgress bỏ selected=4 ở câu này; bookmark và các đáp án hợp lệ khác giữ nguyên, history chuẩn hóa lựa chọn lỗi về 0.

| Hạng | Quy tắc | Văn hóa | Kỹ thuật | Cấu tạo | Biển báo | Sa hình | Điểm liệt |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A1/A/B1 | 8 | 1 | 1 chung kỹ thuật/cấu tạo | — | 8 | 6 | 1 |
| B | 8 | 1 | 1 | 1 | 9 | 9 | 1 |
| C1 | 10 | 1 | 2 | 1 | 10 | 10 | 1 |
| C | 10 | 1 | 2 | 1 | 14 | 11 | 1 |
| D1/D2/D và hạng kéo rơ moóc | 10 | 1 | 2 | 1 | 16 | 14 | 1 |

## Tái hiện và công việc tiếp theo

`npm run update:official` áp bản vá idempotent lên dataset hiện có rồi xuất lại hash/bytes offline. `npm run extract` tạo `source-report.json` **trước** bản vá, rồi áp overlay và ghi dataset/manifest. Vì vậy source-report tiếp tục ghi B592 và các ngoại lệ fixed gốc; đây là bằng chứng nguồn, không phải số đang hiển thị trong app. Overlay từ chối snapshot/membership/critical hoặc lựa chọn khác điều đã kiểm tra, thay vì ghi đè im lặng.

Chạy đọc PDF: `python scripts/audit-official.py ../.tools/official-audit-20261111` với PyMuPDF. Python dùng ở máy này: `../.tools/gplx-pdf-env/Scripts/python.exe`. Script chỉ đọc, kiểm tra hash trước so sánh, in JSON; không chứa APK/key. Không đưa các đường dẫn máy cá nhân vào runtime.

Bộ so sánh văn bản còn 119 ID ứng viên sau bản vá. Đây là tập hỗn hợp: khác câu chữ, chính tả, chữ trong hình, tiêu đề chương lẫn vào text và các đáp án in hai cột. **Không coi 119 là số câu sai hoặc câu mới. Không tự động chép text trích PDF.** AI tiếp theo đọc từng trang ảnh, xác nhận từng trường và thêm before/after vào overlay. Chưa kiểm tra độc lập mọi hình minh họa, giải thích, mẹo hoặc sa hình với quy định hiện hành. Không đổi thuật toán hoặc dữ liệu vì một trang tổng hợp không chính thức nói có cập nhật.

Trước 01/03/2027 cần rà lại ngân hàng câu hỏi, cách chấm/điểm liệt, số câu, thời gian, ngưỡng và cấu trúc đề theo tài liệu chính thức áp dụng khi đó. `structureValidThrough` là mốc tài liệu bàn giao, chưa phải cơ chế tự chuyển cấu trúc theo đồng hồ.
