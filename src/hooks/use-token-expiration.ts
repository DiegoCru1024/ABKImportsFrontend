import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useTokenExpiration() {
  const navigate = useNavigate();
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const tokenExpiration = localStorage.getItem("token_expiration");

      if (!tokenExpiration) return;

      const expirationDate = new Date(tokenExpiration);
      const now = new Date();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const timeUntilExpiration = expirationDate.getTime() - now.getTime();

      // Si falta un día o menos para que expire el token
      if (timeUntilExpiration <= oneDayInMs && timeUntilExpiration > 0) {
        setIsExpiringSoon(true);
        navigate("/sesion-por-expirar");
      }

      // Si el token ya expiró
      if (timeUntilExpiration <= 0) {
        localStorage.clear();
        navigate("/login");
      }
    };

    // Verificar inmediatamente
    checkTokenExpiration();

    // Verificar cada hora
    const interval = setInterval(checkTokenExpiration, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return { isExpiringSoon };
}
