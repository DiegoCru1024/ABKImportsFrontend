import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface"

interface ProductRow {
  id: string
  name: string
  price: number
  quantity: number
  total: number
  equivalence: number
  importCosts: number
  totalCost: number
  unitCost: number
}

interface EditableUnitCostTableProps {
  products?: ProductoResponseIdInterface[]
  totalImportCosts?: number
  onCommercialValueChange?: (value: number) => void
}

const EditableUnitCostTable: React.FC<EditableUnitCostTableProps> = ({ 
  products = [], 
  totalImportCosts = 998.94,
  onCommercialValueChange 
}) => {
  const factorM = 1.91

  // Estado inicial basado en los productos del endpoint
  const getInitialProducts = (): ProductRow[] => {
    if (products.length > 0) {
      return products.map((product) => ({
        id: product.id,
        name: product.name,
        price: 0, // El usuario debe ingresar este valor
        quantity: product.quantity,
        total: 0,
        equivalence: 0,
        importCosts: 0,
        totalCost: 0,
        unitCost: 0,
      }))
    }
    
    // Productos por defecto si no hay datos del endpoint
    return [
      {
        id: "1",
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
        id: "2",
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
        id: "3",
        name: "C",
        price: 0.1,
        quantity: 1000,
        total: 100.0,
        equivalence: 9,
        importCosts: 90.81,
        totalCost: 190.81,
        unitCost: 0.19,
      },
    ]
  }

  const [productsList, setProductsList] = useState<ProductRow[]>(getInitialProducts())

  // Recalcular todos los valores cuando cambien los productos
  const recalculateProducts = (updatedProducts: ProductRow[]) => {
    const totalCommercialValue = updatedProducts.reduce((sum, product) => sum + product.total, 0)
    
    const recalculatedProducts = updatedProducts.map(product => {
      const equivalence = totalCommercialValue > 0 ? (product.total / totalCommercialValue) * 100 : 0
      const importCosts = (equivalence / 100) * totalImportCosts
      const totalCost = product.total + importCosts
      const unitCost = product.quantity > 0 ? totalCost / product.quantity : 0

      return {
        ...product,
        equivalence: Math.round(equivalence),
        importCosts,
        totalCost,
        unitCost,
      }
    })

    // Notificar cambio del valor comercial total al componente padre
    if (onCommercialValueChange) {
      onCommercialValueChange(totalCommercialValue)
    }

    return recalculatedProducts
  }

  // Actualizar producto y recalcular
  const updateProduct = (id: string, field: keyof ProductRow, value: string | number) => {
    setProductsList((prev) => {
      const updated = prev.map((product) => {
        if (product.id === id) {
          const updatedProduct = { ...product, [field]: value }

          // Recalcular total cuando cambie precio o cantidad
          if (field === "price" || field === "quantity") {
            updatedProduct.total = updatedProduct.price * updatedProduct.quantity
          }

          return updatedProduct
        }
        return product
      })

      return recalculateProducts(updated)
    })
  }

  const addProduct = () => {
    const newId = `new-${Date.now()}`
    setProductsList((prev) => {
      const newProducts = [
        ...prev,
        {
          id: newId,
          name: `Producto ${prev.length + 1}`,
          price: 0,
          quantity: 0,
          total: 0,
          equivalence: 0,
          importCosts: 0,
          totalCost: 0,
          unitCost: 0,
        },
      ]
      return recalculateProducts(newProducts)
    })
  }

  const removeProduct = (id: string) => {
    setProductsList((prev) => {
      const filtered = prev.filter((p) => p.id !== id)
      return recalculateProducts(filtered)
    })
  }

  // Actualizar productos cuando cambien los props
  useEffect(() => {
    if (products.length > 0) {
      const initialProducts = getInitialProducts()
      setProductsList(recalculateProducts(initialProducts))
    }
  }, [products, totalImportCosts])

  // Calcular totales
  const totalQuantity = productsList.reduce((sum, product) => sum + product.quantity, 0)
  const totalAmount = productsList.reduce((sum, product) => sum + product.total, 0)
  const totalImportCostsSum = productsList.reduce((sum, product) => sum + product.importCosts, 0)
  const grandTotal = productsList.reduce((sum, product) => sum + product.totalCost, 0)

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
        {productsList.map((product) => (
          <div key={product.id} className="grid grid-cols-9 text-center text-sm border-b border-gray-300">
            <div className="p-2 border-r border-gray-300 bg-gray-100">
              <Input
                value={product.name}
                onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                className="text-center text-xs h-8"
                readOnly={products.length > 0} // Solo lectura si viene del endpoint
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
                readOnly={products.length > 0} // Solo lectura si viene del endpoint
              />
            </div>
            <div className="p-2 border-r border-gray-300 flex items-center justify-center">
              <span className="text-xs mr-1">USD</span>
              {product.total.toFixed(2)}
            </div>
            <div className="p-2 border-r border-gray-300 flex items-center justify-center">
              {product.equivalence}%
            </div>
            <div className="p-2 border-r border-gray-300 flex items-center justify-center">
              <span className="text-xs mr-1">USD</span>
              {product.importCosts.toFixed(2)}
            </div>
            <div className="p-2 border-r border-gray-300 flex items-center justify-center">
              <span className="text-xs mr-1">USD</span>
              {product.totalCost.toFixed(2)}
            </div>
            <div className="p-2 border-r border-gray-300 flex items-center justify-center">
              <span className="text-xs mr-1">USD</span>
              {product.unitCost.toFixed(2)}
            </div>
            <div className="p-2">
              <Button
                onClick={() => removeProduct(product.id)}
                variant="destructive"
                size="sm"
                className="h-6 w-6 p-0 text-xs"
                disabled={products.length > 0} // Deshabilitar si viene del endpoint
              >
                ×
              </Button>
            </div>
          </div>
        ))}

        {/* Add Product Button */}
        {products.length === 0 && (
          <div className="p-4 text-center border-b border-gray-300">
            <Button onClick={addProduct} variant="outline" size="sm">
              + Agregar Producto
            </Button>
          </div>
        )}

        {/* Totals Row */}
        <div className="bg-orange-500 text-white grid grid-cols-9 text-center text-sm font-bold">
          <div className="p-3 border-r border-orange-400">TOTALES</div>
          <div className="p-3 border-r border-orange-400"></div>
          <div className="p-3 border-r border-orange-400">{totalQuantity}</div>
          <div className="p-3 border-r border-orange-400">
            <span className="text-xs mr-1">USD</span>
            {totalAmount.toFixed(2)}
          </div>
          <div className="p-3 border-r border-orange-400">100%</div>
          <div className="p-3 border-r border-orange-400">
            <span className="text-xs mr-1">USD</span>
            {totalImportCostsSum.toFixed(2)}
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