import type { ColumnDef } from "@tanstack/react-table";
import type { UserProfile, UserType } from "@/api/interface/user";
import { UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { transformUserType } from "../utils/utils";

// Definición de columnas para la tabla
export const columnsUsuarios = (
  EditUserDialog: React.FC<{ user: UserProfile }>,
  DeleteUserDialog: React.FC<{ user: UserProfile }>,
  ChangePasswordDialog: React.FC<{ user: UserProfile }>
): ColumnDef<UserProfile>[] => [
  {
    accessorKey: "first_name",
    header: "Usuario",
    cell: ({ row }) => {
      const firstName = row.getValue("first_name") as string;
      const lastName = row.original.last_name || "";
      return (
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-orange-600" />
          </div>
          <span className="font-medium">
            {firstName} {lastName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Rol",
    cell: ({ row }) => {
      const type = row.getValue("type") as UserType;
      const tipo = transformUserType(type);

      const getBadgeColor = (userType: string) => {
        switch (userType) {
          case "admin":
            return "bg-red-500 hover:bg-red-600 text-white";
          case "final":
            return "bg-blue-500 hover:bg-blue-600 text-white";
          case "temporal":
            return "bg-yellow-500 hover:bg-yellow-600 text-white";
          case "guest":
            return "bg-gray-500 hover:bg-gray-600 text-white";
          default:
            return "bg-gray-500 hover:bg-gray-600 text-white";
        }
      };

      return (
        <Badge className={`font-medium capitalize ${getBadgeColor(type)}`}>
          {tipo}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de Registro",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="flex justify-center">Acciones</div>,
    cell: ({ row }) => {
      const user = row.original as UserProfile;
      return (
        <div className="flex items-center justify-center space-x-2">
          <EditUserDialog user={user} />
          <DeleteUserDialog user={user} />
          <ChangePasswordDialog user={user} />
        </div>
      );
    },
  },
];
