import { Link } from 'react-router-dom'
import {
  ALL_IDS,
  CHAPTERS,
  CHAPTER_QUESTIONS,
  TOTAL_QUESTIONS,
  chapterIcon,
  titleCase,
} from '../lib/data.js'
import { getHistory, getProgress } from '../lib/storage.js'
import { Card, Container, Pill, ProgressBar, SectionTitle } from '../components/ui.jsx'

function StatBox({ num, label }) {
  return (
    <div className="relative overflow-hidden rounded-[13px] border border-border bg-surface px-2 py-4 text-center shadow-soft-sm">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-primary-grad opacity-85" />
      <span className="block text-[1.5rem] font-extrabold tracking-[-0.02em] text-primary leading-none">
        {num}
      </span>
      <span className="text-[0.74rem] font-medium text-text-muted">{label}</span>
    </div>
  )
}

function ModeCard({ to, emoji, title, desc }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-[15px] rounded-card border border-border bg-surface p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-float"
    >
      <div className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-[14px] border border-border text-[1.7rem]" style={{ background: 'linear-gradient(135deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 60%, var(--surface)))' }}>
        {emoji}
      </div>
      <div className="min-w-0">
        <h3 className="m-0 mb-[3px] text-[1.05rem] font-bold">{title}</h3>
        <p className="m-0 text-[0.85rem] leading-snug text-text-muted">{desc}</p>
      </div>
      <div className="ml-auto text-[1.2rem] text-text-muted transition-[transform,color] duration-150 group-hover:translate-x-[3px] group-hover:text-primary">
        ›
      </div>
    </Link>
  )
}

export default function Home() {
  const progress = getProgress()
  const answeredIds = Object.keys(progress)
  const answeredCount = answeredIds.length

  let totalCorrect = 0
  let totalAttempts = 0
  answeredIds.forEach((id) => {
    totalCorrect += progress[id].correct
    totalAttempts += progress[id].correct + progress[id].wrong
  })
  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  const wrongCount = answeredIds.filter((id) => progress[id].lastResult === 'wrong').length

  const lastQuiz = getHistory()[0]

  return (
    <Container>
      <div className="pt-3.5 pb-1.5 text-center">
        <div
          className="mx-auto mb-3.5 h-[58px] w-[58px] rounded-[17px] bg-center bg-cover"
          style={{ backgroundImage: 'url(./favicon.svg)', boxShadow: '0 10px 26px -8px rgba(37,99,235,0.55)' }}
        />
        <h1 className="m-0 mb-1.5 text-[1.7rem] font-extrabold tracking-[-0.02em]">
          Ôn tập Hóa Sinh
        </h1>
        <p className="m-0 text-[0.95rem] text-text-muted">
          {TOTAL_QUESTIONS} câu hỏi trắc nghiệm · {CHAPTERS.length} chương
        </p>
      </div>

      <div className="mt-[22px] mb-1 grid grid-cols-3 gap-3">
        <StatBox num={`${answeredCount}/${TOTAL_QUESTIONS}`} label="Đã học" />
        <StatBox num={`${accuracy}%`} label="Độ chính xác" />
        <StatBox num={String(wrongCount)} label="Câu cần ôn" />
      </div>

      <SectionTitle>Chế độ</SectionTitle>
      <div className="grid gap-3">
        <ModeCard
          to="/quiz-setup"
          emoji="📝"
          title="Kiểm tra thử"
          desc="Làm bài trắc nghiệm có chấm điểm, chọn số câu và chương"
        />
        <ModeCard
          to="/study/all/0"
          emoji="📖"
          title="Học tuần tự"
          desc={`Học lần lượt toàn bộ ${TOTAL_QUESTIONS} câu, kèm giải thích & mẹo ghi nhớ`}
        />
        <ModeCard
          to="/review-wrong/0"
          emoji="🔁"
          title="Ôn tập câu sai"
          desc={
            wrongCount
              ? `Xem lại ${wrongCount} câu bạn đã từng trả lời sai`
              : 'Chưa có câu nào sai — cứ học rồi quay lại đây'
          }
        />
        <ModeCard
          to="/pdf"
          emoji="📕"
          title="Đọc giáo trình"
          desc="Xem trực tiếp file giáo trình Hóa Sinh (PDF) ngay trong web"
        />
      </div>

      {lastQuiz && (
        <>
          <SectionTitle>Lần kiểm tra gần nhất</SectionTitle>
          <Card className="flex items-center justify-between">
            <div>
              <strong>
                {lastQuiz.correct}/{lastQuiz.total}
              </strong>{' '}
              câu đúng <Pill>{lastQuiz.percent}%</Pill>
            </div>
            <div className="text-[0.82rem] text-text-muted">{lastQuiz.scope}</div>
          </Card>
        </>
      )}

      <SectionTitle>Học theo chương</SectionTitle>
      <div className="flex flex-col gap-2">
        {CHAPTERS.map((ch) => {
          const ids = CHAPTER_QUESTIONS[ch.id]
          const done = ids.filter((id) => progress[id]).length
          const pct = ids.length ? Math.round((done / ids.length) * 100) : 0
          return (
            <Link
              key={ch.id}
              to={`/study/${ch.id}/0`}
              className="flex items-center gap-3 rounded-[13px] border border-border bg-surface px-3.5 py-3 shadow-soft-sm transition-[transform,border-color,box-shadow] duration-150 hover:translate-x-[3px] hover:border-border-strong hover:shadow-soft"
            >
              <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px] border border-border text-[1.35rem]" style={{ background: 'linear-gradient(135deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 55%, var(--surface)))' }}>
                {chapterIcon(ch.id)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-[7px] text-[0.93rem] font-semibold">{titleCase(ch.title)}</div>
                <ProgressBar percent={pct} />
              </div>
              <div className="whitespace-nowrap text-[0.78rem] font-semibold text-text-muted">
                {done}/{ids.length}
              </div>
            </Link>
          )
        })}
      </div>
    </Container>
  )
}
