import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Tracking from "@/pages/Tracking";


import GestionDeCotizacionesView from "@/pages/gestion-de-cotizacion/gestion-de-cotizacion-view";
import LoginPage from "@/pages/login";  
import DashboardPage from "@/pages/dashboard";
import BasicLayout from "@/layouts/basic-layout";
import DashboardLayout from "@/layouts/dashboard-layout";
import GestionDeUsuarios from "@/pages/gestion-de-usuarios/gestion-de-usuarios-view";
import GestionDeTracking from "@/pages/gestion-de-tracking";
import GestionDeMercanciasView from "@/pages/gestion-de-mercancia/gestion-de-mercancias-view";
import InspectionDetailView from "@/pages/gestion-de-mercancia/inspection-detail-view";
import CreateCotizacionView from "@/pages/cotizacion-page/create-cotizacion-view";
import MisCotizacionesView from "@/pages/mis-cotizaciones/mis-cotizacion-view";
import ShipmentDetailView from "@/pages/shipment-detail-view";
import Calculador from "./pages/calculator";
import Tarifas from "./pages/Tarifas";
import Educacion from "./pages/Educacion";
import Herramientas from "./pages/Herramientas";

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
        <Route
          path="/dashboard/inspeccion-de-mercancias"
          element={<GestionDeMercanciasView />}
        />
        <Route
          path="/dashboard/tracking-de-mercancias"
          element={<Tracking />}
        />
        <Route
          path="/dashboard/tracking-de-mercancias/:id"
          element={<ShipmentDetailView />}
        />
        <Route
          path="/dashboard/gestion-de-tracking"
          element={<GestionDeTracking />}
        />
        <Route
          path="/dashboard/gestion-de-mercancias"
          element={<GestionDeMercanciasView />}
        />
        <Route
          path="/dashboard/gestion-de-mercancias/:id"
          element={<InspectionDetailView />}
        />
        <Route
          path="/dashboard/gestion-de-cotizacion"
          element={<GestionDeCotizacionesView />}
        />
        <Route
          path="/dashboard/gestion-de-usuarios"
          element={<GestionDeUsuarios />}
        />

        {/* Rutas de la plataforma */}
        <Route
          path="/dashboard/cotizacion-de-productos"
          element={<CreateCotizacionView />}
        />
        <Route
          path="/dashboard/calculador-de-impuestos"
          element={<Calculador />}
        />
        <Route path="/dashboard/educacion" element={<Educacion />} />
        <Route
          path="/dashboard/herramientas-logisticas"
          element={<Herramientas />}
        />
        <Route path="/dashboard/tarifas-servicios" element={<Tarifas />} />
        <Route
          path="/dashboard/mis-cotizaciones"
          element={<MisCotizacionesView />}
        />
      </Route>

      {/* Cualquier otra ruta redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
