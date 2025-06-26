import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Tracking from "./pages/Tracking";


import Calculador from "./pages/Calculador";
import Educacion from "./pages/Educacion";
import Herramientas from "./pages/Herramientas";
import Tarifas from "./pages/Tarifas";
import GestionDeCotizacionesView from "./pages/GestionDeCotizacion/gestion-de-cotizacion-view";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import BasicLayout from "./layouts/BasicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import GestionDeUsuarios from "./pages/GestionDeUsuarios/gestion-de-usuarios-view";
import GestionDeTracking from "./pages/GestionDeTracking";
import GestionDeMercanciasView from "./pages/GestionDeMercancias/gestion-de-mercancias-view";
import CotizacionViewNew from "./pages/Cotizacion/CotizacionView";
import MisCotizacionesView from "./pages/MisCotizaciones/mis-cotizacion-view";



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
        <Route path="/dashboard/inspeccion-de-mercancias" element={<GestionDeMercanciasView />} />
        <Route path="/dashboard/tracking-de-mercancias" element={<Tracking />} />
        <Route path="/dashboard/gestion-de-tracking" element={<GestionDeTracking />} />
        <Route path="/dashboard/gestion-de-mercancias" element={<GestionDeMercanciasView />} />
        <Route path="/dashboard/gestion-de-cotizacion" element={<GestionDeCotizacionesView />} />
        <Route path="/dashboard/gestion-de-usuarios" element={<GestionDeUsuarios />} />

        {/* Rutas de la plataforma */}
        <Route path="/dashboard/cotizacion-de-productos" element={<CotizacionViewNew />} />
        <Route path="/dashboard/calculador-de-impuestos" element={<Calculador />} />
        <Route path="/dashboard/educacion" element={<Educacion />} />
        <Route path="/dashboard/herramientas-logisticas" element={<Herramientas />} />
        <Route path="/dashboard/tarifas-servicios" element={<Tarifas />} />
        <Route path="/dashboard/mis-cotizaciones" element={<MisCotizacionesView />} />
      </Route>  

      {/* Cualquier otra ruta redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
