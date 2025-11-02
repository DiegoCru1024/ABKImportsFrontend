import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isExpired, getTimeUntil } from "@/lib/format-time";

export function useTokenExpiration() {
  const navigate = useNavigate();
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const tokenExpiration = localStorage.getItem("token_expiration");

      if (!tokenExpiration) return;

      // Verificar si ya expiró
      if (isExpired(tokenExpiration)) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      // Verificar si expirará pronto (menos de 1 día)
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const timeUntilExpiration = getTimeUntil(tokenExpiration);

      if (timeUntilExpiration <= oneDayInMs && timeUntilExpiration > 0) {
        setIsExpiringSoon(true);
        navigate("/sesion-por-expirar");
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
