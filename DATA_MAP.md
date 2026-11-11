# Bản đồ dữ liệu

## Nguồn và giải mã

Package `com.daotaogplx.vn_driving_theory` v2.0.3/code10, ngày trích 11/11/2026. `source-report.json` lưu SHA-256 APK base, native, ciphertext và plaintext. 4 APK ở `../source-apk-2025`; 1.105 file trích ở `../extracted-2025`, giữ ngoài Git. Repo GPLX trước có package khác.

texture24.imeg và texture25.imeg đều giải mã SQLite thành công, integrity_check ok; web dùng **texture25**. Extractor lấy khóa 16 byte từ libapp.so offset419723, kiểm tra key SHA-256; IV derive từ block đầu và known SQLite header; AES-128-CBC/PKCS7. Không in/commit khóa plaintext. Đây là cipher parameter app đóng gói, không phải account token. ZANSWERDESC thêm base64 decode + AES CBC, UTF-8 strict; đủ 600 giải thích.

Nội dung chuyển markup sang plain text, Unicode NFC; UI escape trước HTML. Ảnh giữ nguyên byte và gộp SHA-256 duplicate.

## Mapping

| Nguồn | Đầu ra | Quy tắc |
| --- | --- | --- |
| ZQUESTION.Z_PK | questions.id | 1–600 duy nhất |
| ZQUESTIONCONTENT / ZOPTION1…4 | text / options[{id,text}] | Giữ ID option 1-based, bỏ option rỗng |
| ZCORRECT | answer | ID đúng, không trừ 1 |
| ZANSWERDESC | explanation | Base64 AES CBC, 600 có nội dung |
| ZDECO | memoryTip | Plain text, bỏ thẻ h/z |
| ZIMAGE | image | quImage600, không dùng quImage600_old |
| ZQUESTIONTYPE | category | 6 topic; 99 là critical aggregate, không topic thực |
| INGROUP_A1/A/B1/B | groups | Membership thô B592; overlay runtime B600 |
| ZQUESTIONDIE | critical.ALL | Chuỗi '1', toàn bộ 60 |
| DIGROUPA1 / DIGROUPB1 | critical.A1 / B1 | Cờ critical, không answer override; A dùng cờ A1 |
| SLICENCECLASS | licenses | 15 cấu hình count/pass/minutes/description |
| NETEST + NETESTQUEST | fixedExams | 233 bài / 8.880 links; thứ tự theo ZTESTQUESTID |
| TABLE_NOTICE_BOARD | signs | 352 hàng, lấy 332 isDelete=0 |
| TABLE_NOTICE_BOARD_TYPE | signCategories | 7 nhóm; UI lọc nhóm có active signs |
| ZTIPCATEGORY + ZTIP | theoryCategories/theoryTips | ZTIPTYPE=18: 6 nhóm, 56 mẹo |
| STIPCATEGORY + STIP | practicalLessons | 11 bài, 33 phần có TYPEID khớp, 10 ảnh |
| hintImage | hintImages | 8 ảnh, gồm tocdo_2019; có nhãn tham khảo có thể cũ |

## Hạng sau đối chiếu chính thức

| Hạng | Pool / critical | Câu/bài | Ngưỡng | Phút | Bài nguồn |
| --- | --- | ---: | ---: | ---: | ---: |
| A1 | 250 / 20 | 25 | 21 | 19 | 14 |
| A | 250 / 20 | 25 | 23 | 19 | 14 |
| B1 | 300 / 30 | 25 | 23 | 19 | 20 |
| B | 600 / 60 | 30 | 27 | 20 | 26 |
| C1 | 600 / 60 | 35 | 32 | 22 | 18 |
| C | 600 / 60 | 40 | 36 | 24 | 15 |
| D1,D2,D | 600 / 60 mỗi hạng | 45 | 41 | 26 | 14 mỗi hạng |
| BE,C1E,CE,D1E,D2E,DE | 600 / 60 mỗi hạng | 45 | 41 | 26 | 14 mỗi hạng |

Snapshot B loại ID 5,46,59,62,64,71,72,93; bốn ID cuối là critical. Overlay CV2262 đã phục hồi cả8 vào B600/60, không thêm question ID mới. A1/A/B1 và 60 critical khớp phụ lục. Xem OFFICIAL_AUDIT.md và content/official-2026.json.

6 chủ đề: quy định/quy tắc180, văn hóa/đạo đức/PCCC25, kỹ thuật58, cấu tạo/sửa chữa37, báo hiệu185, sa hình115.

Tất cả233 bài nguồn đủ count, unique IDs và references. Báo cáo thô có 207 bài nhiều critical, 2 bài không critical, 9 bài ngoài membership nguồn; fixedSummary giữ các số trước overlay. Giữ dưới nhãn bài ôn nguồn. Random lấy1 critical + non-critical theo topicQuotas của CV2262, không trùng; quy tắc/kỹ thuật/cấu tạo/biển báo/sa hình đúng phân bổ từng hạng. Sai/bỏ trống critical hoặc thiếu ngưỡng điểm đều không đạt. Không áp allocation di sản không tương thích topic mới.

## Di sản không xuất

- ZLICENSE, ZTEST/ZTESTQUEST (162 bài/5.372 links), ZSIGN327 không dùng thay bảng hiện hành.
- 20 biển isDelete bị loại khỏi active library, giữ trong DB gốc.
- ZTIP tổng68, chỉ56 thuộc6 nhóm lý thuyết; 12 mục khác không trộn vào.
- STIP tổng45, chỉ33 khớp11 STIPCATEGORY; 12 orphan giữ trong DB gốc.
- quImage600_old và file không được tham chiếu không tải. 318 câu có ảnh; gộp toàn bộ web còn632 ảnh duy nhất.

## Schema

dataset: schemaVersion, source, categories, licenses, questions, fixedExams, signCategories, signs, theoryCategories, theoryTips, practicalLessons, hintImages.

question: id,text,category,options,answer,explanation,memoryTip,image|null,groups[],critical{ALL,A1,B1}. license: id,name,count,pass,minutes,description,pool,criticalPool. fixedExam: id,number,license,questionIds[]. lesson: id,name,image|null,sections[{title,text}].

offline: revision=16 ký tự đầu SHA-256 dataset JSON, bytes=JSON+ảnh, urls=dataset+632ảnh. Không sửa JSON bằng tay; npm run update:official áp overlay idempotent và tính lại manifest. Extractor ghi source-report thô trước overlay rồi xuất runtime đã sửa. officialAudit ghi phạm vi/ngày, licenses thêm topicQuotas; schema progress vẫn v1.

13 câu vá lựa chọn: 65,121,141,216,298,417,419,420,421,422,423,467,592. Câu298 bỏ lựa chọn4 sai thừa; tiến độ đọc lại sẽ lọc lựa chọn không hợp lệ, giữ bookmark. Không đổi answer ID/giải thích/hình.

progress v1: license,answers{id:{selected,correct,at,attempts}},bookmarks[],history[],lastQuestion. selected0 là bỏ trống. record history: id,license,title,kind,ids[],answers{},startedAt,finishedAt; tối đa30. Import tính lại correct, lọc ID/option lỗi.

active exam v1: id,license,title,kind,ids[],answers{},index,startedAt,deadline. LocalStorage riêng; reload giữ deadline tuyệt đối, không reset thời gian. Không commit tiến độ hoặc khóa/cipher input.
