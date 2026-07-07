import { BackLink, Button, Container } from '../components/ui.jsx'

// Served from public/ (copied to the build root). BASE_URL keeps it relative so
// it resolves under a GitHub Pages subpath and on hash routes alike.
const PDF_URL = import.meta.env.BASE_URL + 'hoasinh.pdf'

export default function Pdf() {
  return (
    <Container wide>
      <BackLink to="/" />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.25rem] font-extrabold">📕 Giáo trình Hóa Sinh</h1>
        <div className="flex gap-2">
          <Button as="a" href={PDF_URL} target="_blank" rel="noopener" className="px-3.5 py-2 text-[0.85rem]">
            ↗ Mở tab mới
          </Button>
          <Button
            as="a"
            href={PDF_URL}
            download="hoasinh.pdf"
            variant="primary"
            className="px-3.5 py-2 text-[0.85rem]"
          >
            ⬇ Tải xuống
          </Button>
        </div>
      </div>

      <div className="h-[calc(100dvh-170px)] min-h-[420px] overflow-hidden rounded-card border border-border bg-surface shadow-soft">
        <object data={`${PDF_URL}#view=FitH`} type="application/pdf" className="h-full w-full">
          <iframe src={`${PDF_URL}#view=FitH`} title="Giáo trình Hóa Sinh" className="h-full w-full border-0">
            <div className="p-6 text-center text-text-muted">
              Trình duyệt của bạn không hiển thị được PDF trực tiếp.
            </div>
          </iframe>
        </object>
      </div>

      <p className="mt-3 text-center text-[0.8rem] text-text-muted">
        Không xem được trên điện thoại? Bấm <strong>Mở tab mới</strong> hoặc{' '}
        <strong>Tải xuống</strong> ở trên.
      </p>
    </Container>
  )
}
