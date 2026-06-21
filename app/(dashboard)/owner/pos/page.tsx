import { getProducts, getServices } from "@/lib/actions/inventory"
import { POSPage } from "./pos-page"

export default async function OwnerPOSPage() {
  const [products, services] = await Promise.all([
    getProducts(),
    getServices(),
  ])

  const activeProducts = products.filter((p) => p.is_active)
  const activeServices = services.filter((s) => s.is_active)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Point of Sale</h1>
      <POSPage products={activeProducts} services={activeServices} />
    </div>
  )
}
