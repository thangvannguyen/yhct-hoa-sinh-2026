import { useEffect, useState } from 'react'
import { QUESTION_INDEX, isGraded, titleCase } from '../lib/data.js'
import { recordAnswer } from '../lib/storage.js'
import { useApp } from '../lib/store.jsx'
import { BackLink, Button, Card, Container, ProgressBar } from './ui.jsx'
import {
  ChapterTag,
  ExplanationReveal,
  NoteBox,
  QuestionImage,
  SimpleOption,
  UNVERIFIED_NOTE,
} from './Question.jsx'

/**
 * One-question-at-a-time study/review view (the "simple" display mode).
 * Answers are graded immediately and the explanation/tip is revealed.
 */
export default function BrowsableQuestions({ ids, index, title, backTo, onIndexChange }) {
  const { autoExplain } = useApp()
  const clamped = Math.min(Math.max(index, 0), ids.length - 1)
  const qid = ids[clamped]
  const { question: q, chapterTitle } = QUESTION_INDEX[qid]
  const graded = isGraded(q)

  const [picked, setPicked] = useState(null)

  // Reset the revealed answer whenever we move to a different question.
  useEffect(() => {
    setPicked(null)
  }, [qid])

  const answered = picked !== null
  const revealExplanation = answered || !graded

  function choose(i) {
    if (answered || !graded) return
    setPicked(i)
    recordAnswer(qid, i === q.correctIndex)
  }

  function optionState(i) {
    if (!answered) return 'idle'
    if (i === q.correctIndex) return 'correct'
    if (i === picked) return 'incorrect'
    return 'idle'
  }

  const isLast = clamped === ids.length - 1

  return (
    <Container>
      <BackLink to={backTo} />

      <div className="mb-4 flex items-center gap-3">
        <ProgressBar percent={Math.round(((clamped + 1) / ids.length) * 100)} className="flex-1" />
        <div className="whitespace-nowrap text-[0.85rem] font-bold text-text-muted">
          {clamped + 1}/{ids.length}
        </div>
      </div>

      <Card className="mb-[18px] px-[22px] py-[22px]">
        <ChapterTag>{title ? title : titleCase(chapterTitle)}</ChapterTag>
        <div className="mb-4 text-[1.05rem] font-semibold leading-relaxed">{q.text}</div>
        <QuestionImage image={q.image} />

        {!graded && <NoteBox>{UNVERIFIED_NOTE}</NoteBox>}

        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <SimpleOption
              key={i}
              index={i}
              option={opt}
              state={optionState(i)}
              disabled={answered || !graded}
              onClick={() => choose(i)}
            />
          ))}
        </div>

        {revealExplanation && <ExplanationReveal question={q} autoShow={autoExplain} />}
      </Card>

      <div className="mt-[18px] flex gap-2.5">
        <Button
          className="flex-1"
          disabled={clamped === 0}
          onClick={() => onIndexChange(clamped - 1)}
        >
          ← Câu trước
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => (isLast ? onIndexChange('done') : onIndexChange(clamped + 1))}
        >
          {isLast ? 'Hoàn thành' : 'Câu sau →'}
        </Button>
      </div>
    </Container>
  )
}
