import { Link } from 'react-router-dom'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const BTN_BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-[13px] px-[18px] py-[11px] text-[0.95rem] font-semibold cursor-pointer transition-[background,border-color,filter,transform] duration-150 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none'

const BTN_VARIANTS = {
  default:
    'border border-border bg-surface text-text hover:bg-primary-soft hover:border-border-strong',
  primary:
    'bg-primary-grad text-white border border-transparent shadow-primary hover:brightness-105',
  ghost: 'bg-transparent border border-transparent text-text hover:bg-primary-soft',
}

export function Button({ variant = 'default', block, className, as, to, ...props }) {
  const cls = cx(BTN_BASE, BTN_VARIANTS[variant], block && 'w-full', className)
  if (to) return <Link to={to} className={cls} {...props} />
  const Comp = as || 'button'
  return <Comp className={cls} {...props} />
}

export function Container({ wide, className, ...props }) {
  return (
    <div
      className={cx('mx-auto', wide ? 'max-w-[1080px]' : 'max-w-[820px]', className)}
      {...props}
    />
  )
}

export function Card({ className, as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={cx(
        'bg-surface border border-border rounded-card shadow-soft p-5',
        className
      )}
      {...props}
    />
  )
}

export function SectionTitle({ children, className }) {
  return (
    <h2
      className={cx(
        'text-[0.85rem] font-bold uppercase tracking-[0.04em] text-text-muted mt-7 mb-3 first:mt-0',
        className
      )}
    >
      {children}
    </h2>
  )
}

export function Pill({ children, className }) {
  return (
    <span
      className={cx(
        'inline-block px-2.5 py-[3px] rounded-full text-[0.75rem] font-bold bg-primary-soft text-primary-dark',
        className
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ percent, className }) {
  return (
    <div className={cx('h-2 rounded-full bg-border overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-primary-grad transition-[width] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function BackLink({ to, onClick, children = '← Quay lại' }) {
  const cls =
    'inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-text-muted hover:text-primary mb-4 cursor-pointer bg-transparent border-0 p-0'
  if (to) return <Link to={to} className={cls}>{children}</Link>
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

export { cx }
