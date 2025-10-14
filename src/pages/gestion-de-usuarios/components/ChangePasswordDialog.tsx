import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useChangePassword } from "@/hooks/use-user-hook";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { UserProfile } from "@/api/interface/user";

interface ChangePasswordDialogProps {
  user: UserProfile;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ user }) => {
  const changePasswordMutation = useChangePassword(String(user.id));
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    // Validaciones
    if (!newPassword.trim()) {
      toast.error("Por favor ingrese la nueva contraseña");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    changePasswordMutation.mutate(newPassword, {
      onSuccess: () => {
        setOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Contraseña actualizada exitosamente");
      },
    });
  };

  const isFormValid = newPassword.length >= 6 && newPassword === confirmPassword;

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Cambiar contraseña"
          onClick={handleTriggerClick}
          type="button"
        >
          <Lock className="h-4 w-4 text-blue-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Cambiar Contraseña
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              Cambiando contraseña para: <strong>{user.first_name} {user.last_name}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="change_password_new">Nueva Contraseña *</Label>
              <div className="relative">
                <Input
                  id="change_password_new"
                  name="new-password-admin-change"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="focus:ring-orange-500 focus:border-orange-500 pr-10"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="change_password_confirm">Confirmar Contraseña *</Label>
              <Input
                id="change_password_confirm"
                name="confirm-password-admin-change"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                className="focus:ring-orange-500 focus:border-orange-500"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
              />
            </div>

            {/* Indicadores de validación */}
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                Mínimo 6 caracteres
              </div>
              <div className={`flex items-center gap-2 ${newPassword === confirmPassword && confirmPassword.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${newPassword === confirmPassword && confirmPassword.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                Las contraseñas coinciden
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Recomendaciones de seguridad:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Usar al menos 8 caracteres</li>
                <li>• Combinar letras mayúsculas y minúsculas</li>
                <li>• Incluir números y símbolos</li>
                <li>• Evitar información personal</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="px-6">
              Cancelar
            </Button>
          </DialogClose>
          <ConfirmDialog
            trigger={
              <Button 
                disabled={!isFormValid || changePasswordMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 px-6"
              >
                {changePasswordMutation.isPending ? "Actualizando..." : "Cambiar Contraseña"}
              </Button>
            }
            title="Confirmar cambio de contraseña"
            description={`¿Está seguro de cambiar la contraseña de ${user.first_name} ${user.last_name}?`}
            confirmText="Cambiar"
            cancelText="Cancelar"
            onConfirm={handleChangePassword}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
