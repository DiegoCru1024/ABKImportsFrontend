import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUserProfile,
  getAllUserProfile,
  getUserProfileById,
  updateUserProfile,
  deleteUserProfile,
  registerUser,
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

export function useGetUserProfileById(id: number) {
  return useQuery({
    queryKey: ["userProfileById", id],
    queryFn: () => getUserProfileById(id),
  });
}

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
