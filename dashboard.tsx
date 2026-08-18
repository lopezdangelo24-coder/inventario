'use client'

import { useMemo, useRef, useState } from 'react'
import {
  ScanLine,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Search,
} from 'lucide-react'
import { useInventory } from './inventory-store'
import { BrandLogo, BrandMark } from './brand-logo'
import { Toolbar } from './toolbar'
import { InventoryTable } from './inventory-table'
import { ScanModal } from './scan-modal'
import { BrandPickerModal } from './brand-picker-modal'
import { QuickAdjustModal } from './quick-adjust-modal'
import { ProductFormModal } from './product-form-modal'
import { Modal } from './modal'
import { Toast, useToast } from './toast'
import { getStockStatus } from './stock-pill'
import { exportToExcel, parseExcelFile, downloadTemplate } from '@/lib/excel'
import type { MovementType, Product, ProductDraft } from '@/lib/types'

export function Dashboard() {
  const inv = useInventory()
  const { toast, show } = useToast()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [onlyLow, setOnlyLow] = useState(false)

  // Estado de modales.
  const [scanOpen, setScanOpen] = useState(false)
  const [pendingType, setPendingType] = useState<MovementType>('in')
  const [brandMatches, setBrandMatches] = useState<Product[] | null>(null)
  const [quickTargetId, setQuickTargetId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [prefillCode, setPrefillCode] = useState<string | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const knownBrands = useMemo(
    () => Array.from(new Set(inv.products.map((p) => p.brand))).sort(),
    [inv.products],
  )

  // SKUs que aparecen en más de una marca (para destacar en la tabla).
  const duplicateSkus = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of inv.products) {
      const key = p.sku.toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k))
  }, [inv.products])

  const lowCount = useMemo(
    () => inv.products.filter((p) => getStockStatus(p.currentStock, p.minimumStock) !== 'ok').length,
    [inv.products],
  )

  const totalUnits = useMemo(
    () => inv.products.reduce((s, p) => s + p.currentStock, 0),
    [inv.products],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return inv.products.filter((p) => {
      if (category && p.category !== category) return false
      if (onlyLow && getStockStatus(p.currentStock, p.minimumStock) === 'ok') return false
      if (!q) return true
      return [p.sku, p.brand, p.barcode, p.name, p.measurements, p.location, p.category, p.filterType]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [inv.products, query, category, onlyLow])

  // ---- Flujo del escáner ----
  function handleCode(code: string) {
    const matches = inv.findByCode(code)
    setScanOpen(false)
    if (matches.length === 0) {
      // Código desconocido: crear nuevo SKU.
      setEditing(null)
      setPrefillCode(code)
      setFormOpen(true)
      show(`Código ${code} no existe. Registra el nuevo SKU.`, 'info')
    } else if (matches.length === 1) {
      // Único producto: abrir ajuste rápido +1 / -1.
      setQuickTargetId(matches[0].id)
    } else {
      // Mismo código en varias marcas: seleccionar marca primero.
      setBrandMatches(matches)
    }
  }

  function openScan(type: MovementType) {
    setPendingType(type)
    setScanOpen(true)
  }

  // Ajuste directo de stock (usado por +/- en la tabla y en el diálogo rápido).
  function handleAdjust(id: number, type: MovementType, qty: number) {
    inv.registerMovement(id, type, qty)
    const p = inv.getById(id)
    show(
      `${type === 'in' ? '+' : '−'}${qty} u. · ${p?.brand ?? ''} ${p?.sku ?? ''} → ${p?.currentStock ?? 0}`,
      type === 'in' ? 'success' : 'info',
    )
  }

  function handleFormSubmit(draft: ProductDraft, id?: number) {
    if (id) {
      inv.updateProduct(id, draft)
      show('Producto actualizado.', 'success')
    } else {
      inv.addProduct(draft)
      show(`SKU ${draft.sku} · ${draft.brand} creado.`, 'success')
    }
    setFormOpen(false)
    setEditing(null)
    setPrefillCode(undefined)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { drafts, skipped } = await parseExcelFile(file)
      if (drafts.length === 0) {
        show('No se encontraron filas válidas en el archivo.', 'error')
        return
      }
      const { added, updated } = inv.importProducts(drafts)
      show(
        `Importado: ${added} nuevos, ${updated} actualizados${skipped ? `, ${skipped} omitidos` : ''}.`,
        'success',
      )
    } catch {
      show('No se pudo leer el archivo Excel.', 'error')
    }
  }

  return (
    <div className="min-h-dvh pb-28 lg:pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <BrandMark />
          <BrandLogo />
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <QuickButton onClick={() => openScan('in')} tone="ghost" icon={<ArrowDownToLine className="size-4" />}>
              Entradas
            </QuickButton>
            <QuickButton onClick={() => openScan('out')} tone="ghost" icon={<ArrowUpFromLine className="size-4" />}>
              Salidas
            </QuickButton>
            <QuickButton
              onClick={() => {
                setEditing(null)
                setPrefillCode(undefined)
                setFormOpen(true)
              }}
              tone="gold"
              icon={<Plus className="size-4" />}
            >
              Nuevo SKU
            </QuickButton>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        {/* Hero escáner */}
        <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <button
            onClick={() => openScan('in')}
            className="group relative overflow-hidden rounded-3xl bg-gold-gradient p-6 text-left shadow-lg ring-1 ring-gold-dark/30 transition-all hover:brightness-[1.03] active:translate-y-px sm:p-8"
          >
            <div className="relative z-10 flex items-center gap-5">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md sm:size-20">
                <ScanLine className="size-8 sm:size-10" />
              </span>
              <div>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-foreground/70">
                  Pistola lectora
                </p>
                <h2 className="font-display text-2xl font-bold text-gold-foreground text-balance sm:text-3xl">
                  Escanear QR / Código de barras
                </h2>
                <p className="mt-1 text-sm text-gold-foreground/80">
                  Cámara del iPhone o pistola USB/Bluetooth
                </p>
              </div>
            </div>
            <ScanLine className="pointer-events-none absolute -right-6 -bottom-8 size-48 text-gold-foreground/10" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Boxes className="size-5" />} label="SKUs / variantes" value={inv.products.length} />
            <StatCard icon={<Package className="size-5" />} label="Unidades totales" value={totalUnits} />
            <StatCard
              icon={<AlertTriangle className="size-5" />}
              label="Por reponer"
              value={lowCount}
              tone={lowCount > 0 ? 'warning' : 'default'}
            />
            <StatCard
              icon={<CheckCircle2 className="size-5" />}
              label="Marcas activas"
              value={knownBrands.length}
            />
          </div>
        </section>

        {/* Toolbar */}
        <Toolbar
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={(c) => {
            setCategory(c)
            setOnlyLow(false)
          }}
          onlyLow={onlyLow}
          onToggleLow={() => {
            setOnlyLow((v) => !v)
            setCategory(null)
          }}
          lowCount={lowCount}
          onExport={() => {
            exportToExcel(inv.products)
            show('Inventario exportado a Excel.', 'success')
          }}
          onImportClick={() => fileInputRef.current?.click()}
          onTemplate={downloadTemplate}
        />

        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Search className="size-4" />
            {filtered.length} de {inv.products.length} productos
          </p>
        </div>

        <InventoryTable
          products={filtered}
          duplicateSkus={duplicateSkus}
          onAdjust={(p, type) => handleAdjust(p.id, type, 1)}
          onEdit={(p) => {
            setEditing(p)
            setPrefillCode(undefined)
            setFormOpen(true)
          }}
          onDelete={(p) => setDeleteTarget(p)}
        />
      </main>

      {/* Barra de acciones inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-2.5 backdrop-blur-md sm:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2">
          <BottomAction onClick={() => openScan('in')} icon={<ArrowDownToLine className="size-5" />}>
            Entradas
          </BottomAction>
          <BottomAction onClick={() => openScan('out')} icon={<ArrowUpFromLine className="size-5" />}>
            Salidas
          </BottomAction>
          <BottomAction
            tone="gold"
            onClick={() => {
              setEditing(null)
              setPrefillCode(undefined)
              setFormOpen(true)
            }}
            icon={<Plus className="size-5" />}
          >
            Nuevo SKU
          </BottomAction>
        </div>
      </nav>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImport}
      />

      {/* Modales */}
      <ScanModal open={scanOpen} onClose={() => setScanOpen(false)} onCode={handleCode} />

      <BrandPickerModal
        open={brandMatches !== null}
        onClose={() => setBrandMatches(null)}
        matches={brandMatches ?? []}
        onSelect={(p) => {
          setBrandMatches(null)
          setQuickTargetId(p.id)
        }}
      />

      <QuickAdjustModal
        open={quickTargetId !== null}
        onClose={() => setQuickTargetId(null)}
        product={quickTargetId !== null ? inv.getById(quickTargetId) ?? null : null}
        hint={pendingType}
        onAdjust={handleAdjust}
      />

      <ProductFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
          setPrefillCode(undefined)
        }}
        onSubmit={handleFormSubmit}
        editing={editing}
        prefillCode={prefillCode}
        knownBrands={knownBrands}
      />

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar producto"
        description="Esta acción no se puede deshacer."
      >
        {deleteTarget ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground">
              ¿Eliminar <strong>{deleteTarget.name}</strong> — {deleteTarget.brand} (SKU{' '}
              {deleteTarget.sku})?
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-11 rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  inv.deleteProduct(deleteTarget.id)
                  show('Producto eliminado.', 'info')
                  setDeleteTarget(null)
                }}
                className="h-11 rounded-lg bg-destructive px-5 text-sm font-bold text-destructive-foreground hover:brightness-110"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Toast toast={toast} />
    </div>
  )
}

