import { useParams } from 'react-router-dom'
import { BackLink, Button, Container } from '../components/ui.jsx'
import { LECTURES, lectureById, lectureUrl } from '../lib/lectures.js'

function PdfList() {
  return (
    <Container>
      <BackLink to="/" />
      <h1 className="mb-1 text-[1.25rem] font-extrabold">📕 Giáo trình Hóa Sinh</h1>
      <p className="mb-4 text-[0.85rem] text-text-muted">
        Chọn một chương để xem trực tiếp file PDF ngay trong web
      </p>
      <div className="flex flex-col gap-2">
        {LECTURES.map((lec) => (
          <Button
            key={lec.id}
            to={`/pdf/${lec.id}`}
            className="!justify-start gap-[15px] px-3.5 py-3 text-left"
          >
            <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px] border border-border text-[1.35rem]" style={{ background: 'linear-gradient(135deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 55%, var(--surface)))' }}>
              {lec.icon}
            </span>
            <span className="min-w-0 flex-1 text-[0.95rem] font-semibold">{lec.title}</span>
            <span className="text-[1.1rem] text-text-muted">›</span>
          </Button>
        ))}
      </div>
    </Container>
  )
}

function PdfViewer({ lecture }) {
  const url = lectureUrl(lecture)
  return (
    <Container wide>
      <BackLink to="/pdf" />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.25rem] font-extrabold">
          {lecture.icon} {lecture.title}
        </h1>
        <div className="flex gap-2">
          <Button as="a" href={url} target="_blank" rel="noopener" className="px-3.5 py-2 text-[0.85rem]">
            ↗ Mở tab mới
          </Button>
          <Button
            as="a"
            href={url}
            download={lecture.file}
            variant="primary"
            className="px-3.5 py-2 text-[0.85rem]"
          >
            ⬇ Tải xuống
          </Button>
        </div>
      </div>

      <div className="h-[calc(100dvh-170px)] min-h-[420px] overflow-hidden rounded-card border border-border bg-surface shadow-soft">
        <object data={`${url}#view=FitH`} type="application/pdf" className="h-full w-full">
          <iframe src={`${url}#view=FitH`} title={lecture.title} className="h-full w-full border-0">
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

export default function Pdf() {
  const { lectureId } = useParams()
  const lecture = lectureId ? lectureById(lectureId) : null

  if (lectureId && !lecture) {
    return (
      <Container>
        <BackLink to="/pdf" />
        <p className="text-center text-text-muted">Không tìm thấy giáo trình này.</p>
      </Container>
    )
  }

  return lecture ? <PdfViewer lecture={lecture} /> : <PdfList />
}
