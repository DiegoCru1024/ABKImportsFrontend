import { Trash2, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import type { ProductVariant } from "../../utils/types/local.types";

interface VariantRowProps {
  variant: ProductVariant;
  index: number;
  canDelete: boolean;
  onUpdate: (
    id: string,
    field: keyof ProductVariant,
    value: string | number | File[] | string[]
  ) => void;
  onDelete: (id: string) => void;
}

export const VariantRow = ({
  variant,
  index,
  canDelete,
  onUpdate,
  onDelete,
}: VariantRowProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(variant.files || []);
  const [existingUrls, setExistingUrls] = useState<string[]>(variant.attachments || []);

  // Sincronizar con cambios externos (cuando se edita un producto)
  useEffect(() => {
    setSelectedFiles(variant.files || []);
    setExistingUrls(variant.attachments || []);
  }, [variant.files, variant.attachments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    onUpdate(variant.id, "files", updatedFiles);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updatedFiles);
    onUpdate(variant.id, "files", updatedFiles);
  };

  const handleRemoveUrl = (indexToRemove: number) => {
    const updatedUrls = existingUrls.filter((_, idx) => idx !== indexToRemove);
    setExistingUrls(updatedUrls);
    onUpdate(variant.id, "attachments", updatedUrls);
  };

  const totalImages = existingUrls.length + selectedFiles.length;

  return (
    <Card className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 relative">
      {/* Grid principal: 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna izquierda: Información (col-span-1) */}
        <div className="col-span-1">
          {/* Header con título y botón eliminar */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Variante {index + 1}
            </h4>
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDelete(variant.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Grid de campos de la variante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Tamaño */}
        <div>
          <Label htmlFor={`size-${variant.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tamaño
          </Label>
          <Input
            id={`size-${variant.id}`}
            placeholder="7*7 cm"
            value={variant.size || ""}
            onChange={(e) => onUpdate(variant.id, "size", e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Presentación */}
        <div>
          <Label htmlFor={`presentation-${variant.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Presentación
          </Label>
          <Input
            id={`presentation-${variant.id}`}
            placeholder="Pack de 10"
            value={variant.presentation || ""}
            onChange={(e) => onUpdate(variant.id, "presentation", e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Modelo */}
        <div>
          <Label htmlFor={`model-${variant.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Modelo
          </Label>
          <Input
            id={`model-${variant.id}`}
            placeholder="Ave"
            value={variant.model || ""}
            onChange={(e) => onUpdate(variant.id, "model", e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Color */}
        <div>
          <Label htmlFor={`color-${variant.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Color
          </Label>
          <Input
            id={`color-${variant.id}`}
            placeholder="Verde"
            value={variant.color || ""}
            onChange={(e) => onUpdate(variant.id, "color", e.target.value)}
            className="mt-1"
          />
        </div>
        
      </div>
      </div>

      {/* Cantidad */}
      <div className="mb-4">
        <Label htmlFor={`quantity-${variant.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Cantidad
        </Label>
        <Input
          id={`quantity-${variant.id}`}
          type="number"
          placeholder="1"
          min="0"
          value={variant.quantity || ""}
          onChange={(e) =>
            onUpdate(variant.id, "quantity", Number.parseInt(e.target.value) || 0)
          }
          className="mt-1"
        />
      </div>

      {/* Imágenes de la variante */}
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Imágenes de la Variante
        </Label>

        {/* Upload area con previews integrados */}
        <div className="border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg p-6 bg-orange-50/30 dark:bg-orange-900/10 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors">
          {/* Previews de imágenes existentes y nuevas - DENTRO del área de upload */}
          {totalImages > 0 && (
            <div className="mb-4 grid grid-cols-4 gap-3">
              {/* URLs existentes (ya subidas) */}
              {existingUrls.map((url, idx) => (
                <div key={`url-${idx}`} className="relative group">
                  <img
                    src={url}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveUrl(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    Subida
                  </div>
                </div>
              ))}

              {/* Archivos nuevos (pendientes de subir) */}
              {selectedFiles.map((file, idx) => (
                <div key={`file-${idx}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded-lg border-2 border-orange-300 dark:border-orange-600"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFile(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1 bg-orange-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Nuevo
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón de upload */}
          <label htmlFor={`file-upload-${variant.id}`} className="cursor-pointer block">
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {totalImages > 0 ? "Agregar más archivos" : "Seleccionar archivos"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Max 20 archivos • Max 16MB c/u
              </span>
              {totalImages > 0 && (
                <span className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">
                  {totalImages} archivo{totalImages !== 1 ? "s" : ""} seleccionado{totalImages !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <input
              id={`file-upload-${variant.id}`}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
      </div>
    </Card>
  );
};
