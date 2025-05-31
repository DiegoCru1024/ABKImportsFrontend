import "./App.css";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";

import { Routes, Route } from "react-router-dom";
import HeaderConBreadcrumb from "./components/header-breadcrumb";
import Inspeccion from "./pages/Inspeccion";
import Tracking from "./pages/Tracking";
import Cotizacion from "./pages/Cotizacion";
import MisCotizaciones from "./pages/MisCotizaciones";
import Calculador from "./pages/Calculador";
import Educacion from "./pages/Educacion";
import Herramientas from "./pages/Herramientas";
import Tarifas from "./pages/Tarifas";
import Home from "./pages/Home";

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HeaderConBreadcrumb />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Routes>
            <Route path="/inspeccion-de-mercancias" element={<Inspeccion />} />
            <Route path="/tracking-de-mercancias" element={<Tracking />} />
            <Route path="/cotizacion-de-productos" element={<Cotizacion />} />
            <Route path="/mis-cotizaciones" element={<MisCotizaciones />} />
            <Route path="/calculador-de-impuestos" element={<Calculador />} />
            <Route path="/educacion" element={<Educacion />} />
            <Route path="/herramientas-logisticas" element={<Herramientas />} />
            <Route path="/tarifas-servicios" element={<Tarifas />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
