# Ôn tập Hóa Sinh 07-2026

Web ôn tập trắc nghiệm Hóa Sinh — **698 câu hỏi, 14 chương** (trích từ giáo trình
`hoasinh.pdf`, kèm giải thích & mẹo ghi nhớ cho từng câu). Xây bằng **React + Vite +
TailwindCSS**.

## Tính năng
- **Kiểm tra thử** — làm bài có chấm điểm, chọn chương & số câu, xáo trộn câu và đáp án
- **Học tuần tự** — học theo chương, có nút *Trộn câu hỏi* để tránh học vẹt theo thứ tự
- **Ôn tập câu sai** — tự gom lại các câu từng trả lời sai
- **Đọc giáo trình** — xem trực tiếp file `hoasinh.pdf` ngay trong web
- **Giải thích + mẹo ghi nhớ** cho từng câu — có nút 💡 trên thanh trên để bật/tắt:
  bật thì tự hiện sau khi trả lời, tắt thì ẩn hoàn toàn
- 2 chế độ hiển thị: **Đơn giản** (thẻ từng câu) và **Đầy đủ** (dạng đề giấy)
- Giao diện sáng/tối, responsive cho điện thoại, lưu tiến trình bằng `localStorage`

## Phát triển tại máy
```bash
npm install
npm run dev       # server dev tại http://localhost:5173
```

## Build & xem thử bản production
```bash
npm run build     # xuất ra thư mục dist/
npm run preview   # xem thử bản đã build
```

## Deploy
Đã cấu hình **GitHub Actions** (`.github/workflows/deploy.yml`): mỗi lần push lên
nhánh `main` sẽ tự build và deploy lên GitHub Pages.

> Lần đầu: vào **Settings → Pages → Build and deployment → Source** của repo, chọn
> **GitHub Actions**. Từ đó về sau chỉ cần `git push` là site tự cập nhật.

## Cấu trúc
- `src/` — mã nguồn React
  - `src/lib/` — dữ liệu, `localStorage`, context (theme / chế độ / phiên thi)
  - `src/components/` — thành phần dùng chung (Layout, câu hỏi, navigator…)
  - `src/pages/` — các trang (Home, Study, ReviewWrong, QuizSetup/Play/Result)
- `data/questions.json` — bộ câu hỏi (trích từ `hoasinh.pdf`)
- `public/hoasinh.pdf` — file giáo trình (dùng cho chế độ *Đọc giáo trình*)
- `public/images/` — hình minh họa cho các câu cần xem công thức/cấu trúc
- `data/review_needed.md` — nhật ký các câu chưa chốt được đáp án chắc chắn
