import { API_URL } from "../../config";
import { apiFetch } from "./apiFetch";
import type {
  CreateUpdateUser,
  UserProfileWithPagination,
} from "./interface/user";

export const registerUser = async (user: CreateUpdateUser) => {
  try {
    return await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return { status: 500, message: "Error al obtener los usuarios" };
  }
};

export const getCurrentUserProfile = async () => {
  try {
    return await apiFetch("/users/profile", {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    return { status: 500, message: "Error al obtener el perfil del usuario" };
  }
};

/**
 * Obtiene todos los usuarios (admin)
 * @returns {Promise<any>} - Los usuarios
 */
export const getAllUserProfile = async () => {
  try {
    return await apiFetch("/users", {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return { status: 500, message: "Error al obtener los usuarios" };
  }
};

/**
 * Obtiene todos los usuarios con paginacion   (admin)
 * @returns {Promise<any>} - Los usuarios
 */
export const getAllUserProfileWithPagination = async (
  searchTerm: string,
  page: number,
  size: number
) => {
  let url = "/users";
  const params = new URLSearchParams();
  
  if (searchTerm) {
    params.append("searchTerm", searchTerm);
  }
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  try {
    const response: UserProfileWithPagination = await apiFetch(url, {
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    throw error; // Lanza en vez de retornar un objeto de error
  }
};

/**
 * Obtiene el perfil de un usuario por su ID
 * @param {number} id - El ID del usuario
 * @returns {Promise<any>} - El perfil del usuario
 */
export const getUserProfileById = async (id: number) => {
  try {
    return await apiFetch(`/users/${id}`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    throw error;
  }
};

export const updateUserProfile = async (id: string, user: CreateUpdateUser) => {
  try {
    return await apiFetch(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(user),
    });
  } catch (error) {
    console.error("Error al actualizar el perfil del usuario:", error);
    throw error;
  }
};

export const deleteUserProfile = async (id: string) => {
  try {
    return await apiFetch(`/users/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error al eliminar el perfil del usuario:", error);
    throw error;
  }
};

export const changePassword = async (id: number, password: string) => {
  try {
    return await apiFetch(`/users/${id}/change-password`, {
      method: "PATCH",
      body: JSON.stringify(password),
    });
  } catch (error) {
    console.error("Error al cambiar la contraseña del usuario:", error);
    throw error;
  }
};
