"use client"

import { AlertTriangle, Info, CheckCircle, XCircle, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "./ui/alert"
 

const dialogConfig = {
  info: {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    alertBg: "bg-blue-50",
    alertBorder: "border-blue-200",
    alertText: "text-blue-800",
    alertIcon: "text-blue-600",
    confirmBg: "bg-blue-600 hover:bg-blue-700",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    alertBg: "bg-amber-50",
    alertBorder: "border-amber-200",
    alertText: "text-amber-800",
    alertIcon: "text-amber-600",
    confirmBg: "bg-amber-600 hover:bg-amber-700",
  },
  danger: {
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    alertBg: "bg-red-50",
    alertBorder: "border-red-200",
    alertText: "text-red-800",
    alertIcon: "text-red-600",
    confirmBg: "bg-red-600 hover:bg-red-700",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    alertBg: "bg-green-50",
    alertBorder: "border-green-200",
    alertText: "text-green-800",
    alertIcon: "text-green-600",
    confirmBg: "bg-green-600 hover:bg-green-700",
  },
}

const maxWidthClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
}

export type DialogType = "info" | "warning" | "danger" | "success"

export interface ReusableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type?: DialogType
  title: string
  subtitle?: string
  description: string
  warningMessage?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  icon?: LucideIcon
  maxWidth?: "sm" | "md" | "lg" | "xl"
}


export default function ReusableDialog({
  open,
  onOpenChange,
  type = "info",
  title,
  subtitle,
  description,
  warningMessage,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isLoading = false,
  icon: CustomIcon,
  maxWidth = "md",
}: ReusableDialogProps) {
  const config = dialogConfig[type]
  const IconComponent = CustomIcon || config.icon

  const handleConfirm = async () => {
    await onConfirm()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidthClasses[maxWidth]}>
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.iconBg}`}>
                <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription className="text-gray-600 leading-relaxed">{description}</DialogDescription>

          {warningMessage && (
            <Alert className={`${config.alertBorder} ${config.alertBg}`}>
              <AlertTriangle className={`h-4 w-4 ${config.alertIcon}`} />
              <AlertDescription className={config.alertText}>
                <strong>Importante:</strong> {warningMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className={`${config.confirmBg} text-white`}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
