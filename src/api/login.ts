import { apiFetch } from "./apiFetch";

const login = async (email: string, password: string) => {
  try {
    const response = await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
  
};

export default login; 