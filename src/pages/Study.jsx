import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ALL_IDS,
  CHAPTERS,
  CHAPTER_QUESTIONS,
  chapterById,
  chapterIcon,
  shuffle,
  titleCase,
} from '../lib/data.js'
import { useApp } from '../lib/store.jsx'
import { cx } from '../components/ui.jsx'
import BrowsableQuestions from '../components/BrowsableQuestions.jsx'
import DocList from '../components/DocList.jsx'

function ChapterTabs({ activeId, onPick }) {
  return (
    <div className="hs-scroll mb-1.5 flex gap-2 overflow-x-auto border-b border-border pb-3.5 pt-1">
      {CHAPTERS.map((ch) => (
        <button
          key={ch.id}
          type="button"
          onClick={() => onPick(ch.id)}
          className={cx(
            'flex-shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-3.5 py-2 text-[0.82rem] font-semibold cursor-pointer',
            ch.id === activeId
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-surface text-text-muted hover:border-border-strong'
          )}
        >
          <span className="mr-1.5">{chapterIcon(ch.id)}</span>
          {titleCase(ch.title)}
        </button>
      ))}
    </div>
  )
}

function StudyFull({ chapterId }) {
  const navigate = useNavigate()
  const chapter = chapterById(chapterId)
  const [order, setOrder] = useState(null)
  const [shuffleKey, setShuffleKey] = useState(0)

  // Reset any shuffle when switching chapters.
  useEffect(() => {
    setOrder(null)
    setShuffleKey(0)
  }, [chapterId])

  if (!chapter) return <Navigate to={`/study/${CHAPTERS[0].id}/0`} replace />

  const ids = order || CHAPTER_QUESTIONS[chapterId]

  return (
    <DocList
      key={`${chapterId}-${shuffleKey}`}
      ids={ids}
      backTo="/"
      pageTitle={chapter.title}
      pageIcon={chapterIcon(chapterId)}
      tabs={<ChapterTabs activeId={chapterId} onPick={(cid) => navigate(`/study/${cid}/0`)} />}
      onShuffle={() => {
        setOrder(shuffle(CHAPTER_QUESTIONS[chapterId]))
        setShuffleKey((k) => k + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    />
  )
}

export default function Study() {
  const { chapterId, index } = useParams()
  const navigate = useNavigate()
  const { mode } = useApp()

  if (mode === 'full') {
    if (chapterId === 'all') return <Navigate to={`/study/${CHAPTERS[0].id}/0`} replace />
    return <StudyFull chapterId={chapterId} />
  }

  const ids = chapterId === 'all' ? ALL_IDS : CHAPTER_QUESTIONS[chapterId] || []
  if (!ids.length) return <Navigate to="/" replace />

  const title = chapterId === 'all' ? 'Học tuần tự' : titleCase((chapterById(chapterId) || {}).title || '')

  return (
    <BrowsableQuestions
      ids={ids}
      index={parseInt(index, 10) || 0}
      title={chapterId === 'all' ? null : title}
      backTo="/"
      onIndexChange={(i) =>
        i === 'done' ? navigate('/') : navigate(`/study/${chapterId}/${i}`)
      }
    />
  )
}
