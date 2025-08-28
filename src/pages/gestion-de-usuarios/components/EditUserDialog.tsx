import React, { useState, useEffect } from "react";
import { Edit, Eye, EyeOff } from "lucide-react";
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
import { useUpdateUserProfile, useChangePassword } from "@/hooks/use-user-hook";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { UserProfile, CreateUpdateUser } from "@/api/interface/user";

interface EditUserForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dni: string;
  company_name: string;
  ruc: string;
  contact: number;
  type: string;
}

interface EditUserDialogProps {
  user: UserProfile;
  onOpen?: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, onOpen }) => {
  const updateMutation = useUpdateUserProfile(String(user.id));
  const changePasswordMutation = useChangePassword(String(user.id));

  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [form, setForm] = useState<EditUserForm>({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    password: "", // Campo requerido pero no se muestra en edición
    dni: user.dni || "",
    company_name: user.company_name || "",
    ruc: user.ruc || "",
    contact: user.contact || 0,
    type: user.type || "final",
  });

  // Resetear formulario cuando cambia el usuario
  useEffect(() => {
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "", // Campo requerido pero no se muestra en edición
      dni: user.dni || "",
      company_name: user.company_name || "",
      ruc: user.ruc || "",
      contact: user.contact || 0,
      type: user.type || "final",
    });
    setNewPassword("");
    setActiveTab("profile");
  }, [user]);

  const handleUpdateProfile = () => {
    // Validar que los campos obligatorios no sean null/undefined y tengan contenido
    const firstName = form.first_name?.trim() || "";
    const lastName = form.last_name?.trim() || "";
    const email = form.email?.trim() || "";

    if (!firstName || !lastName || !email) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    const payload: CreateUpdateUser = {
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: form.password || "no-change", // Campo requerido por la API
      dni: Number(form.dni) || 0,
      company_name: form.company_name?.trim() || "",
      ruc: Number(form.ruc) || 0,
      contact: form.contact || 0,
      type: form.type || "final",
    };

    updateMutation.mutate(payload);
  };

  const handleChangePassword = () => {
    if (!newPassword.trim()) {
      toast.error("Por favor ingrese la nueva contraseña");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    changePasswordMutation.mutate(newPassword, {
      onSuccess: () => {
        setNewPassword("");
        setActiveTab("profile");
        toast.success("Contraseña actualizada exitosamente");
      },
    });
  };

  const isProfileFormValid =
    (form.first_name?.trim() || "").length > 0 &&
    (form.last_name?.trim() || "").length > 0 &&
    (form.email?.trim() || "").length > 0;
  const isPasswordFormValid = newPassword.length >= 6;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && onOpen) {
      onOpen();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
        >
          <Edit className="h-4 w-4 mr-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Editar Usuario: {user.first_name || ""} {user.last_name || ""}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "profile"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "password"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Contraseña
          </button>
        </div>

        <div className="space-y-6 py-4">
          {activeTab === "profile" ? (
            /* Tab de Perfil */
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_first_name">Nombres *</Label>
                    <Input
                      id="edit_first_name"
                      value={form.first_name || ""}
                      onChange={(e) =>
                        setForm({ ...form, first_name: e.target.value })
                      }
                      placeholder="Ingrese nombres"
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_last_name">Apellidos *</Label>
                    <Input
                      id="edit_last_name"
                      value={form.last_name || ""}
                      onChange={(e) =>
                        setForm({ ...form, last_name: e.target.value })
                      }
                      placeholder="Ingrese apellidos"
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email *</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="usuario@ejemplo.com"
                    className="focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Información de Identificación */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Identificación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_dni">DNI</Label>
                    <Input
                      id="edit_dni"
                      type="number"
                      value={form.dni || ""}
                      onChange={(e) =>
                        setForm({ ...form, dni: e.target.value })
                      }
                      placeholder="12345678"
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_company_name">Razón Social</Label>
                    <Input
                      id="edit_company_name"
                      value={form.company_name || ""}
                      onChange={(e) =>
                        setForm({ ...form, company_name: e.target.value })
                      }
                      placeholder="Empresa S.A.C."
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_ruc">RUC</Label>
                    <Input
                      id="edit_ruc"
                      type="number"
                      value={form.ruc || ""}
                      onChange={(e) =>
                        setForm({ ...form, ruc: e.target.value })
                      }
                      placeholder="20123456789"
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_contact">Contacto</Label>
                    <Input
                      id="edit_contact"
                      type="tel"
                      value={form.contact || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contact: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="+51 999 999 999"
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_type">Tipo de Usuario</Label>
                    <Select
                      value={form.type || "final"}
                      onValueChange={(value: string) =>
                        setForm({ ...form, type: value })
                      }
                    >
                      <SelectTrigger className="focus:ring-orange-500 focus:border-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="final">Usuario Final</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="temporal">Temporal</SelectItem>
                        <SelectItem value="guest">Invitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab de Contraseña */
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Cambiar Contraseña
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_user_new_password">
                    Nueva Contraseña *
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit_user_new_password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="focus:ring-orange-500 focus:border-orange-500 pr-10"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• La contraseña debe tener al menos 6 caracteres</p>
                  <p>
                    • Se recomienda usar una combinación de letras, números y
                    símbolos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="px-6">
              Cancelar
            </Button>
          </DialogClose>

          {activeTab === "profile" ? (
            <ConfirmDialog
              trigger={
                <Button
                  disabled={!isProfileFormValid || updateMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 px-6"
                >
                  {updateMutation.isPending
                    ? "Actualizando..."
                    : "Actualizar Perfil"}
                </Button>
              }
              title="Confirmar actualización"
              description={`¿Está seguro de actualizar el perfil de ${
                user.first_name || ""
              } ${user.last_name || ""}?`}
              confirmText="Actualizar"
              cancelText="Cancelar"
              onConfirm={handleUpdateProfile}
            />
          ) : (
            <ConfirmDialog
              trigger={
                <Button
                  disabled={
                    !isPasswordFormValid || changePasswordMutation.isPending
                  }
                  className="bg-orange-500 hover:bg-orange-600 px-6"
                >
                  {changePasswordMutation.isPending
                    ? "Actualizando..."
                    : "Cambiar Contraseña"}
                </Button>
              }
              title="Confirmar cambio de contraseña"
              description={`¿Está seguro de cambiar la contraseña de ${
                user.first_name || ""
              } ${user.last_name || ""}?`}
              confirmText="Cambiar"
              cancelText="Cancelar"
              onConfirm={handleChangePassword}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
