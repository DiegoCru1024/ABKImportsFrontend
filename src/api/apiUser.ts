import { apiFetch } from "./apiFetch";

interface User {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async (user: User) => {
  const response = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
  return response;
};


export const getAllUsers = async () => {
  const response = await apiFetch("/users", {
    method: "GET",
  });
  return response;
};


