import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { cx } from './ui.jsx'

function ModeToggle() {
  const { mode, setMode } = useApp()
  const opts = [
    { id: 'simple', label: 'Đơn giản' },
    { id: 'full', label: 'Đầy đủ' },
  ]
  return (
    <div
      role="tablist"
      aria-label="Chế độ hiển thị"
      className="flex gap-0.5 rounded-[11px] border border-border bg-bg p-[3px]"
    >
      {opts.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={mode === o.id}
          onClick={() => setMode(o.id)}
          className={cx(
            'rounded-lg px-3 py-[7px] text-[0.8rem] font-semibold transition-colors cursor-pointer',
            mode === o.id
              ? 'bg-surface text-primary shadow-soft-sm'
              : 'text-text-muted hover:text-text'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function ExplainToggle() {
  const { autoExplain, toggleAutoExplain } = useApp()
  return (
    <button
      onClick={toggleAutoExplain}
      aria-pressed={autoExplain}
      title={
        autoExplain
          ? 'Đang tự hiện giải thích & mẹo sau khi trả lời — bấm để tắt'
          : 'Không tự hiện giải thích — bấm để bật (khi tắt vẫn có nút xem thủ công)'
      }
      aria-label="Bật/tắt tự hiện giải thích"
      className={cx(
        'flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border text-base transition-colors cursor-pointer',
        autoExplain
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-border bg-surface text-text-muted opacity-60 hover:opacity-100 hover:bg-primary-soft'
      )}
    >
      💡
    </button>
  )
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useApp()
  return (
    <button
      onClick={toggleTheme}
      title="Đổi giao diện sáng/tối"
      aria-label="Đổi giao diện"
      className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-border bg-surface text-base transition-colors hover:bg-primary-soft hover:border-border-strong cursor-pointer"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

function ScrollTopButton() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.pageYOffset > 320)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      className={cx(
        'fixed right-5 bottom-5 z-30 flex h-[46px] w-[46px] items-center justify-center rounded-full border-0 bg-primary-grad text-white shadow-primary cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-95 max-[470px]:right-3.5 max-[470px]:bottom-3.5',
        show ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-3.5 scale-90'
      )}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V6M6 12l6-6 6 6" />
      </svg>
    </button>
  )
}

export default function Layout() {
  const { pathname } = useLocation()

  // Scroll to top on route change so a new page never starts mid-scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-5 py-[13px] backdrop-blur-md backdrop-saturate-150 max-[470px]:px-3.5 max-[470px]:py-2.5" style={{ background: 'color-mix(in srgb, var(--surface) 78%, transparent)' }}>
        <Link to="/" className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap font-extrabold text-[1.05rem] tracking-[-0.01em] text-text no-underline">
          <span
            className="h-[30px] w-[30px] flex-shrink-0 rounded-[9px] bg-center bg-cover max-[470px]:h-[27px] max-[470px]:w-[27px]"
            style={{ backgroundImage: 'url(./favicon.svg)', boxShadow: '0 3px 8px -3px rgba(37,99,235,0.55)' }}
          />
          <span className="max-[470px]:hidden">Hóa Sinh </span>
          <span className="text-primary">07-2026</span>
        </Link>
        <div className="flex items-center gap-2.5 max-[470px]:gap-1.5">
          <ModeToggle />
          <ExplainToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="px-[18px] pt-6 pb-16">
        <Outlet />
      </main>

      <ScrollTopButton />
    </>
  )
}
