export const obtenerUser = () => {
  const user = {
    id: localStorage.getItem("user.id"),
    name: localStorage.getItem("user.name"),
    email: localStorage.getItem("user.email"),
    type: localStorage.getItem("user.type"),
  };
  return user;
};