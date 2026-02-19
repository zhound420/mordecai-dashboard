interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0"
      style={{
        background: 'linear-gradient(180deg, var(--header-bg) 0%, var(--header-bg-end) 100%)',
      }}
    >
      <div>
        <h1 className="text-sm font-semibold text-foreground tracking-wide">{title}</h1>
        {description && (
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-mono">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
