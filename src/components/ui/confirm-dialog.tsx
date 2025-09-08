"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle, X } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  isOpen?:boolean
  onClose?:()=>void
  trigger: React.ReactNode
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: "default" | "destructive" | "success"
}

export function ConfirmDialog({
  isOpen,
  trigger,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  variant = "default",
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="h-6 w-6 text-red-500" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      default:
        return <AlertTriangle className="h-6 w-6 text-orange-500" />
    }
  }

  const getConfirmButtonStyle = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-600 hover:bg-red-700 text-white"
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white"
      default:
        return "bg-orange-500 hover:bg-orange-600 text-white"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md border-2 border-gray-200 shadow-xl">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </DialogClose>

        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full">{getIcon()}</div>
          <DialogTitle className="text-xl font-bold text-gray-900 text-center">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-gray-600 text-center leading-relaxed">{description}</DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"
          >
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} className={`flex-1 font-medium transition-colors ${getConfirmButtonStyle()}`}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
