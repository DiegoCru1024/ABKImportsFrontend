import { apiFetch } from "./apiFetch";

export interface User {
  name: string;
  email: string;
  password: string;
}

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
    return { status: 500, message: "Error al obtener el perfil del usuario" };
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
    return { status: 500, message: "Error al actualizar el perfil del usuario" };
  }
};

export const deleteUserProfile = async (id: number) => {
  try {
    return await apiFetch(`/users/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error al eliminar el perfil del usuario:", error);
    return { status: 500, message: "Error al eliminar el perfil del usuario" };
  }
};

