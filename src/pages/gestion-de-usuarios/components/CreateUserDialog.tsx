import React, { useState } from "react";
import { PlusIcon } from "lucide-react";
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
import { useCreateUserProfile } from "@/hooks/use-user-hook";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateUserForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dni: string;
  company_name: string;
  ruc: string;
  contact: string;
  type: "final" | "admin";
}

const CreateUserDialog: React.FC = () => {
  const createMutation = useCreateUserProfile();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    dni: "",
    company_name: "",
    ruc: "",
    contact: "",
    type: "final",
  });

  const handleSubmit = () => {
    // Validaciones básicas
    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      dni: form.dni ? Number(form.dni) : 0,
      company_name: form.company_name.trim(),
      ruc: form.ruc ? Number(form.ruc) : 0,
      contact: form.contact ? Number(form.contact) : 0,
      type: form.type,
    };

    console.log("Este es el payload", JSON.stringify(payload, null, 2));

    createMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            dni: "",
            company_name: "",
            ruc: "",
            contact: "",
            type: "final",
          });
        },
      }
    );
  };

  const isFormValid =
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.email.trim() &&
    form.password.length >= 6;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Crear usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Crear Nuevo Usuario
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
                <Label htmlFor="first_name">Nombres *</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  placeholder="Ingrese nombres"
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellidos *</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  placeholder="Ingrese apellidos"
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Información de Identificación */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Identificación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  type="number"
                  value={form.dni}
                  onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  placeholder="12345678"
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Razón Social</Label>
                <Input
                  id="company_name"
                  value={form.company_name}
                  onChange={(e) =>
                    setForm({ ...form, company_name: e.target.value })
                  }
                  placeholder="Empresa S.A.C."
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  type="number"
                  value={form.ruc}
                  onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                  placeholder="20123456789"
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contacto</Label>
                <Input
                  id="contact"
                  type="tel"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  placeholder="+51 999 999 999"
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Usuario</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: "final" | "admin") =>
                    setForm({ ...form, type: value })
                  }
                >
                  <SelectTrigger className="focus:ring-orange-500 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="final">Usuario Final</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
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
                disabled={!isFormValid || createMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 px-6"
              >
                {createMutation.isPending ? "Creando..." : "Crear Usuario"}
              </Button>
            }
            title="Confirmar creación de usuario"
            description={`¿Está seguro de crear el usuario ${form.first_name} ${form.last_name}?`}
            confirmText="Crear"
            cancelText="Cancelar"
            onConfirm={handleSubmit}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
