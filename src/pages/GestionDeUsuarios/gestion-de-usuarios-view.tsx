import React, { useState, useMemo } from "react";
import { PlusIcon, UserIcon, Users, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/data-table";
import { useGetAllUserProfileWithPagination } from "@/hooks/useUserHook";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive";
  createdAt: string;
}

function GestionDeUsuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Hook para obtener los usuarios con paginación
  const { data, isLoading, error } = useGetAllUserProfileWithPagination(
    searchTerm,
    currentPage,
    pageSize
  );

  // Datos de los usuarios y información de paginación
  const users = data?.content || [];
  const pageInfo = {
    pageNumber: data?.number || 1,
    pageSize: data?.size || 10,
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
  };

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const totalUsers = data?.totalElements || 0;
    const activeUsers = users.filter((user: UserProfile) => user.status === "active").length;
    const adminUsers = users.filter((user: UserProfile) => user.role === "admin").length;
    
    return {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
    };
  }, [users, data?.totalElements]);

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
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        const roleVariants = {
          admin: { label: "Administrador", variant: "destructive" as const },
          user: { label: "Usuario", variant: "secondary" as const },
          moderator: { label: "Moderador", variant: "outline" as const },
        };
        const roleInfo = roleVariants[role as keyof typeof roleVariants] || roleVariants.user;
        
        return (
          <Badge variant={roleInfo.variant}>
            {roleInfo.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "Activo" : "Inactivo"}
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
            {date.toLocaleDateString("es-ES")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
            Eliminar
          </Button>
        </div>
      ),
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
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Crear usuario
            </Button>
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
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">usuarios activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
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
      </div>
    </div>
  );
}

export default GestionDeUsuarios;
