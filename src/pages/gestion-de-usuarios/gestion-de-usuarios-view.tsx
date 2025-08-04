import React, { useState, useMemo, useEffect } from "react";
import { PlusIcon, UserIcon, Users, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/data-table";
import { useGetAllUserProfileWithPagination } from "@/hooks/use-user-hook";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import SendingModal from "@/components/sending-modal";
import { useCreateUserProfile, useUpdateUserProfile, useDeleteUserProfile } from "@/hooks/use-user-hook";
import type   { UserProfile } from "@/api/apiUser";



function GestionDeUsuarios() {

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sending, setSending] = useState(false);

  // Hook para obtener los usuarios con paginación
  const { data:userData, isLoading, error } = useGetAllUserProfileWithPagination(
    searchTerm,
    currentPage,
    pageSize
  );


  useEffect(() => {
    if (userData) {
        setUsers(userData.content);
        setPageInfo({
            pageNumber: userData.pageNumber,
            pageSize: userData.pageSize,
            totalElements: userData.totalElements,
            totalPages: userData.totalPages,
        });
    }
  }, [userData]);
  // Datos de los usuarios y información de paginación
 

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const totalUsers = userData?.totalElements || 0;
    //const activeUsers = users.filter((user: UserProfile) => user.type === "active").length;
    //const adminUsers = users.filter((user: UserProfile) => user.type === "admin").length;
    
    return {
      total: totalUsers,
      //active: activeUsers,
      //admins: adminUsers,
    };
  }, [users, userData?.totalElements]);

  // Crear usuario dialog
  const CreateUserDialog: React.FC = () => {
    const createMutation = useCreateUserProfile();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Crear usuario
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre" />
            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <ConfirmDialog
              trigger={<Button>Crear</Button>}
              title="Confirmar creación de usuario"
              description={`¿Crear usuario ${form.name}?`}
              onConfirm={() => {
                setSending(true);
                createMutation.mutate({ data: form }, { onSettled: () => { setSending(false); setOpen(false); } });
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Editar usuario dialog
  const EditUserDialog: React.FC<{ user: UserProfile }> = ({ user }) => {
    const updateMutation = useUpdateUserProfile(user.id);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: user.name, email: user.email, password: "" });
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">Editar</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre" />
            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Contraseña" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <ConfirmDialog
              trigger={<Button>Actualizar</Button>}
              title="Confirmar actualización de usuario"
              description={`¿Actualizar usuario ${user.name}?`}
              onConfirm={() => {
                setSending(true);
                updateMutation.mutate(form, { onSettled: () => { setSending(false); setOpen(false); } });
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Eliminar usuario dialog
  const DeleteUserDialog: React.FC<{ user: UserProfile }> = ({ user }) => {
    const deleteMutation = useDeleteUserProfile(user.id);
    return (
      <ConfirmDialog
        trigger={<Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Eliminar</Button>}
        title="Confirmar eliminación de usuario"
        description={`¿Eliminar usuario ${user.name}?`}
        confirmText="Eliminar"
        onConfirm={() => {
          setSending(true);
          deleteMutation.mutate(undefined, { onSettled: () => setSending(false) });
        }}
      />
    );
  };

  // Definición de columnas para la tabla
  const columns: ColumnDef<UserProfile>[] = [

    {
      accessorKey: "name",
      header: "Usuario",
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-orange-600" />
            </div>
            <span className="font-medium">{row.getValue("name")}</span>
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
        const type = row.getValue("type") as string;
        return (
          <Badge className="bg-orange-100 text-orange-600 font-medium capitalize">
            {type}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const user = row.original as UserProfile;
        return (
          <div className="flex items-center space-x-2">
            <EditUserDialog user={user} />
            <DeleteUserDialog user={user} />
          </div>
        );
      },
    },
  ];

  // Manejo de cambio de página
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Manejo de búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(0); // Resetear a la primera página
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      {/* Top Navigation Bar */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de usuarios
                </h1>
                <p className="text-sm text-muted-foreground">
                  Administra los usuarios registrados en el sistema
                </p>
              </div>
            </div>
            <CreateUserDialog />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">usuarios registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">usuarios activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">con permisos de admin</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <p className="text-sm text-muted-foreground">
              Todos los usuarios registrados en el sistema
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Error al cargar los usuarios: {error.message}</p>
              </div>
            )}
            
            <DataTable
              columns={columns}
              data={users}
              pageInfo={pageInfo}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              searchTerm={searchTerm}
              isLoading={isLoading}
              toolbarOptions={{
                showSearch: true,
                showViewOptions: true,
              }}
              paginationOptions={{
                showSelectedCount: true,
                showPagination: true,
                showNavigation: true,
              }}
            />
          </CardContent>
        </Card>
        <SendingModal isOpen={sending} onClose={() => setSending(false)} />
      </div>
    </div>
  );
}

export default GestionDeUsuarios;
