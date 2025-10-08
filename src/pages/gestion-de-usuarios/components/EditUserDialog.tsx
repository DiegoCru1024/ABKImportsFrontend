import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";
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
import { useUpdateUserProfile } from "@/hooks/use-user-hook";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type {
  UserProfile,
  CreateUpdateUser,
  UpdateUser,
} from "@/api/interface/user";

interface EditUserForm {
  first_name: string;
  last_name: string;
  email: string;
  dni: string;
  company_name: string;
  ruc: string;
  contact: number;
  type: string;
}

interface EditUserDialogProps {
  user: UserProfile;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user }) => {
  const updateMutation = useUpdateUserProfile(String(user.id));

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<EditUserForm>({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
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
      dni: user.dni || "",
      company_name: user.company_name || "",
      ruc: user.ruc || "",
      contact: user.contact || 0,
      type: user.type || "final",
    });
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

    const payload: UpdateUser = {
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      dni: Number(form.dni) || 0,
      company_name: form.company_name?.trim() || "",
      ruc: Number(form.ruc) || 0,
      contact: form.contact || 0,
      type: form.type || "final",
    };

    console.log(
      "  Este es el payload de updateProfile",
      JSON.stringify(payload, null, 2)
    );

    updateMutation.mutate(payload);
  };

  const isProfileFormValid =
    (form.first_name?.trim() || "").length > 0 &&
    (form.last_name?.trim() || "").length > 0 &&
    (form.email?.trim() || "").length > 0;

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
          size="sm"
          className="text-blue-600 hover:text-blue-700"
          onClick={handleTriggerClick}
          type="button"
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

        <div className="space-y-6 py-4">
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
                  name="edit-user-first-name"
                  value={form.first_name || ""}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  placeholder="Ingrese nombres"
                  className="focus:ring-orange-500 focus:border-orange-500"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">Apellidos *</Label>
                <Input
                  id="edit_last_name"
                  name="edit-user-last-name"
                  value={form.last_name || ""}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  placeholder="Ingrese apellidos"
                  className="focus:ring-orange-500 focus:border-orange-500"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                name="edit-user-email"
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="usuario@ejemplo.com"
                className="focus:ring-orange-500 focus:border-orange-500"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
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
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, ruc: e.target.value })}
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

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="px-6">
              Cancelar
            </Button>
          </DialogClose>

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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
