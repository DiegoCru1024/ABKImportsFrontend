import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
interface ProductRow {
  id: number
  name: string
  price: number
  quantity: number
  total: number
  equivalence: number
  importCosts: number
  totalCost: number
  unitCost: number
}

const EditableUnitCostTable = () => {
  const factorM = 1.91

  const [products, setProducts] = useState<ProductRow[]>([
    {
      id: 1,
      name: "A",
      price: 100.0,
      quantity: 5,
      total: 500.0,
      equivalence: 45,
      importCosts: 454.07,
      totalCost: 954.07,
      unitCost: 190.81,
    },
    {
      id: 2,
      name: "B",
      price: 50.0,
      quantity: 10,
      total: 500.0,
      equivalence: 45,
      importCosts: 454.07,
      totalCost: 954.07,
      unitCost: 95.41,
    },
    {
      id: 3,
      name: "C",
      price: 0.1,
      quantity: 1000,
      total: 100.0,
      equivalence: 9,
      importCosts: 90.81,
      totalCost: 190.81,
      unitCost: 0.19,
    },
  ])

  const updateProduct = (id: number, field: keyof ProductRow, value: string | number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          const updated = { ...product, [field]: value }

          // Recalcular valores dependientes
          if (field === "price" || field === "quantity") {
            updated.total = updated.price * updated.quantity
          }

          return updated
        }
        return product
      }),
    )
  }

  const addProduct = () => {
    const newId = Math.max(...products.map((p) => p.id)) + 1
    setProducts((prev) => [
      ...prev,
      {
        id: newId,
        name: `Producto ${newId}`,
        price: 0,
        quantity: 0,
        total: 0,
        equivalence: 0,
        importCosts: 0,
        totalCost: 0,
        unitCost: 0,
      },
    ])
  }

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  // Calcular totales
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0)
  const totalAmount = products.reduce((sum, product) => sum + product.total, 0)
  const totalImportCosts = products.reduce((sum, product) => sum + product.importCosts, 0)
  const grandTotal = products.reduce((sum, product) => sum + product.totalCost, 0)

  return (
    <div className="p-6 bg-gray-50">
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white flex justify-between items-center px-4 py-3">
          <h2 className="text-lg font-bold text-center flex-1">COSTEO UNITARIO DE IMPORTACIÓN</h2>
          <div className="bg-white text-black px-3 py-1 text-sm font-bold">
            <div className="text-xs">FACTOR M.</div>
            <div>{factorM}</div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="bg-orange-500 text-white grid grid-cols-9 text-center text-sm font-semibold">
          <div className="p-2 border-r border-orange-400">NOMBRE/PRODUCTO</div>
          <div className="p-2 border-r border-orange-400">PRECIO</div>
          <div className="p-2 border-r border-orange-400">QTY/UND</div>
          <div className="p-2 border-r border-orange-400">TOTAL $</div>
          <div className="p-2 border-r border-orange-400">EQUIVALENCIA %</div>
          <div className="p-2 border-r border-orange-400">GASTOS IMP</div>
          <div className="p-2 border-r border-orange-400">COSTO T.</div>
          <div className="p-2 border-r border-orange-400">COSTO UNITARIO</div>
          <div className="p-2">ACCIONES</div>
        </div>

        {/* Product Rows */}
        {products.map((product) => (
          <div key={product.id} className="grid grid-cols-9 text-center text-sm border-b border-gray-300">
            <div className="p-2 border-r border-gray-300 bg-gray-100">
              <Input
                value={product.name}
                onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                className="text-center text-xs h-8"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <Input
                type="number"
                value={product.price}
                onChange={(e) => updateProduct(product.id, "price", Number.parseFloat(e.target.value) || 0)}
                className="text-center text-xs h-8"
                step="0.01"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <Input
                type="number"
                value={product.quantity}
                onChange={(e) => updateProduct(product.id, "quantity", Number.parseInt(e.target.value) || 0)}
                className="text-center text-xs h-8"
              />
            </div>
            <div className="p-2 border-r border-gray-300 flex items-center justify-center">
              <span className="text-xs mr-1">USD</span>
              {product.total.toFixed(2)}
            </div>
            <div className="p-2 border-r border-gray-300">
              <Input
                type="number"
                value={product.equivalence}
                onChange={(e) => updateProduct(product.id, "equivalence", Number.parseFloat(e.target.value) || 0)}
                className="text-center text-xs h-8"
                step="0.1"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <Input
                type="number"
                value={product.importCosts}
                onChange={(e) => updateProduct(product.id, "importCosts", Number.parseFloat(e.target.value) || 0)}
                className="text-center text-xs h-8"
                step="0.01"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <Input
                type="number"
                value={product.totalCost}
                onChange={(e) => updateProduct(product.id, "totalCost", Number.parseFloat(e.target.value) || 0)}
                className="text-center text-xs h-8"
                step="0.01"
              />
            </div>
            <div className="p-2 border-r border-gray-300">
              <Input
                type="number"
                value={product.unitCost}
                onChange={(e) => updateProduct(product.id, "unitCost", Number.parseFloat(e.target.value) || 0)}
                className="text-center text-xs h-8"
                step="0.01"
              />
            </div>
            <div className="p-2">
              <Button
                onClick={() => removeProduct(product.id)}
                variant="destructive"
                size="sm"
                className="h-6 w-6 p-0 text-xs"
              >
                ×
              </Button>
            </div>
          </div>
        ))}

        {/* Add Product Button */}
        <div className="p-4 text-center border-b border-gray-300">
          <Button onClick={addProduct} variant="outline" size="sm">
            + Agregar Producto
          </Button>
        </div>

        {/* Totals Row */}
        <div className="bg-orange-500 text-white grid grid-cols-9 text-center text-sm font-bold">
          <div className="p-3 border-r border-orange-400"></div>
          <div className="p-3 border-r border-orange-400">{totalQuantity}</div>
          <div className="p-3 border-r border-orange-400">
            <span className="text-xs mr-1">USD</span>
            {totalAmount.toFixed(2)}
          </div>
          <div className="p-3 border-r border-orange-400">100%</div>
          <div className="p-3 border-r border-orange-400">
            <span className="text-xs mr-1">USD</span>
            {totalImportCosts.toFixed(2)}
          </div>
          <div className="p-3 border-r border-orange-400">
            <span className="text-xs mr-1">USD</span>
            {grandTotal.toFixed(2)}
          </div>
          <div className="p-3"></div>
          <div className="p-3"></div>
        </div>
      </Card>
    </div>
  )
}

export default EditableUnitCostTable