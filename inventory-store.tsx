'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  INITIAL_PRODUCTS,
  type Movement,
  type MovementType,
  type Product,
  type ProductDraft,
} from '@/lib/types'

const STORAGE_KEY = 'muscargo:inventory:v1'
const MOVEMENTS_KEY = 'muscargo:movements:v1'

interface PersistShape {
  products: Product[]
  seq: number
}

interface InventoryContextValue {
  products: Product[]
  movements: Movement[]
  ready: boolean
  /** Todas las variantes (marcas) que comparten un SKU dado. */
  findBySku: (sku: string) => Product[]
  /** Coincidencia por SKU o código de barras (para el escáner). */
  findByCode: (code: string) => Product[]
  getById: (id: number) => Product | undefined
  addProduct: (draft: ProductDraft) => Product
  updateProduct: (id: number, draft: ProductDraft) => void
  deleteProduct: (id: number) => void
  registerMovement: (id: number, type: MovementType, quantity: number, note?: string) => void
  importProducts: (drafts: ProductDraft[]) => { added: number; updated: number }
  resetToSeed: () => void
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

function loadProducts(): PersistShape {
  if (typeof window === 'undefined') {
    return { products: INITIAL_PRODUCTS, seq: INITIAL_PRODUCTS.length }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistShape
      if (Array.isArray(parsed.products)) return parsed
    }
  } catch {
    /* ignore */
  }
  return { products: INITIAL_PRODUCTS, seq: INITIAL_PRODUCTS.length }
}

function loadMovements(): Movement[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MOVEMENTS_KEY)
    if (raw) return JSON.parse(raw) as Movement[]
  } catch {
    /* ignore */
  }
  return []
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [ready, setReady] = useState(false)
  const seqRef = useRef(0)
  const movSeqRef = useRef(0)

  // Hidratación desde localStorage.
  useEffect(() => {
    const loaded = loadProducts()
    setProducts(loaded.products)
    seqRef.current = Math.max(loaded.seq, ...loaded.products.map((p) => p.id), 0)
    const movs = loadMovements()
    setMovements(movs)
    movSeqRef.current = Math.max(0, ...movs.map((m) => m.id))
    setReady(true)
  }, [])

  // Persistencia.
  useEffect(() => {
    if (!ready) return
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ products, seq: seqRef.current } satisfies PersistShape),
    )
  }, [products, ready])

  useEffect(() => {
    if (!ready) return
    window.localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements.slice(0, 200)))
  }, [movements, ready])

  const findBySku = useCallback(
    (sku: string) => {
      const norm = sku.trim().toLowerCase()
      return products.filter((p) => p.sku.toLowerCase() === norm)
    },
    [products],
  )

  const findByCode = useCallback(
    (code: string) => {
      const norm = code.trim().toLowerCase()
      if (!norm) return []
      const byBarcode = products.filter((p) => p.barcode.toLowerCase() === norm)
      if (byBarcode.length) return byBarcode
      return products.filter((p) => p.sku.toLowerCase() === norm)
    },
    [products],
  )

  const getById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products],
  )

  const addProduct = useCallback((draft: ProductDraft) => {
    const id = ++seqRef.current
    const product: Product = { id, ...draft }
    setProducts((prev) => [product, ...prev])
    return product
  }, [])

  const updateProduct = useCallback((id: number, draft: ProductDraft) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...draft, id } : p)))
  }, [])

  const deleteProduct = useCallback((id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const registerMovement = useCallback(
    (id: number, type: MovementType, quantity: number, note?: string) => {
      const qty = Math.max(1, Math.round(quantity))
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const delta = type === 'in' ? qty : -qty
          const nextStock = Math.max(0, p.currentStock + delta)
          const movement: Movement = {
            id: ++movSeqRef.current,
            productId: p.id,
            sku: p.sku,
            brand: p.brand,
            name: p.name,
            type,
            quantity: qty,
            resultingStock: nextStock,
            timestamp: Date.now(),
            note,
          }
          setMovements((m) => [movement, ...m])
          return { ...p, currentStock: nextStock }
        }),
      )
    },
    [],
  )

  const importProducts = useCallback((drafts: ProductDraft[]) => {
    let added = 0
    let updated = 0
    setProducts((prev) => {
      const next = [...prev]
      for (const draft of drafts) {
        // Coincidencia por SKU + Marca (clave lógica) o por código de barras.
        const idx = next.findIndex(
          (p) =>
            (p.sku.toLowerCase() === draft.sku.toLowerCase() &&
              p.brand.toLowerCase() === draft.brand.toLowerCase()) ||
            (!!draft.barcode && p.barcode.toLowerCase() === draft.barcode.toLowerCase()),
        )
        if (idx >= 0) {
          next[idx] = { ...next[idx], ...draft, id: next[idx].id }
          updated++
        } else {
          next.unshift({ id: ++seqRef.current, ...draft })
          added++
        }
      }
      return next
    })
    return { added, updated }
  }, [])

  const resetToSeed = useCallback(() => {
    setProducts(INITIAL_PRODUCTS)
    setMovements([])
    seqRef.current = INITIAL_PRODUCTS.length
    movSeqRef.current = 0
  }, [])

  const value = useMemo<InventoryContextValue>(
    () => ({
      products,
      movements,
      ready,
      findBySku,
      findByCode,
      getById,
      addProduct,
      updateProduct,
      deleteProduct,
      registerMovement,
      importProducts,
      resetToSeed,
    }),
    [
      products,
      movements,
      ready,
      findBySku,
      findByCode,
      getById,
      addProduct,
      updateProduct,
      deleteProduct,
      registerMovement,
      importProducts,
      resetToSeed,
    ],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
  return ctx
}
