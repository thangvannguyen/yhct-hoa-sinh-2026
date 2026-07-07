// Persistence layer. Keys are kept identical to the previous vanilla-JS app so
// existing users keep their progress and history after the refactor.
export const PROGRESS_KEY = 'hs_progress_v1'
export const HISTORY_KEY = 'hs_quiz_history_v1'
export const THEME_KEY = 'hs_theme_v1'
export const MODE_KEY = 'hs_view_mode_v1'
export const EXPLAIN_KEY = 'hs_auto_explain_v1'

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

// ---- progress: qid -> { correct, wrong, lastResult } -----------------------
export function getProgress() {
  return readJSON(PROGRESS_KEY, {})
}

export function recordAnswer(qid, isCorrect) {
  const p = getProgress()
  const entry = p[qid] || { correct: 0, wrong: 0 }
  if (isCorrect) entry.correct++
  else entry.wrong++
  entry.lastResult = isCorrect ? 'correct' : 'wrong'
  p[qid] = entry
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  return p
}

// ---- quiz history (most recent first, capped) ------------------------------
export function getHistory() {
  return readJSON(HISTORY_KEY, [])
}

export function pushHistory(entry) {
  let h = getHistory()
  h.unshift(entry)
  if (h.length > 30) h = h.slice(0, 30)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
}

// ---- theme -----------------------------------------------------------------
export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}
export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}

// ---- view mode: 'simple' | 'full' ------------------------------------------
export function getStoredMode() {
  try {
    return localStorage.getItem(MODE_KEY) || 'simple'
  } catch {
    return 'simple'
  }
}
export function setStoredMode(mode) {
  localStorage.setItem(MODE_KEY, mode)
}

// ---- auto-show explanation + tip after answering (default: on) --------------
export function getStoredAutoExplain() {
  try {
    const v = localStorage.getItem(EXPLAIN_KEY)
    return v === null ? true : v === '1'
  } catch {
    return true
  }
}
export function setStoredAutoExplain(on) {
  localStorage.setItem(EXPLAIN_KEY, on ? '1' : '0')
}
