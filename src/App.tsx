import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Inspeccion from "./pages/Inspeccion";
import Tracking from "./pages/Tracking";
import CotizacionView from "./pages/Cotizacion/CotizacionView";

import Calculador from "./pages/Calculador";
import Educacion from "./pages/Educacion";
import Herramientas from "./pages/Herramientas";
import Tarifas from "./pages/Tarifas";
import GestionDeCotizacion from "./pages/GestionDeCotizacion/GestionDeCotizacion";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import BasicLayout from "./layouts/BasicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import MisCotizaciones from "./pages/MisCotizaciones/MisCotizaciones";

function App() {
  return (
    <Routes>
      {/* Layout básico para login */}
      <Route element={<BasicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Dashboard con sidebar */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/inspeccion-de-mercancias" element={<Inspeccion />} />
        <Route path="/dashboard/tracking-de-mercancias" element={<Tracking />} />
        <Route path="/dashboard/cotizacion-de-productos" element={<CotizacionView />} />
        <Route path="/dashboard/mis-cotizaciones" element={<MisCotizaciones />} />
        <Route path="/dashboard/calculador-de-impuestos" element={<Calculador />} />
        <Route path="/dashboard/educacion" element={<Educacion />} />
        <Route path="/dashboard/herramientas-logisticas" element={<Herramientas />} />
        <Route path="/dashboard/tarifas-servicios" element={<Tarifas />} />
        <Route path="/dashboard/gestion-de-cotizacion" element={<GestionDeCotizacion />} />
      </Route>

      {/* Cualquier otra ruta redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
