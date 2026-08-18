import { cn } from '@/lib/utils'

/** Wordmark oficial "MUSCARGO REPUESTOS" con líneas doradas resplandecientes. */
export function BrandLogo({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg'
  return (
    <div className={cn('font-display leading-none tracking-tight', className)}>
      <div className={cn('flex items-center gap-2', text)}>
        <span className="font-bold text-primary">MUSCARGO</span>
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        <GoldLines />
        <span className={cn('font-semibold text-primary', size === 'sm' ? 'text-xs' : 'text-sm')}>
          REPUESTOS
        </span>
      </div>
    </div>
  )
}

function GoldLines() {
  return (
    <span aria-hidden className="flex flex-1 flex-col gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-[2px] w-full rounded-full bg-gold-gradient shadow-[0_0_4px_oklch(0.78_0.13_85_/_0.6)]"
        />
      ))}
    </span>
  )
}

/** Icono cuadrado con la "M" — usado en el header como marca compacta. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-display relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-sm',
        className,
      )}
    >
      M
      <span className="absolute inset-x-1.5 bottom-1.5 flex flex-col gap-[2px]">
        <span className="h-[2px] rounded-full bg-gold-gradient" />
        <span className="h-[2px] rounded-full bg-gold-gradient" />
      </span>
    </span>
  )
}
