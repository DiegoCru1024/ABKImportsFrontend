import { API_URL } from "../../config";
import { apiFetch } from "./apiFetch";
import type { User } from "./interface/user";



export const registerUser = async (user: User) => {
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


export interface UserProfileWithPagination {
  content: UserProfile[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  type: string;
}

/**
 * Obtiene todos los usuarios con paginacion   (admin)
 * @returns {Promise<any>} - Los usuarios
 */
export const getAllUserProfileWithPagination = async (searchTerm: string, page: number, size: number) => {

  const url = new URL(
    "/users",
    API_URL
  )
  if (searchTerm) {
    url.searchParams.append("searchTerm", searchTerm.toString());
  }

  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());

  try {
    const response: UserProfileWithPagination = await apiFetch(
      `/users?${url.toString()}`,
      {
        method: "GET",
      }
    );
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

export const updateUserProfile = async (id: number, user: User) => {
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

export const deleteUserProfile = async (id: number) => {
  try {
    return await apiFetch(`/users/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error al eliminar el perfil del usuario:", error);
    throw error;
  }
};

