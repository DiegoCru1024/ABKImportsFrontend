"use client"

import { useState, useEffect } from "react"
import { listAllProfitPercentages } from "@/api/quotation-responses"
import type { IProfitPercentage } from "@/api/interface/quotation-response/quotation-response-base"

interface SupplierProfitOption {
  percentage: number
  label: string
}

interface SupplierProfitSelectorProps {
  selectedPercentage?: number
  onSelect?: (percentage: number) => void
  price?: number
  quantity?: number
  variantName?: string
  compact?: boolean
  profitPercentages?: IProfitPercentage[] // Recibir porcentajes como prop opcional
}

export function SupplierProfitSelector({
  selectedPercentage,
  onSelect,
  price = 0,
  quantity = 1,
  variantName = "Variante",
  compact = false,
  profitPercentages,
}: SupplierProfitSelectorProps) {
  const [selected, setSelected] = useState<number | undefined>(selectedPercentage)
  const [profitOptions, setProfitOptions] = useState<SupplierProfitOption[]>([])
  const [loading, setLoading] = useState(!profitPercentages) // Solo cargar si no vienen porcentajes

  // Cargar los porcentajes desde el backend solo si no se proporcionan como prop
  useEffect(() => {
    if (profitPercentages) {
      // Si vienen porcentajes como prop, usarlos directamente y convertir a número
      const options = profitPercentages.map((p: IProfitPercentage) => ({
        percentage: Number(p.percentage),
        label: `${Number(p.percentage)}%`
      }))
      setProfitOptions(options)
      setLoading(false)
    } else {
      // Solo hacer la llamada al backend si no hay porcentajes en props
      const loadProfitPercentages = async () => {
        try {
          setLoading(true)
          const percentages = await listAllProfitPercentages()

          // Convertir IProfitPercentage[] a SupplierProfitOption[] y asegurar que sean números
          const options = percentages.map((p: IProfitPercentage) => ({
            percentage: Number(p.percentage),
            label: `${Number(p.percentage)}%`
          }))

          setProfitOptions(options)
        } catch (error) {
          console.error("Error al cargar porcentajes de ganancia:", error)
          // Valores por defecto en caso de error
          setProfitOptions([
            { percentage: 10, label: "10%" },
            { percentage: 5, label: "5%" },
            { percentage: 2, label: "2%" },
          ])
        } finally {
          setLoading(false)
        }
      }

      loadProfitPercentages()
    }
  }, [profitPercentages])

  // Sincronizar el estado cuando selectedPercentage cambie desde el padre
  useEffect(() => {
    setSelected(selectedPercentage)
  }, [selectedPercentage])

  const handleSelect = (percentage: number) => {
    setSelected(percentage)
    onSelect?.(percentage)
  }

  if (compact) {
    const profitAmount = selected && price > 0 ? (price * quantity * selected) / 100 : 0

    // Mostrar un placeholder mientras carga
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <select disabled className="px-2 py-1 text-sm bg-gray-100 border border-gray-200 rounded cursor-not-allowed">
            <option>Cargando...</option>
          </select>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <select
          value={selected || ""}
          onChange={(e) => handleSelect(Number(e.target.value))}
          className="px-2 py-1 text-sm bg-white border border-gray-200 rounded hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer"
        >
          <option value="">-</option>
          {profitOptions.map((option) => (
            <option key={option.percentage} value={option.percentage}>
              {option.percentage}%
            </option>
          ))}
        </select>
        {selected && price > 0 && (
          <span className="text-sm text-gray-600 whitespace-nowrap">${profitAmount.toFixed(2)}</span>
        )}
      </div>
    )
  }

  // Versión completa con descripción
  if (loading) {
    return (
      <div className="w-full space-y-2">
        <div className="text-center text-sm text-gray-500">Cargando opciones...</div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {profitOptions.map((option) => {
          const isSelected = selected === option.percentage
          const profitAmount = (price * quantity * option.percentage) / 100

          return (
            <button
              key={option.percentage}
              onClick={() => handleSelect(option.percentage)}
              className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="text-left">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-sm text-gray-900">{option.percentage}%</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{option.label}</p>
                {price > 0 && <p className="text-xs font-semibold text-green-600 mt-2">${profitAmount.toFixed(2)}</p>}
              </div>
            </button>
          )
        })}
      </div>

      {selected && price > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-gray-900">{variantName}</span> generará{" "}
            <span className="font-bold text-green-600">${((price * quantity * selected) / 100).toFixed(2)}</span> de ganancia al
            proveedor
          </p>
        </div>
      )}
    </div>
  )
}
