export const login = async (email: string, password: string) => {
  try {
    const response = await fetch("http://localhost:3000/users/login", {
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