function QuickButton({
  onClick,
  icon,
  tone,
  children,
}: {
  onClick: () => void
  icon: React.ReactNode
  tone: 'ghost' | 'gold'
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={
        tone === 'gold'
          ? 'flex h-10 items-center gap-1.5 rounded-lg bg-gold-gradient px-3.5 text-sm font-bold text-gold-foreground shadow-sm transition-all hover:brightness-105 active:translate-y-px'
          : 'flex h-10 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted'
      }
    >
      {icon}
      {children}
    </button>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone?: 'default' | 'warning'
}) {
  return (
    <div
      className={
        tone === 'warning'
          ? 'flex flex-col justify-between rounded-2xl border border-warning/50 bg-warning/15 p-4 shadow-sm'
          : 'flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm'
      }
    >
      <span
        className={
          tone === 'warning'
            ? 'flex size-9 items-center justify-center rounded-lg bg-warning/30 text-warning-foreground'
            : 'flex size-9 items-center justify-center rounded-lg bg-primary/5 text-foreground'
        }
      >
        {icon}
      </span>
      <div className="mt-3">
        <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function BottomAction({
  onClick,
  icon,
  tone = 'default',
  children,
}: {
  onClick: () => void
  icon: React.ReactNode
  tone?: 'default' | 'gold'
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={
        tone === 'gold'
          ? 'flex flex-col items-center gap-1 rounded-xl bg-gold-gradient py-2 text-xs font-bold text-gold-foreground shadow-sm active:translate-y-px'
          : 'flex flex-col items-center gap-1 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground active:translate-y-px'
      }
    >
      {icon}
      {children}
    </button>
  )
}
