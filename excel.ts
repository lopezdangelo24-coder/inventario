import * as XLSX from 'xlsx'
import type { Product, ProductDraft } from './types'

/** Cabeceras del Excel — el orden refleja la estructura oficial de Muscargo. */
const HEADERS = [
  'ID',
  'SKU',
  'Codigo de Barras',
  'Nombre',
  'Marca',
  'Categoria',
  'Tipo',
  'Medidas',
  'Peso Kg',
  'Stock Minimo',
  'Stock Actual',
  'Ubicacion',
] as const

function productToRow(p: Product) {
  return {
    ID: p.id,
    SKU: p.sku,
    'Codigo de Barras': p.barcode,
    Nombre: p.name,
    Marca: p.brand,
    Categoria: p.category,
    Tipo: p.filterType,
    Medidas: p.measurements,
    'Peso Kg': p.weightKg,
    'Stock Minimo': p.minimumStock,
    'Stock Actual': p.currentStock,
    Ubicacion: p.location,
  }
}

export function exportToExcel(products: Product[]) {
  const rows = products.map(productToRow)
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...HEADERS] })
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 18 },
    { wch: 26 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario')
  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `Muscargo_Inventario_${stamp}.xlsx`)
}

/** Descarga una plantilla vacía con las cabeceras correctas. */
export function downloadTemplate() {
  const worksheet = XLSX.utils.json_to_sheet([], { header: [...HEADERS] })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario')
  XLSX.writeFile(workbook, 'Muscargo_Plantilla_Inventario.xlsx')
}

// Aliases tolerantes para mapear distintos nombres de columna.
const FIELD_ALIASES: Record<keyof ProductDraft, string[]> = {
  sku: ['sku', 'codigo', 'código', 'codigo catalogo'],
  barcode: ['codigo de barras', 'código de barras', 'barcode', 'ean', 'qr'],
  name: ['nombre', 'nombre del producto', 'name', 'producto'],
  brand: ['marca', 'brand'],
  category: ['categoria', 'categoría', 'category', 'categoria principal'],
  filterType: ['tipo', 'subcategoria', 'subcategoría', 'filtertype', 'tipo/subcategoria'],
  measurements: ['medidas', 'measurements', 'medida'],
  weightKg: ['peso kg', 'peso', 'weightkg', 'weight', 'kg'],
  minimumStock: ['stock minimo', 'stock mínimo', 'minimumstock', 'min', 'minimo'],
  currentStock: ['stock actual', 'currentstock', 'stock', 'actual'],
  location: ['ubicacion', 'ubicación', 'location', 'posicion', 'posición'],
}

function normalize(key: string) {
  return key.trim().toLowerCase()
}

function pick(row: Record<string, unknown>, field: keyof ProductDraft): unknown {
  const aliases = FIELD_ALIASES[field]
  const entries = Object.entries(row)
  for (const [rawKey, value] of entries) {
    if (aliases.includes(normalize(rawKey))) return value
  }
  return undefined
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function toText(value: unknown): string {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

export interface ImportResult {
  drafts: ProductDraft[]
  skipped: number
}

export async function parseExcelFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.SheetNames[0]
  if (!firstSheet) return { drafts: [], skipped: 0 }
  const worksheet = workbook.Sheets[firstSheet]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
  })

  const drafts: ProductDraft[] = []
  let skipped = 0

  for (const row of rows) {
    const sku = toText(pick(row, 'sku'))
    const name = toText(pick(row, 'name'))
    const brand = toText(pick(row, 'brand'))
    // Requiere al menos SKU + Marca (o Nombre) para ser una fila válida.
    if (!sku || (!brand && !name)) {
      skipped++
      continue
    }
    drafts.push({
      sku,
      barcode: toText(pick(row, 'barcode')),
      name: name || sku,
      brand: brand || 'Sin marca',
      category: toText(pick(row, 'category')) || 'Genéricos',
      filterType: toText(pick(row, 'filterType')),
      measurements: toText(pick(row, 'measurements')),
      weightKg: toNumber(pick(row, 'weightKg'), 0),
      minimumStock: Math.max(0, Math.round(toNumber(pick(row, 'minimumStock'), 0))),
      currentStock: Math.max(0, Math.round(toNumber(pick(row, 'currentStock'), 0))),
      location: toText(pick(row, 'location')),
    })
  }

  return { drafts, skipped }
}
