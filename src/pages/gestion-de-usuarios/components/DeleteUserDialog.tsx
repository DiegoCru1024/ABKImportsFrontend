import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteUserProfile } from "@/hooks/use-user-hook";
import { toast } from "sonner";
import type { UserProfile } from "@/api/interface/user";

interface DeleteUserDialogProps {
  user: UserProfile;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ user }) => {
  const deleteMutation = useDeleteUserProfile();
  console.log("Este es el user", user.id);

  const handleDelete = () => {
    // Asegurar que el ID sea un string válido
    const userId = String(user.id);
    deleteMutation.mutate(userId);
  };

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
        </Button>
      }
      title="Confirmar eliminación de usuario"
      description={`¿Está seguro de eliminar al usuario ${user.first_name || ""} ${user.last_name || ""}? Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="destructive"
      onConfirm={handleDelete}
    />
  );
};

export default DeleteUserDialog;
