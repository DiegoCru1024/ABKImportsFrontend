export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const access_token = localStorage.getItem("access_token"); // 🔹 Obtener el token del localStorage

  const headers = {
    "Content-Type": "application/json",
    Authorization: access_token ? `Bearer ${access_token}` : "", // 🔹 Agregar el token si existe
    ...options.headers, // 🔹 Permitir sobreescribir headers si es necesario
  };

  try {
    
    const response = await fetch(
      `http://localhost:8080/${endpoint}`, // 🔹 Base URL + endpoint
      //`https://crmbackendv2-production.up.railway.app/api${endpoint}`, // 🔹 Base URL + endpoint
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
