import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  useState
} from 'react'

export function cn(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(' ')
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'xs' | 'icon' | 'icon-xs'
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'outline'
      ? 'border border-(--ui-stroke-secondary) bg-(--ui-bg-editor) text-(--ui-text-primary) hover:bg-(--ui-bg-quinary)'
      : variant === 'secondary'
        ? 'bg-(--ui-bg-quinary) text-(--ui-text-primary) hover:opacity-90'
        : variant === 'ghost'
          ? 'bg-transparent text-(--ui-text-secondary) hover:bg-(--ui-bg-quinary) hover:text-(--ui-text-primary)'
          : 'bg-(--ui-accent) text-(--ui-bg-editor) hover:opacity-90'

  const sizeClass =
    size === 'xs'
      ? 'h-6 px-2 text-xs gap-1 rounded-md'
      : size === 'sm'
        ? 'h-7 px-2.5 text-xs gap-1.5 rounded-lg'
        : size === 'icon-xs'
          ? 'h-6 w-6 p-0 rounded-md'
          : size === 'icon'
            ? 'h-7 w-7 p-0 rounded-lg'
            : 'h-8 px-3 text-xs gap-1.5 rounded-lg'

  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-medium select-none outline-none focus-visible:outline-2 focus-visible:outline-(--ui-accent) disabled:pointer-events-none disabled:opacity-50',
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'muted' | 'secondary' | 'outline'
}

export function Badge({
  className,
  variant = 'outline',
  children,
  ...props
}: BadgeProps) {
  const variantClass =
    variant === 'outline'
      ? 'border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) text-(--ui-text-secondary)'
      : variant === 'default'
        ? 'bg-(--ui-accent) text-(--ui-bg-editor)'
        : 'bg-(--ui-bg-quinary) text-(--ui-text-secondary)'

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function Codicon({
  name,
  size = '0.875rem',
  className
}: {
  name: string
  size?: number | string
  className?: string
}) {
  const dim = typeof size === 'number' ? `${size}px` : size

  const renderPaths = () => {
    switch (name) {
      case 'chevron-right':
        return <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      case 'chevron-down':
        return <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      case 'briefcase':
      case 'shop':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="12" height="8.5" rx="1.5" />
            <path d="M5.5 5V3.5A1 1 0 0 1 6.5 2.5h3a1 1 0 0 1 1 1V5" />
            <path d="M2 8.5h12" />
          </g>
        )
      case 'graph':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 13.5h11" />
            <rect x="3.5" y="7.5" width="2" height="6" rx="0.5" />
            <rect x="7" y="4.5" width="2" height="9" rx="0.5" />
            <rect x="10.5" y="2.5" width="2" height="11" rx="0.5" />
          </g>
        )
      case 'package':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1.75L13.5 4.75v6.5L8 14.25 2.5 11.25v-6.5L8 1.75z" />
            <path d="M2.5 4.75L8 7.75l5.5-3" />
            <path d="M8 7.75v6.5" />
            <path d="M5.25 3.25l5.5 3" />
          </g>
        )
      case 'organization':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="5.25" r="2.25" />
            <path d="M2 13c0-2.1 1.8-3.5 4-3.5s4 1.4 4 3.5" />
            <circle cx="11.25" cy="5.75" r="1.75" />
            <path d="M11 9.5c1.6.15 3 1.25 3 3.25" />
          </g>
        )
      case 'tools':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.8 3.2a3.2 3.2 0 0 0-3.9 4.2L2.4 10.9a1.2 1.2 0 0 0 1.7 1.7l3.5-3.5a3.2 3.2 0 0 0 4.2-3.9l-2 2-1.5-.5-.5-1.5 2-2z" />
          </g>
        )
      case 'megaphone':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.5 3L5.5 6H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2.5l7 3V3z" />
            <path d="M5 10l.8 3.2a.8.8 0 0 0 .8.6h1a.8.8 0 0 0 .75-1L7.5 10" />
          </g>
        )
      case 'calendar':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="1.5" />
            <path d="M5 2v2.25M11 2v2.25M2.25 6.5h11.5" />
          </g>
        )
      case 'edit':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.8 2.5l2.7 2.7-8 8H2.8v-2.7l8-8z" />
            <path d="M9.2 4.1l2.7 2.7" />
          </g>
        )
      case 'symbol-color':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2a6 6 0 1 0 0 12c.9 0 1.5-.6 1.5-1.4 0-.4-.15-.7-.4-1-.2-.25-.3-.55-.3-.9 0-.8.65-1.45 1.5-1.45h1.2A2.5 2.5 0 0 0 14 6.75C14 4.1 11.3 2 8 2z" />
            <circle cx="5.5" cy="6.5" r="0.75" fill="currentColor" />
            <circle cx="8" cy="5" r="0.75" fill="currentColor" />
            <circle cx="10.5" cy="6.5" r="0.75" fill="currentColor" />
          </g>
        )
      case 'library':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.25" y="3" width="2.5" height="10.5" rx="0.5" />
            <rect x="5.75" y="3" width="2.5" height="10.5" rx="0.5" />
            <path d="M9.5 3.4l2.3-.5 1.9 10.2-2.3.5-1.9-10.2z" />
          </g>
        )
      case 'extensions':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.25" y="2.25" width="5" height="5" rx="1" />
            <rect x="8.75" y="2.25" width="5" height="5" rx="1" />
            <rect x="2.25" y="8.75" width="5" height="5" rx="1" />
            <rect x="8.75" y="8.75" width="5" height="5" rx="1" />
          </g>
        )
      case 'warning':
      case 'error':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="5.75" />
            <path d="M8 5v3.5" />
            <circle cx="8" cy="11" r="0.6" fill="currentColor" />
          </g>
        )
      default:
        return (
          <circle
            cx="8"
            cy="8"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        )
    }
  }

  return (
    <span
      data-codicon={name}
      className={cn('inline-flex shrink-0 items-center justify-center select-none', className)}
      style={{ width: dim, height: dim }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" style={{ width: dim, height: dim }}>
        {renderPaths()}
      </svg>
    </span>
  )
}

