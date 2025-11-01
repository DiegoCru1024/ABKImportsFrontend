import { API_URL } from "../../config";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const access_token = localStorage.getItem("access_token"); // 🔹 Obtener el token del localStorag

  const headers = {
    "Content-Type": "application/json",
    Authorization: access_token ? `Bearer ${access_token}` : "", // 🔹 Agregar el token si existe
    ...options.headers, // 🔹 Permitir sobreescribir headers si es necesario
  };

  try {
    console.log("Request URL: ", `${API_URL}${endpoint}`);
    const response = await fetch(
      `${API_URL}${endpoint}`, // 🔹 Base URL + endpoint
      {
        ...options,
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
