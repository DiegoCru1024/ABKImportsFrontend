import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import "./editable-inputs.css";

interface EditableNumericFieldProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
}

export const EditableNumericField: React.FC<EditableNumericFieldProps> = ({
  value,
  onChange,
  currency = "USD",
  disabled = false,
  step = 0.01,
  min,
  max,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para formatear números
  const formatNumber = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) return "0";
    return num.toString();
  };

  // Inicializar el valor cuando el componente se monta o cambia el valor externo
  useEffect(() => {
    if (!isEditing) {
      setInputValue(formatNumber(value || 0));
    }
  }, [value, isEditing]);

  // Maneja el cambio en cada pulsación de tecla
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Permitir valores vacíos, números, puntos y comas
    // También permitir múltiples dígitos después del punto decimal
    if (newValue === "" || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      setInputValue(newValue);
    }
  };

  // Cuando el usuario hace clic fuera (onBlur), se procesa el valor final
  const handleBlur = () => {
    setIsEditing(false);
    
    // Si el input está vacío o solo tiene un punto, usar 0
    if (inputValue === "" || inputValue === ".") {
      setInputValue("0");
      onChange(0);
      return;
    }

    // Convertir a número, permitiendo valores flotantes
    let numericValue = parseFloat(inputValue);
    
    // Si no es un número válido, usar 0
    if (isNaN(numericValue) || !isFinite(numericValue)) {
      numericValue = 0;
    }

    // Aplicar límites si están definidos
    if (min !== undefined && numericValue < min) {
      numericValue = min;
    }
    if (max !== undefined && numericValue > max) {
      numericValue = max;
    }

    // Formatear el valor final
    const formattedValue = formatNumber(numericValue);
    setInputValue(formattedValue);
    
    // Solo llamar onChange si el valor realmente cambió
    if (Math.abs(numericValue - (value || 0)) > 0.001) {
      onChange(numericValue);
    }
  };

  // Cuando el usuario hace focus, entrar en modo edición
  const handleFocus = () => {
    setIsEditing(true);
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  // Manejar tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={`editable-numeric-input text-center font-semibold px-3 py-1 w-full h-9 text-sm ${isEditing ? 'editing' : ''}`}
      placeholder="0"
      disabled={disabled}
      // Usar text en lugar de number para permitir mejor control
      type="text"
      inputMode="decimal"
      step={step}
      min={min}
      max={max}
    />
  );
};
