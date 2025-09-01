import React, { useState } from "react";
import { EditableNumericField } from "./editableNumberFieldProps";

const TestEditableField: React.FC = () => {
  const [price, setPrice] = useState<number>(12.5);
  const [quantity, setQuantity] = useState<number>(10);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold">Prueba de EditableNumericField</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Precio:</label>
        <EditableNumericField
          value={price}
          onChange={setPrice}
          step={0.01}
          min={0}
        />
        <p className="text-sm text-gray-600">Valor actual: {price}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Cantidad:</label>
        <EditableNumericField
          value={quantity}
          onChange={setQuantity}
          step={1}
          min={0}
        />
        <p className="text-sm text-gray-600">Valor actual: {quantity}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Total calculado:</label>
        <p className="text-lg font-bold">{(price * quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default TestEditableField;
