export interface Product {
  id: number
  /** Código de catálogo corto — puede repetirse entre marcas distintas */
  sku: string
  /** Código de barras EAN / QR (único por producto físico) */
  barcode: string
  name: string
  /** Marca — campo crítico para diferenciar SKU repetidos */
  brand: string
  category: string
  /** Tipo / subcategoría */
  filterType: string
  measurements: string
  weightKg: number
  minimumStock: number
  currentStock: number
  location: string
}

export type ProductDraft = Omit<Product, 'id'>

export type MovementType = 'in' | 'out'

export interface Movement {
  id: number
  productId: number
  sku: string
  brand: string
  name: string
  type: MovementType
  quantity: number
  /** Stock resultante tras el movimiento */
  resultingStock: number
  timestamp: number
  note?: string
}

export const CATEGORIES = [
  'Filtros',
  'Frenos',
  'Motor',
  'Suspensión',
  'Eléctrico',
  'Genéricos',
] as const

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    sku: 'A1519',
    barcode: '7701234561024',
    name: 'Filtro de aceite',
    brand: 'Donaldson',
    category: 'Filtros',
    filterType: 'Aceite',
    measurements: 'Ø 76 × 90 mm',
    weightKg: 0.42,
    minimumStock: 12,
    currentStock: 38,
    location: 'A-01-03',
  },
  {
    id: 2,
    sku: 'A1519',
    barcode: '7701234561025',
    name: 'Filtro de aceite',
    brand: 'Fleetguard',
    category: 'Filtros',
    filterType: 'Aceite',
    measurements: 'Ø 76 × 90 mm',
    weightKg: 0.44,
    minimumStock: 10,
    currentStock: 15,
    location: 'A-01-04',
  },
  {
    id: 3,
    sku: 'PF-8052',
    barcode: '7701234568052',
    name: 'Pastillas de Freno',
    brand: 'Bosch',
    category: 'Frenos',
    filterType: 'Pastilla Delantera',
    measurements: '134.5 x 57 mm',
    weightKg: 1.15,
    minimumStock: 5,
    currentStock: 14,
    location: 'B-04-02',
  },
]
