# Ôn tập Hóa Sinh 07-2026

Web ôn tập trắc nghiệm Hóa Sinh — 332 câu hỏi, 13 chương. Toàn bộ là HTML/CSS/JS tĩnh, không cần server.

## Tính năng
- **Kiểm tra thử** — làm bài có chấm điểm, chọn chương & số câu, xáo trộn câu và đáp án
- **Học tuần tự** — học theo chương, có nút *Trộn câu hỏi* để tránh học vẹt theo thứ tự
- **Ôn tập câu sai** — tự gom lại các câu từng trả lời sai
- 2 chế độ hiển thị: **Đơn giản** (thẻ từng câu) và **Đầy đủ** (dạng đề giấy)
- Giao diện sáng/tối, lưu tiến trình bằng `localStorage`

## Chạy tại máy
Mở thẳng `index.html` bằng trình duyệt, hoặc:
```bash
python3 -m http.server 8000
# rồi mở http://localhost:8000
```

## Cấu trúc
- `index.html`, `css/`, `js/` — giao diện & logic
- `data/questions.js` — bộ câu hỏi web dùng (sinh từ `questions.json`)
- `data/parse_docx.py` — script trích câu hỏi từ `docs.docx`
- `data/review_needed.md` — nhật ký các câu đã xử lý đáp án thủ công
