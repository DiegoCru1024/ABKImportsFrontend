export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const access_token = localStorage.getItem("access_token"); // 🔹 Obtener el token del localStorage

  const headers = {
    "Content-Type": "application/json",
    Authorization: access_token ? `Bearer ${access_token}` : "", // 🔹 Agregar el token si existe
    ...options.headers, // 🔹 Permitir sobreescribir headers si es necesario
  };

  try {
    //console.log("Request URL: ", `http://localhost:3000${endpoint}`);
    console.log("Request URL: ", `https://abkimportsbackend-production.up.railway.app${endpoint}`);
    //console.log("Request Body: ", options.body);
    const response = await fetch(
      //`http://localhost:3000${endpoint}`, // 🔹 Base URL + endpoint
      `https://abkimportsbackend-production.up.railway.app${endpoint}`, // 🔹 Base URL + endpoint
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
