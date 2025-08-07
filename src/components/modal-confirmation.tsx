import React from "react";

import { Button } from "@/components/ui/button"; // Asegúrate de importar el componente Button
import { AlertTriangle } from "lucide-react"; // Asegúrate de importar el icono que estás utilizando
import {
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
// Interfaz de tipos para las propiedades del componente
interface ConfirmationModalProps {
  isOpen: boolean; // Si el modal está abierto o no
  onClose: () => void; // Función para cerrar el modal
  onConfirm: () => void; // Función para manejar la confirmación (acción al hacer clic en "Sí, generar cotización")
  title: string; // Título del modal
  description: string; // Descripción del modal
  buttonText: string; // Texto del botón
  disabled?: boolean; // Si el botón está deshabilitado
}

// El componente toma las siguientes propiedades:
// - `isOpen`: Si el modal está abierto o cerrado.
// - `onClose`: Función para cerrar el modal.
// - `onConfirm`: Función para manejar la confirmación (acción al hacer clic en "Sí, generar cotización").
// - `title`: Título del modal.
// - `description`: Descripción del modal.
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  buttonText,
  disabled,
}: ConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="text-center">
          {/* Icono de alerta con acento rojo */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-100 bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          <DialogHeader className="space-y-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="flex justify-end gap-3 py-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
            variant="default"
            disabled={disabled}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
