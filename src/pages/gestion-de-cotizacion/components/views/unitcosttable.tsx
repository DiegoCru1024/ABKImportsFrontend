import { Card } from '@/components/ui/card'
import React from 'react'
import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface"

export interface ProductRow {
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

interface UnitCostTableProps {
  products?: ProductoResponseIdInterface[]
  totalImportCosts?: number
}

const UnitCostTable: React.FC<UnitCostTableProps> = ({ products = [], totalImportCosts = 998.94 }) => {
  const factorM = 1.91

  // Convertir los productos del endpoint a ProductRow
  const productRows: ProductRow[] = products.map((product, index) => {
    const price = 0 // Este valor deberá ser ingresado por el usuario
    const total = price * product.quantity
    
    // Calcular equivalencia como porcentaje del total comercial
    const totalCommercialValue = products.reduce((sum, p) => sum + (0 * p.quantity), 0) || 1
    const equivalence = totalCommercialValue > 0 ? (total / totalCommercialValue) * 100 : 0
    
    // Calcular gastos de importación proporcionales
    const importCosts = (equivalence / 100) * totalImportCosts
    const totalCost = total + importCosts
    const unitCost = product.quantity > 0 ? totalCost / product.quantity : 0

    return {
      id: product.id,
      name: product.name,
      price,
      quantity: product.quantity,
      total,
      equivalence: Math.round(equivalence),
      importCosts,
      totalCost,
      unitCost,
    }
  })

  // Si no hay productos del endpoint, usar productos de ejemplo
  const defaultProducts: ProductRow[] = [
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

  const displayProducts = productRows.length > 0 ? productRows : defaultProducts

  // Crear filas vacías para completar la tabla
  const emptyRowsCount = Math.max(0, 12 - displayProducts.length)
  const emptyRows = Array(emptyRowsCount).fill(null)

  // Calcular totales
  const totalQuantity = displayProducts.reduce((sum, product) => sum + product.quantity, 0)
  const totalAmount = displayProducts.reduce((sum, product) => sum + product.total, 0)
  const totalImportCostsSum = displayProducts.reduce((sum, product) => sum + product.importCosts, 0)
  const grandTotal = displayProducts.reduce((sum, product) => sum + product.totalCost, 0)

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
      <div className="bg-orange-500 text-white grid grid-cols-8 text-center text-sm font-semibold">
        <div className="p-2 border-r border-orange-400">NOMBRE/PRODUCTO</div>
        <div className="p-2 border-r border-orange-400">PRECIO</div>
        <div className="p-2 border-r border-orange-400">QTY/UND</div>
        <div className="p-2 border-r border-orange-400">TOTAL $</div>
        <div className="p-2 border-r border-orange-400">EQUIVALENCIA %</div>
        <div className="p-2 border-r border-orange-400">GASTOS IMP</div>
        <div className="p-2 border-r border-orange-400">COSTO T.</div>
        <div className="p-2">COSTO UNITARIO</div>
      </div>

      {/* Product Rows */}
      {displayProducts.map((product) => (
        <div key={product.id} className="grid grid-cols-8 text-center text-sm border-b border-gray-300">
          <div className="p-2 border-r border-gray-300 bg-gray-100 font-semibold">{product.name}</div>
          <div className="p-2 border-r border-gray-300">
            <span className="text-xs mr-1">USD</span>
            {product.price.toFixed(2)}
          </div>
          <div className="p-2 border-r border-gray-300">{product.quantity}</div>
          <div className="p-2 border-r border-gray-300">
            <span className="text-xs mr-1">USD</span>
            {product.total.toFixed(2)}
          </div>
          <div className="p-2 border-r border-gray-300">{product.equivalence}%</div>
          <div className="p-2 border-r border-gray-300">
            <span className="text-xs mr-1">USD</span>
            {product.importCosts.toFixed(2)}
          </div>
          <div className="p-2 border-r border-gray-300">
            <span className="text-xs mr-1">USD</span>
            {product.totalCost.toFixed(2)}
          </div>
          <div className="p-2">
            <span className="text-xs mr-1">USD</span>
            {product.unitCost.toFixed(2)}
          </div>
        </div>
      ))}

      {/* Empty Rows */}
      {emptyRows.map((_, index) => (
        <div key={`empty-${index}`} className="grid grid-cols-8 text-center text-sm border-b border-gray-300">
          <div className="p-2 border-r border-gray-300 bg-gray-100"></div>
          <div className="p-2 border-r border-gray-300"></div>
          <div className="p-2 border-r border-gray-300"></div>
          <div className="p-2 border-r border-gray-300">
            <span className="text-xs mr-1">USD</span>-
          </div>
          <div className="p-2 border-r border-gray-300">0%</div>
          <div className="p-2 border-r border-gray-300">
            <span className="text-xs mr-1">USD</span>-
          </div>
          <div className="p-2 border-r border-gray-300">
            <span className="text-xs mr-1">USD</span>-
          </div>
          <div className="p-2">
            <span className="text-xs mr-1">USD</span>-
          </div>
        </div>
      ))}

      {/* Totals Row */}
      <div className="bg-orange-500 text-white grid grid-cols-8 text-center text-sm font-bold">
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
      </div>
    </Card>
  </div>
  )
}

export default UnitCostTable