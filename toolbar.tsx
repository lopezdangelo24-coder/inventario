'use client'

import { Search, X, Download, Upload, FileSpreadsheet } from 'lucide-react'
import { CATEGORIES } from '@/lib/types'
import { cn } from '@/lib/utils'

export function Toolbar({
  query,
  onQuery,
  category,
  onCategory,
  onlyLow,
  onToggleLow,
  lowCount,
  onExport,
  onImportClick,
  onTemplate,
}: {
  query: string
  onQuery: (v: string) => void
  category: string | null
  onCategory: (c: string | null) => void
  onlyLow: boolean
  onToggleLow: () => void
  lowCount: number
  onExport: () => void
  onImportClick: () => void
  onTemplate: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar por SKU, marca, código, nombre, medidas o ubicación…"
            className="h-11 w-full rounded-xl border border-input bg-card pr-9 pl-9 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40"
          />
          {query ? (
            <button
              aria-label="Limpiar búsqueda"
              onClick={() => onQuery('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onImportClick}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <button
            onClick={onExport}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Chip active={category === null && !onlyLow} onClick={() => onCategory(null)}>
          Todos
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => onCategory(c)}>
            {c}
          </Chip>
        ))}
        <span className="mx-1 h-5 w-px shrink-0 bg-border" />
        <Chip active={onlyLow} tone="warning" onClick={onToggleLow}>
          Reponer {lowCount > 0 ? `(${lowCount})` : ''}
        </Chip>
        <button
          onClick={onTemplate}
          className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <FileSpreadsheet className="size-3.5" />
          Plantilla Excel
        </button>
      </div>
    </div>
  )
}

function Chip({
  active,
  tone = 'default',
  onClick,
  children,
}: {
  active: boolean
  tone?: 'default' | 'warning'
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
        active
          ? tone === 'warning'
            ? 'border-warning bg-warning/25 text-warning-foreground'
            : 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
