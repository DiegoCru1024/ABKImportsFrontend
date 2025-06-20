import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserProfile,
  getAllUserProfile,
  getUserProfileById,
  updateUserProfile,
  deleteUserProfile,
  registerUser,
  getAllUserProfileWithPagination,
} from "@/api/apiUser";
import { toast } from "sonner";
import type { User } from "@/api/apiUser";

/**
 * Hook para obtener el perfil del usuario actual
 * @returns {useQuery} - Perfil del usuario actual
 */
export function useGetCurrentUserProfile() {
  return useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });
}

/**
 * Hook para obtener todos los usuarios
 * @returns {useQuery} - Todos los usuarios
 */
export function useGetAllUserProfile() {
  return useQuery({
    queryKey: ["allUserProfile"],
    queryFn: getAllUserProfile,
  });
}

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
    mutationFn: ({ data }: { data: User }) => registerUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUserProfile"],
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
 * @param {number} id - El ID del usuario
 * @returns {useMutation} - El perfil del usuario actualizado
 */
export function useUpdateUserProfile(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: User) => updateUserProfile(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUserProfile"],
      });
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
 * @param {number} id - El ID del usuario
 * @returns {useMutation} - El perfil del usuario eliminado
 */
export function useDeleteUserProfile(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUserProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUserProfile"],
      });
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
