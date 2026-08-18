'use client'

import { useEffect, useState } from 'react'
import { Minus, Plus, MapPin, Check, ScanBarcode } from 'lucide-react'
import { Modal } from './modal'
import { StockPill } from './stock-pill'
import type { MovementType, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Diálogo de acción rápida tras pistolear un producto.
 * Enfocado en sumar (+1) o restar (-1) una unidad en un solo toque.
 * Cada toque registra el movimiento de inmediato; el stock se actualiza en vivo.
 */
export function QuickAdjustModal({
  open,
  onClose,
  product,
  hint = 'in',
  onAdjust,
}: {
  open: boolean
  onClose: () => void
  product: Product | null
  hint?: MovementType
  onAdjust: (id: number, type: MovementType, qty: number) => void
}) {
  // Movimiento neto aplicado durante esta sesión (para el resumen al cerrar).
  const [net, setNet] = useState(0)

  useEffect(() => {
    if (open) setNet(0)
  }, [open, product?.id])

  if (!product) return null

  function bump(type: MovementType) {
    if (!product) return
    // Evita restar por debajo de 0.
    if (type === 'out' && product.currentStock <= 0) return
    onAdjust(product.id, type, 1)
    setNet((n) => n + (type === 'in' ? 1 : -1))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajuste rápido de stock"
      description="Suma o resta una unidad con un toque."
    >
      <div className="flex flex-col gap-5">
        {/* Ficha del producto encontrado */}
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md border border-primary/15 bg-primary/5 px-2 py-0.5 font-display text-xs font-bold text-foreground">
                  {product.brand}
                </span>
                <ScanBarcode className="size-3.5 text-gold-dark" />
              </div>
              <p className="mt-1 truncate font-display text-base font-bold text-foreground">
                {product.name}
              </p>
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

        {/* Controles grandes -1 / stock / +1 */}
        <div className="flex items-stretch gap-3">
          <button
            aria-label="Restar una unidad (salida)"
            onClick={() => bump('out')}
            disabled={product.currentStock <= 0}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-primary/20 bg-primary/5 py-6 text-foreground transition-all hover:bg-primary/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-40"
          >
            <Minus className="size-8" />
            <span className="font-display text-sm font-bold">Salida −1</span>
          </button>

          <div className="flex w-28 shrink-0 flex-col items-center justify-center rounded-2xl bg-muted/60 px-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Stock
            </span>
            <span className="font-display text-4xl font-bold leading-none text-foreground">
              {product.currentStock}
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              mín. {product.minimumStock}
            </span>
          </div>

          <button
            aria-label="Sumar una unidad (entrada)"
            onClick={() => bump('in')}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 py-6 transition-all active:translate-y-px',
              hint === 'in'
                ? 'border-gold bg-gold-gradient text-gold-foreground hover:brightness-105'
                : 'border-gold/40 bg-gold/10 text-gold-foreground hover:bg-gold/20',
            )}
          >
            <Plus className="size-8" />
            <span className="font-display text-sm font-bold">Entrada +1</span>
          </button>
        </div>

        {/* Resumen de la sesión + cerrar */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {net === 0 ? (
              'Aún sin movimientos'
            ) : (
              <span className="font-semibold text-foreground">
                Ajuste aplicado: {net > 0 ? `+${net}` : net} u.
              </span>
            )}
          </p>
          <button
            onClick={onClose}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-display text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:translate-y-px"
          >
            <Check className="size-4" />
            Listo
          </button>
        </div>
      </div>
    </Modal>
  )
}
