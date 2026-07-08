import { imageSrc, letterFor, optionLabel } from '../lib/data.js'
import { cx } from './ui.jsx'

export function ChapterTag({ children }) {
  return (
    <div className="text-[0.76rem] font-bold uppercase tracking-[0.02em] text-primary mb-2.5">
      {children}
    </div>
  )
}

export function NoteBox({ children }) {
  return (
    <div className="mb-3.5 rounded-[13px] border border-warning bg-warning-soft px-3.5 py-3 text-[0.85rem] text-warning">
      {children}
    </div>
  )
}

export const UNVERIFIED_NOTE = (
  <>
    ⚠️ Đáp án của câu này chưa được xác nhận trong tài liệu gốc — xem{' '}
    <code>data/review_needed.md</code>.
  </>
)

/**
 * A single option in the card ("simple") layout. `state` drives the colours:
 * 'idle' | 'selected' | 'correct' | 'incorrect'.
 */
export function SimpleOption({ index, option, state = 'idle', disabled, onClick }) {
  const box = {
    idle: 'border-border bg-surface hover:border-primary hover:bg-primary-soft',
    selected: 'border-primary bg-primary-soft',
    correct: 'border-success bg-success-soft',
    incorrect: 'border-danger bg-danger-soft',
  }[state]
  const letter = {
    idle: 'border-border bg-bg text-text-muted',
    selected: 'border-primary bg-surface text-primary',
    correct: 'border-success bg-success text-white',
    incorrect: 'border-danger bg-danger text-white',
  }[state]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'flex items-start gap-3 text-left w-full px-[15px] py-[13px] rounded-[13px] border-[1.5px] text-[0.95rem] leading-normal text-text transition-[border-color,background] duration-100 cursor-pointer disabled:cursor-default',
        box
      )}
    >
      <span
        className={cx(
          'flex-shrink-0 w-[26px] h-[26px] mt-[1px] rounded-full border-[1.5px] flex items-center justify-center text-[0.78rem] font-bold',
          letter
        )}
      >
        {letterFor(index)}
      </span>
      <span className="pt-0.5">{optionLabel(option)}</span>
    </button>
  )
}

/**
 * A single option in the document ("full") layout — a compact text line.
 */
export function DocOption({ index, option, state = 'idle', disabled, onClick }) {
  const cls = {
    idle: 'text-text hover:bg-primary-soft',
    selected: 'bg-primary-soft text-primary-dark font-bold',
    correct: 'text-success font-bold',
    incorrect: 'text-danger line-through',
  }[state]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'flex gap-1.5 text-left w-full text-[1rem] leading-relaxed px-[7px] py-1 -mx-[7px] rounded-md border-0 bg-transparent cursor-pointer disabled:cursor-default font-[inherit]',
        cls
      )}
    >
      <span className="font-bold flex-shrink-0">{letterFor(index)}.</span>
      <span>{optionLabel(option)}</span>
    </button>
  )
}

/**
 * Explanation + memory-tip panel, shown after an answer is revealed.
 * Data may carry either, both, or neither field.
 */
export function Explanation({ question, className }) {
  const explain = question.explain && String(question.explain).trim()
  const tip = question.tip && String(question.tip).trim()
  if (!explain && !tip) return null
  return (
    <ExplanationBody explain={explain} tip={tip} image={question.image} className={className} />
  )
}

function ExplanationBody({ explain, tip, image, className }) {
  if (!explain && !tip) return null
  const imgSrc = imageSrc(image)
  return (
    <div className={cx('animate-fade-up mt-3.5 flex flex-col gap-2.5', className)}>
      {explain && (
        <div className="rounded-[13px] border border-border bg-surface-2 px-4 py-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.03em] text-primary">
            <span>💡</span> Giải thích
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <p className="m-0 flex-1 whitespace-pre-line text-[0.9rem] leading-relaxed text-text">
              {explain}
            </p>
            {imgSrc && (
              <img
                src={imgSrc}
                alt="hình minh họa giải thích"
                className="max-w-full rounded-[9px] sm:w-[220px] sm:flex-shrink-0 max-h-[50dvh]"
              />
            )}
          </div>
        </div>
      )}
      {tip && (
        <div className="rounded-[13px] border border-warning bg-warning-soft px-4 py-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.03em] text-warning">
            <span>🧠</span> Mẹo ghi nhớ
          </div>
          <p className="m-0 whitespace-pre-line text-[0.9rem] leading-relaxed text-text">
            {tip}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Explanation gated by the "auto-show" setting. When the setting is on it
 * reveals the explanation + tip; when off it renders nothing at all.
 */
export function ExplanationReveal({ question, autoShow = true, className }) {
  if (!autoShow) return null
  return <Explanation question={question} className={className} />
}
