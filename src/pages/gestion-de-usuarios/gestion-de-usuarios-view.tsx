import React from "react";
import { UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { useUserManagement } from "./hooks/useUserManagement";
import { columnsUsuarios } from "./components/columsUsuarios";

import DeleteUserDialog from "./components/DeleteUserDialog";
import CreateUserDialog from "./components/CreateUserDialog";
import UserStats from "./components/UserStats";
import EditUserDialog from "./components/EditUserDialog";
import ChangePasswordDialog from "./components/ChangePasswordDialog";

function GestionDeUsuarios() {
  const {
    users,
    pageInfo,
    searchTerm,
    isLoading,
    error,
    handlePageChange,
    handleSearch,
    clearSearch,
  } = useUserManagement();

  // Wrapper para los diálogos que limpia el buscador cuando se abren
  const EditUserDialogWrapper = (props: any) => (
    <EditUserDialog {...props} onOpen={() => clearSearch()} />
  );
  
  const ChangePasswordDialogWrapper = (props: any) => (
    <ChangePasswordDialog {...props} onOpen={() => clearSearch()} />
  );

  const columns = columnsUsuarios(EditUserDialogWrapper, DeleteUserDialog, ChangePasswordDialogWrapper);

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
        <UserStats 
          users={users} 
          totalUsers={pageInfo.totalElements} 
        />

        {/* Tabla de usuarios */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Lista de Usuarios
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Todos los usuarios registrados en el sistema
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">
                  Error al cargar los usuarios: {error.message}
                </p>
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
