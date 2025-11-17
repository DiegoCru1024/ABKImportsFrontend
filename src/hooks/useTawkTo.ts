import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';


declare global {
    interface Window {
        Tawk_API?: {
            hideWidget?: () => void;
            showWidget?: () => void;
        };
    }
}

const useTawkTo = (allowedRoutes: string[] = []) => {
    const location = useLocation();

    useEffect(() => {
        const isAllowedRoute = allowedRoutes.some(route =>
            location.pathname === route || location.pathname.startsWith(route)
        );

        // Si no está en una ruta permitida, ocultar o no cargar
        if (!isAllowedRoute) {
            // Si el widget ya está cargado, solo ocultarlo
            if (window.Tawk_API?.hideWidget) {
                window.Tawk_API.hideWidget();
            }
            return;
        }

        // Si ya existe el script, solo mostrar el widget
        if (document.getElementById('tawk-script')) {
            if (window.Tawk_API?.showWidget) {
                window.Tawk_API.showWidget();
            }
            return;
        }

        // Cargar el script de Tawk.to
        var Tawk_API = window.Tawk_API || {};
        var Tawk_LoadStart = new Date();

        const script = document.createElement("script");
        const firstScript = document.getElementsByTagName("script")[0];

        script.id = 'tawk-script';
        script.async = true;
        script.src = 'https://embed.tawk.to/69174352b06a19195bc28889/1ja1dtukd';
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
        }

        // Cleanup cuando cambie de ruta
        return () => {
            // Solo ocultar el widget, no remover el script
            // (para evitar recargarlo constantemente)
            if (window.Tawk_API?.hideWidget) {
                window.Tawk_API.hideWidget();
            }
        };
    }, [location.pathname, allowedRoutes]);
};

export default useTawkTo;