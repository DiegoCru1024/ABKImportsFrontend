import { Card } from '@/components/ui/card'
import React from 'react'
export interface ProductRow {
  name: string
  price: number
  quantity: number
  total: number
  equivalence: number
  importCosts: number
  totalCost: number
  unitCost: number
}
const UnitCostTable = () => {
 
  const factorM = 1.91

  const products: ProductRow[] = [
    {
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

  // Crear filas vacías para completar la tabla
  const emptyRows = Array(12).fill(null)

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
      {products.map((product, index) => (
        <div key={index} className="grid grid-cols-8 text-center text-sm border-b border-gray-300">
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
      </div>
    </Card>
  </div>
  )
}


export default UnitCostTable