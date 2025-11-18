import { useState } from "react";
import { Search, User, Building, Mail, Phone, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useUsersPagination } from "@/hooks/use-users-pagination";
import type { UserProfile } from "@/api/interface/user";

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
  selectedUserId?: string;
}

export const UserSelectionModal = ({
  isOpen,
  onClose,
  onSelectUser,
  selectedUserId,
}: UserSelectionModalProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const usersPagination = useUsersPagination();

  const handleSearch = () => {
    usersPagination.handleSearchChange(localSearchTerm);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    usersPagination.clearSearch();
  };

  const handleSelectUser = (user: UserProfile) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6 text-orange-500" />
            Seleccionar Cliente
          </DialogTitle>
          <DialogDescription>
            Busque y seleccione el cliente para asignar la cotización
          </DialogDescription>
        </DialogHeader>

        {/* Buscador */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email, empresa o RUC..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="default">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
          {usersPagination.searchTerm && (
            <Button onClick={handleClearSearch} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Estados de carga y error */}
        {usersPagination.isLoading && (
          <LoadingState message="Cargando usuarios..." variant="card" />
        )}

        {usersPagination.isError && (
          <ErrorState
            title="Error al cargar usuarios"
            message="No se pudieron cargar los usuarios. Intente nuevamente."
            variant="card"
          />
        )}

        {/* Lista de usuarios */}
        {!usersPagination.isLoading && !usersPagination.isError && (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {usersPagination.users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No se encontraron usuarios</p>
                </div>
              ) : (
                usersPagination.users.map((user) => (
                  <div
                    key={user.id}
                    className={`
                      p-4 border rounded-lg cursor-pointer transition-all
                      hover:shadow-md hover:border-orange-300
                      ${
                        selectedUserId === user.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200"
                      }
                    `}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-orange-500" />
                          <h4 className="font-semibold text-gray-900">
                            {user.first_name} {user.last_name}
                          </h4>
                          <span
                            className={`
                            text-xs px-2 py-1 rounded-full
                            ${
                              user.type === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : user.type === "final"
                                ? "bg-green-100 text-green-700"
                                : user.type === "temporal"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          `}
                          >
                            {user.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>{user.contact}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-3 h-3" />
                            <span>{user.company_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">RUC:</span>
                            <span>{user.ruc}</span>
                          </div>
                        </div>
                      </div>

                      {selectedUserId === user.id && (
                        <div className="ml-4 flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Paginación */}
            {usersPagination.users.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <PaginationControls
                  currentPage={usersPagination.pageInfo.pageNumber}
                  totalPages={usersPagination.pageInfo.totalPages}
                  totalElements={usersPagination.pageInfo.totalElements}
                  pageSize={usersPagination.pageInfo.pageSize}
                  onPageChange={usersPagination.handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
