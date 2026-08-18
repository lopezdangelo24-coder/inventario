'use client'

import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Minus, Plus, MapPin } from 'lucide-react'
import { Modal } from './modal'
import { StockPill } from './stock-pill'
import type { MovementType, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

export function MovementModal({
  open,
  onClose,
  product,
  initialType,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  product: Product | null
  initialType: MovementType
  onConfirm: (id: number, type: MovementType, qty: number) => void
}) {
  const [type, setType] = useState<MovementType>(initialType)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (open) {
      setType(initialType)
      setQty(1)
    }
  }, [open, initialType, product?.id])

  if (!product) return null

  const projected =
    type === 'in' ? product.currentStock + qty : Math.max(0, product.currentStock - qty)
  const isOut = type === 'out'
  const overdraw = isOut && qty > product.currentStock

  return (
    <Modal open={open} onClose={onClose} title="Registrar movimiento" description={product.name}>
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-base font-bold text-foreground">{product.brand}</p>
              <p className="font-mono text-xs text-muted-foreground">
                SKU {product.sku} · {product.barcode || 's/código'}
              </p>
            </div>
            <StockPill current={product.currentStock} min={product.minimumStock} />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {product.location || 'Sin ubicación'} · {product.measurements || 's/medidas'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <TypeButton
            active={!isOut}
            onClick={() => setType('in')}
            label="Entrada"
            tone="in"
            icon={<ArrowDownToLine className="size-4" />}
          />
          <TypeButton
            active={isOut}
            onClick={() => setType('out')}
            label="Salida / Venta"
            tone="out"
            icon={<ArrowUpFromLine className="size-4" />}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            aria-label="Restar"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
          >
            <Minus className="size-5" />
          </button>
          <input
            aria-label="Cantidad"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            className="h-16 w-24 rounded-xl border border-input bg-background text-center font-display text-3xl font-bold text-foreground outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40"
          />
          <button
            aria-label="Sumar"
            onClick={() => setQty((q) => q + 1)}
            className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="size-5" />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Stock resultante</span>
          <span className="font-display text-lg font-bold text-foreground">
            {product.currentStock} → {projected}
          </span>
        </div>
        {overdraw ? (
          <p className="-mt-1 text-center text-xs text-destructive">
            La salida supera el stock; se ajustará a 0.
          </p>
        ) : null}

        <button
          onClick={() => onConfirm(product.id, type, qty)}
          className={cn(
            'h-12 rounded-xl px-6 font-display text-base font-bold shadow-sm transition-all active:translate-y-px',
            isOut
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-gold-gradient text-gold-foreground hover:brightness-105',
          )}
        >
          Confirmar {isOut ? 'salida' : 'entrada'} de {qty} u.
        </button>
      </div>
    </Modal>
  )
}

function TypeButton({
  active,
  onClick,
  label,
  tone,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  tone: MovementType
  icon: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all',
        active
          ? tone === 'in'
            ? 'border-gold bg-gold/15 text-foreground'
            : 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-muted',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