export function Tip({
  label,
  side = 'top',
  children
}: {
  label: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  children: ReactNode
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  const handleOpen = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    if (side === 'right') {
      setCoords({ top: rect.top + rect.height / 2, left: rect.right + 8 })
    } else {
      setCoords({ top: rect.top - 6, left: rect.left + rect.width / 2 })
    }
  }

  const posStyle = coords
    ? side === 'right'
      ? { top: `${coords.top}px`, left: `${coords.left}px`, transform: 'translateY(-50%)' }
      : { top: `${coords.top}px`, left: `${coords.left}px`, transform: 'translate(-50%, -100%)' }
    : undefined

  return (
    <span
      className="relative inline-flex min-w-0 flex-1 items-center"
      onMouseEnter={e => handleOpen(e.currentTarget)}
      onMouseLeave={() => setCoords(null)}
      onFocus={e => handleOpen(e.currentTarget)}
      onBlur={() => setCoords(null)}
    >
      {children}
      {coords && label && (
        <span
          role="tooltip"
          style={posStyle}
          className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) px-2 py-1 text-xs font-normal text-(--ui-text-primary) shadow-sm"
        >
          {label}
        </span>
      )}
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  children,
  className
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex max-w-sm flex-col items-center justify-center gap-2 text-center',
        className
      )}
    >
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) text-(--ui-text-secondary)">
          {icon}
        </div>
      )}
      <div className="text-sm font-medium text-(--ui-text-primary)">{title}</div>
      {description && (
        <p className="text-xs leading-relaxed text-(--ui-text-tertiary)">{description}</p>
      )}
      {children && <div className="mt-1 flex items-center gap-2">{children}</div>}
    </div>
  )
}

export function ErrorState({
  icon = 'warning',
  title,
  description,
  children,
  className
}: {
  icon?: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex max-w-sm flex-col items-center justify-center gap-2 text-center',
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) text-(--ui-text-secondary)">
        <Codicon name={icon} size="1.25rem" />
      </div>
      <div className="text-sm font-medium text-(--ui-text-primary)">{title}</div>
      {description && (
        <p className="text-xs leading-relaxed text-(--ui-text-tertiary)">{description}</p>
      )}
      {children && <div className="mt-1.5 flex items-center gap-2">{children}</div>}
    </div>
  )
}

export const ROUTES_AREA = 'routes'

export interface RouteContribution {
  path: string
}

export const host = {
  navigate(path: string) {
    if (typeof window !== 'undefined') {
      const to = path.startsWith('#') ? path.slice(1) : path
      window.location.hash = `#${to}`
    }
  }
}
