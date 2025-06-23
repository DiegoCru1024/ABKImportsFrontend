export const login = async (email: string, password: string) => {
  try {
    const response = await fetch("https://abkimportsbackend-production.up.railway.app/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { status: response.status }; 
    }

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { status: 500 };
  }
};
