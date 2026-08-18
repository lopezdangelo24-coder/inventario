'use client'

import { useEffect, useState } from 'react'
import { Modal } from './modal'
import { Field, SelectInput, TextInput } from './form-fields'
import { Button } from '@/components/ui/button'
import { CATEGORIES, type Product, type ProductDraft } from '@/lib/types'

const EMPTY: ProductDraft = {
  sku: '',
  barcode: '',
  name: '',
  brand: '',
  category: 'Filtros',
  filterType: '',
  measurements: '',
  weightKg: 0,
  minimumStock: 0,
  currentStock: 0,
  location: '',
}

export function ProductFormModal({
  open,
  onClose,
  onSubmit,
  editing,
  prefillCode,
  knownBrands,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (draft: ProductDraft, id?: number) => void
  editing?: Product | null
  prefillCode?: string
  knownBrands: string[]
}) {
  const [form, setForm] = useState<ProductDraft>(EMPTY)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id, ...rest } = editing
      void id
      setForm(rest)
    } else {
      // Al escanear un código inexistente, precargamos SKU o código de barras.
      const code = prefillCode ?? ''
      const isBarcode = /^\d{6,}$/.test(code)
      setForm({
        ...EMPTY,
        barcode: isBarcode ? code : '',
        sku: isBarcode ? '' : code,
      })
    }
  }, [open, editing, prefillCode])

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sku.trim() || !form.brand.trim() || !form.name.trim()) return
    onSubmit(
      {
        ...form,
        sku: form.sku.trim(),
        brand: form.brand.trim(),
        name: form.name.trim(),
      },
      editing?.id,
    )
  }

  const valid = form.sku.trim() && form.brand.trim() && form.name.trim()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Editar producto' : 'Agregar nuevo SKU'}
      description={
        editing
          ? `${editing.sku} · ${editing.brand}`
          : 'Un mismo SKU puede repetirse en distintas marcas.'
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SKU (catálogo)" htmlFor="f-sku" hint="Puede repetirse entre marcas.">
            <TextInput
              id="f-sku"
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="A1519"
              autoCapitalize="characters"
              required
            />
          </Field>
          <Field label="Código de barras / QR" htmlFor="f-barcode">
            <TextInput
              id="f-barcode"
              value={form.barcode}
              onChange={(e) => set('barcode', e.target.value)}
              placeholder="7701234561024"
              inputMode="numeric"
            />
          </Field>
        </div>

        <Field label="Nombre del producto" htmlFor="f-name">
          <TextInput
            id="f-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Filtro de aceite M20"
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Marca" htmlFor="f-brand" hint="Campo crítico para diferenciar el SKU.">
            <TextInput
              id="f-brand"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              placeholder="Donaldson"
              list="known-brands"
              required
            />
            <datalist id="known-brands">
              {knownBrands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Field>
          <Field label="Categoría" htmlFor="f-category">
            <SelectInput
              id="f-category"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo / Subcategoría" htmlFor="f-type">
            <TextInput
              id="f-type"
              value={form.filterType}
              onChange={(e) => set('filterType', e.target.value)}
              placeholder="Aceite"
            />
          </Field>
          <Field label="Medidas" htmlFor="f-meas">
            <TextInput
              id="f-meas"
              value={form.measurements}
              onChange={(e) => set('measurements', e.target.value)}
              placeholder="Ø 76 × 90 mm"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Peso (Kg)" htmlFor="f-weight">
            <TextInput
              id="f-weight"
              type="number"
              step="0.01"
              min="0"
              value={form.weightKg}
              onChange={(e) => set('weightKg', Number(e.target.value))}
            />
          </Field>
          <Field label="Stock mín." htmlFor="f-min">
            <TextInput
              id="f-min"
              type="number"
              min="0"
              value={form.minimumStock}
              onChange={(e) => set('minimumStock', Number(e.target.value))}
            />
          </Field>
          <Field label="Stock actual" htmlFor="f-cur">
            <TextInput
              id="f-cur"
              type="number"
              min="0"
              value={form.currentStock}
              onChange={(e) => set('currentStock', Number(e.target.value))}
            />
          </Field>
          <Field label="Ubicación" htmlFor="f-loc">
            <TextInput
              id="f-loc"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="A-01-03"
              autoCapitalize="characters"
            />
          </Field>
        </div>

        <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" size="lg" onClick={onClose} className="h-11">
            Cancelar
          </Button>
          <button
            type="submit"
            disabled={!valid}
            className="h-11 rounded-lg bg-gold-gradient px-6 text-sm font-bold text-gold-foreground shadow-sm transition-all hover:brightness-105 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
          >
            {editing ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
