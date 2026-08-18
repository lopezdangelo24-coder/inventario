'use client'

import { Minus, Plus, MapPin, Pencil, Trash2, PackageX } from 'lucide-react'
import { StockPill, getStockStatus } from './stock-pill'
import type { MovementType, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Actions {
  /** Ajuste directo de una unidad (+1 / -1) sobre el stock. */
  onAdjust: (product: Product, type: MovementType) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function InventoryTable({
  products,
  duplicateSkus,
  ...actions
}: { products: Product[]; duplicateSkus: Set<string> } & Actions) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
        <PackageX className="size-8 text-muted-foreground" />
        <p className="font-display text-lg font-semibold text-foreground">Sin resultados</p>
        <p className="max-w-xs text-sm text-muted-foreground text-pretty">
          No se encontraron productos. Ajusta la búsqueda o agrega un nuevo SKU.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Móvil: tarjetas */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {products.map((p) => (
          <li
            key={p.id}
            className={cn(
              'rounded-2xl border bg-card p-4 shadow-sm',
              getStockStatus(p.currentStock, p.minimumStock) === 'low'
                ? 'border-warning/50'
                : 'border-border',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <BrandTag brand={p.brand} />
                  <SkuTag sku={p.sku} duplicated={duplicateSkus.has(p.sku.toLowerCase())} />
                </div>
                <p className="mt-1.5 font-display text-base font-bold text-foreground text-balance">
                  {p.name}
                </p>
              </div>
              <StockPill current={p.currentStock} min={p.minimumStock} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <Meta label="Código de barras" value={p.barcode || '—'} mono />
              <Meta label="Categoría / Tipo" value={`${p.category} · ${p.filterType || '—'}`} />
              <Meta label="Medidas" value={p.measurements || '—'} />
              <Meta label="Ubicación" value={p.location || '—'} />
            </dl>

            <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-border pt-3">
              <RowAction label="Restar 1 (salida)" tone="out" onClick={() => actions.onAdjust(p, 'out')}>
                <Minus className="size-4" />
              </RowAction>
              <RowAction label="Sumar 1 (entrada)" tone="in" onClick={() => actions.onAdjust(p, 'in')}>
                <Plus className="size-4" />
              </RowAction>
              <RowAction label="Editar" tone="neutral" onClick={() => actions.onEdit(p)}>
                <Pencil className="size-4" />
              </RowAction>
              <RowAction label="Borrar" tone="danger" onClick={() => actions.onDelete(p)}>
                <Trash2 className="size-4" />
              </RowAction>
            </div>
          </li>
        ))}
      </ul>

      {/* Escritorio: planilla estilo Excel */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-sm lg:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary text-left font-display text-xs uppercase tracking-wide text-primary-foreground">
              <Th>Marca</Th>
              <Th>SKU / Cód. catálogo</Th>
              <Th>Código de barras</Th>
              <Th>Nombre / Descripción</Th>
              <Th>Categoría / Tipo</Th>
              <Th>Medidas</Th>
              <Th className="text-center">Stock / Mín.</Th>
              <Th className="text-center">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                className={cn(
                  'transition-colors hover:bg-gold/10',
                  getStockStatus(p.currentStock, p.minimumStock) === 'low'
                    ? 'bg-warning/10'
                    : i % 2 === 1
                      ? 'bg-muted/30'
                      : 'bg-card',
                )}
              >
                <Td>
                  <BrandTag brand={p.brand} />
                </Td>
                <Td>
                  <SkuTag sku={p.sku} duplicated={duplicateSkus.has(p.sku.toLowerCase())} />
                </Td>
                <Td>
                  <span className="font-mono text-xs text-muted-foreground">{p.barcode || '—'}</span>
                </Td>
                <Td>
                  <span className="font-medium text-foreground">{p.name}</span>
                </Td>
                <Td>
                  <span className="text-foreground">{p.category}</span>
                  <span className="block text-xs text-muted-foreground">{p.filterType || '—'}</span>
                </Td>
                <Td>
                  <span className="text-muted-foreground">{p.measurements || '—'}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-3" />
                    {p.location || '—'}
                  </span>
                </Td>
                <Td className="text-center">
                  <StockPill current={p.currentStock} min={p.minimumStock} />
                </Td>
                <Td className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <RowAction label="Restar 1 (salida)" tone="out" onClick={() => actions.onAdjust(p, 'out')}>
                      <Minus className="size-4" />
                    </RowAction>
                    <RowAction label="Sumar 1 (entrada)" tone="in" onClick={() => actions.onAdjust(p, 'in')}>
                      <Plus className="size-4" />
                    </RowAction>
                    <RowAction label="Editar" tone="neutral" onClick={() => actions.onEdit(p)}>
                      <Pencil className="size-4" />
                    </RowAction>
                    <RowAction label="Borrar" tone="danger" onClick={() => actions.onDelete(p)}>
                      <Trash2 className="size-4" />
                    </RowAction>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'border-r border-primary-foreground/15 px-4 py-3 font-semibold last:border-r-0',
        className,
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        'border-b border-r border-border px-4 py-3 align-middle last:border-r-0',
        className,
      )}
    >
      {children}
    </td>
  )
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn('truncate text-foreground', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}

function BrandTag({ brand }: { brand: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-primary/15 bg-primary/5 px-2 py-0.5 font-display text-xs font-bold text-foreground">
      {brand}
    </span>
  )
}

function SkuTag({ sku, duplicated }: { sku: string; duplicated: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-semibold',
        duplicated ? 'bg-gold/20 text-gold-foreground' : 'bg-muted text-muted-foreground',
      )}
      title={duplicated ? 'SKU compartido por varias marcas' : undefined}
    >
      {sku}
      {duplicated ? <span className="size-1.5 rounded-full bg-gold-dark" /> : null}
    </span>
  )
}

function RowAction({
  label,
  tone,
  onClick,
  children,
}: {
  label: string
  tone: 'in' | 'out' | 'neutral' | 'danger'
  onClick: () => void
  children: React.ReactNode
}) {
  const tones = {
    in: 'border-gold/40 bg-gold/10 text-gold-foreground hover:bg-gold/20',
    out: 'border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10',
    neutral: 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
    danger: 'border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/15',
  }[tone]
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg border transition-colors active:translate-y-px',
        tones,
      )}
    >
      {children}
    </button>
  )
}
