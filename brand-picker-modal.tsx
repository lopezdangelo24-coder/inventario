'use client'

import { ChevronRight, MapPin } from 'lucide-react'
import { Modal } from './modal'
import { StockPill } from './stock-pill'
import type { Product } from '@/lib/types'

/**
 * Cuando un mismo SKU tiene varias marcas, el usuario elige la variante exacta
 * antes de aplicar la entrada / salida.
 */
export function BrandPickerModal({
  open,
  onClose,
  matches,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  matches: Product[]
  onSelect: (product: Product) => void
}) {
  const sku = matches[0]?.sku ?? ''
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Selecciona la marca"
      description={`El SKU ${sku} existe en ${matches.length} marcas. Elige a cuál aplicar el movimiento.`}
    >
      <ul className="flex flex-col gap-2">
        {matches.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => onSelect(p)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all hover:border-gold hover:bg-gold/5 active:translate-y-px"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-foreground">{p.brand}</p>
                <p className="truncate text-sm text-muted-foreground">{p.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {p.location || 's/ubicación'} · {p.measurements || 's/medidas'}
                </p>
              </div>
              <StockPill current={p.currentStock} min={p.minimumStock} />
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
