import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StockStatus = 'ok' | 'low' | 'out'

export function getStockStatus(current: number, min: number): StockStatus {
  if (current <= 0) return 'out'
  if (current <= min) return 'low'
  return 'ok'
}

export function StockPill({
  current,
  min,
  showCount = true,
}: {
  current: number
  min: number
  showCount?: boolean
}) {
  const status = getStockStatus(current, min)
  const config = {
    ok: {
      cls: 'bg-primary/5 text-foreground border-border',
      icon: <CheckCircle2 className="size-3.5 text-gold-dark" />,
      label: 'En stock',
    },
    low: {
      cls: 'bg-warning/20 text-warning-foreground border-warning/40',
      icon: <AlertTriangle className="size-3.5" />,
      label: 'Reponer',
    },
    out: {
      cls: 'bg-destructive/10 text-destructive border-destructive/30',
      icon: <XCircle className="size-3.5" />,
      label: 'Agotado',
    },
  }[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        config.cls,
      )}
    >
      {config.icon}
      {showCount ? (
        <span className="font-display">
          {current}
          <span className="text-muted-foreground">/{min}</span>
        </span>
      ) : (
        config.label
      )}
    </span>
  )
}
