import { InventoryProvider } from '@/components/inventory-store'
import { Dashboard } from '@/components/dashboard'

export default function Page() {
  return (
    <InventoryProvider>
      <Dashboard />
    </InventoryProvider>
  )
}
