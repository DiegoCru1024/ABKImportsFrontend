import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"; // Asegúrate que la ruta sea correcta

// 1. Define las props que recibirá el nuevo componente
interface EditableNumericFieldProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  disabled?: boolean;
}

// 2. Crea el componente con estado local
export const EditableNumericField: React.FC<EditableNumericFieldProps> = ({
  value,
  onChange,
  currency = "USD",
  disabled = false,
}) => {
  // Estado local para manejar el string del input mientras se edita
  const [inputValue, setInputValue] = useState<string>(value.toString());

  // Sincroniza el estado local si el valor externo (prop) cambia
  useEffect(() => {
    // Solo actualiza si el valor numérico no coincide, para evitar loops
    if (Number.parseFloat(inputValue) !== value) {
      setInputValue(value.toString());
    }
  }, [value]);

  // Maneja el cambio en cada pulsación de tecla
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Cuando el usuario hace clic fuera (onBlur), se procesa el valor final
  const handleBlur = () => {
    // Reemplaza coma por punto y convierte a número
    let numericValue = Number.parseFloat(inputValue.replace(",", "."));

    // Si el resultado no es un número válido (ej. input vacío), usa 0
    if (isNaN(numericValue)) {
      numericValue = 0;
    }

    // Llama a la función onChange del componente padre con el número final
    onChange(numericValue);

    // Actualiza el estado local para reflejar el formato numérico final
    setInputValue(numericValue.toString());
  };

  return (
    <Input
      value={inputValue} // ✅ Usa el estado local (string) como valor
      onChange={handleInputChange} // ✅ Actualiza el estado local
      onBlur={handleBlur} // ✅ Procesa el número al perder el foco
      className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
      onFocus={(e) => e.target.select()}
      placeholder="0"
      disabled={disabled}
      // Si quieres el teclado numérico en móviles, puedes añadir type="number"
      // y la clase CSS "no-arrows" que vimos antes.
      type="number"
    />
  );
};
