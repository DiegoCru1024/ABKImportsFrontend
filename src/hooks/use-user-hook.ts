import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfileById,
  updateUserProfile,
  deleteUserProfile,
  registerUser,
  getAllUserProfileWithPagination,
  changePassword,
} from "@/api/apiUser";
import { toast } from "sonner";
import type { CreateUpdateUser } from "@/api/interface/user";




/**
 * Hook para obtener el perfil de un usuario por su ID
 * @param {number} id - El ID del usuario
 * @returns {useQuery} - El perfil del usuario
 */
export function useGetUserProfileById(id: number) {
  return useQuery({
    queryKey: ["userProfileById", id],
    queryFn: () => getUserProfileById(id),
  });
}

/**
 * Hook para obtener todos los usuarios con paginacion
 * @param {string} searchTerm - El termino de busqueda
 * @param {number} page - La pagina actual
 * @param {number} size - El numero de usuarios por pagina
 * @returns {useQuery} - Todos los usuarios con paginacion
 */
export function useGetAllUserProfileWithPagination(searchTerm: string, page: number, size: number) {
  return useQuery({
    queryKey: ["allUserProfileWithPagination", searchTerm, page, size],
    queryFn: () => getAllUserProfileWithPagination(searchTerm, page, size),
  });
}

/**
 * Hook para crear un usuario 
 * @returns {useMutation} - El usuario creado
 */
export function useCreateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: CreateUpdateUser }) => registerUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUserProfileWithPagination"],
      });
      toast.success("Usuario creado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al crear el usuario:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al crear el usuario");
      }
    },
  });
}

/**
 * Hook para actualizar el perfil de un usuario
 * @param {string} id - El ID del usuario
 * @returns {useMutation} - El perfil del usuario actualizado
 */
export function useUpdateUserProfile(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: CreateUpdateUser) => updateUserProfile(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUserProfileWithPagination"],
      });
      toast.success("Usuario actualizado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar el usuario:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al actualizar el usuario");
      }
    },
  });
}

/**
 * Hook para eliminar el perfil de un usuario
 * @returns {useMutation} - El perfil del usuario eliminado
 */
export function useDeleteUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUserProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUserProfileWithPagination"],
      });
      toast.success("Usuario eliminado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar el usuario:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al eliminar el usuario");
      }
    },
  });
}


export function useChangePassword(id: string) {
  return useMutation({
    mutationFn: (password: string) => changePassword(id, password),
    onSuccess: () => {
      toast.success("Contraseña cambiada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al cambiar la contraseña:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al cambiar la contraseña");
      }
    },
  });
}
