'use client'

import { InventoryProvider } from '../inventory-store'
import Dashboard from '../dashboard'

export default function Home() {
  return (
    <InventoryProvider>
      <Dashboard />
    </InventoryProvider>
  )
}
