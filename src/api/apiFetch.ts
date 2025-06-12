export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  //const token = localStorage.getItem("token"); // 🔹 Obtener el token del localStorage

  const headers = {
    "Content-Type": "application/json",
    //Authorization: token ? `Bearer ${token}` : "", // 🔹 Agregar el token si existe
    ...options.headers, // 🔹 Permitir sobreescribir headers si es necesario
  };

  try {
    const response = await fetch(
      `http://localhost:8080/api${endpoint}`, // 🔹 Base URL + endpoint
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
