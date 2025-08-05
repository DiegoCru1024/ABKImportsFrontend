export const obtenerUser = () => {
  const user = {
    id_usuario: localStorage.getItem("user.id_usuario"),
    name: localStorage.getItem("user.name"),
    email: localStorage.getItem("user.email"),
    type: localStorage.getItem("user.type"),
  };
  return user;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}