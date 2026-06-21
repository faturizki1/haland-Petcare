import { getProducts, getServices, getStockMutations } from "@/lib/actions/inventory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryProductsTab } from "./products-tab"
import { InventoryServicesTab } from "./services-tab"
import { InventoryMutationsTab } from "./mutations-tab"

export default async function OwnerInventoryPage() {
  const [products, services, mutations] = await Promise.all([
    getProducts(),
    getServices(),
    getStockMutations(),
  ])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Inventory</h1>
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="services">Layanan</TabsTrigger>
          <TabsTrigger value="mutations">Mutasi Stok</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-4">
          <InventoryProductsTab initialData={products} />
        </TabsContent>
        <TabsContent value="services" className="mt-4">
          <InventoryServicesTab initialData={services} />
        </TabsContent>
        <TabsContent value="mutations" className="mt-4">
          <InventoryMutationsTab initialData={mutations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
