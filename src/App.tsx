import "./App.css";
import {Routes, Route, Navigate, useParams, useSearchParams} from "react-router-dom";
import Tracking from "@/pages/gestion-de-tracking/components/tracking-details.view";


import GestionDeCotizacionesView from "@/pages/gestion-de-cotizacion/gestion-de-cotizacion-view";
import AdminCreateQuotationView from "@/pages/gestion-de-cotizacion/admin-create-quotation-view";

import LoginPage from "@/pages/login";
import SesionPorExpirar from "@/pages/sesion-por-expirar";
import DashboardPage from "@/pages/dashboard";
import BasicLayout from "@/layouts/basic-layout";
import DashboardLayout from "@/layouts/dashboard-layout";
import GestionDeUsuarios from "@/pages/gestion-de-usuarios/gestion-de-usuarios-view";
import GestionDeTracking from "@/pages/gestion-de-tracking/gestion-de-tracking";
import GestionDeMercanciasView from "@/pages/gestion-de-mercancia/gestion-de-mercancias-view";
import InspectionDetailView from "@/pages/gestion-de-mercancia/inspection-detail-view";
import CreateCotizacionView from "@/pages/cotizacion-page/create-cotizacion-view";
import EditCotizacionView from "@/pages/cotizacion-page/edit-cotizacion-view";
import MisCotizacionesView from "@/pages/mis-cotizaciones/mis-cotizacion-view";

import ShipmentDetailView from "@/pages/gestion-de-tracking/components/shipment-detail-view";
import Calculador from "./pages/calculator";
import Tarifas from "./pages/Tarifas";
import Educacion from "./pages/Educacion";
import Herramientas from "./pages/Herramientas";


import RespuestasCotizacionView from "./pages/respuestas-cotizacion";
import EditQuotationResponseView from "./pages/gestion-de-cotizacion/components/views/edit-quotation-response-view";
import QuotationResponseView from "./pages/gestion-de-cotizacion/quotation-response-view/quotation-response-view";
import useTawkTo from "@/hooks/useTawkTo";
import OrdenesDeCompraView from "@/pages/orden-compra/ordenes-de-compra-view";
import DetallesOrdenCompra from "./pages/orden-compra/detalles-orden-compra-view";
import ProductosDetallesOrdenCompra from "@/pages/orden-compra/productos-detalles-orden-compra.tsx";
import InspeccionDeMercanciasDetail from "@/pages/inspeccion-de-mercancias/inspeccion-de-mercancias-detail";

function App() {
    const rutasConChat = [
        '/dashboard/cotizacion-de-productos',
        '/dashboard/mis-cotizaciones'
    ];

    useTawkTo(rutasConChat);
    return (
        <Routes>
            {/* Layout básico para login */}
            <Route element={<BasicLayout/>}>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/sesion-por-expirar" element={<SesionPorExpirar/>}/>
                <Route path="/" element={<Navigate to="/login" replace/>}/>
            </Route>

            {/* Dashboard con sidebar */}
            <Route element={<DashboardLayout/>}>
                <Route path="/dashboard" element={<DashboardPage/>}/>
                {/* Rutas específicas de respuesta/lista de respuestas de cotización */}
                <Route
                    path="/dashboard/gestion-de-cotizacion/respuesta/:quotationId"
                    element={<GestionDeCotizacionRespuestaRoute/>}
                />
                <Route
                    path="/dashboard/gestion-de-cotizacion/respuesta/:quotationId/:responseId"
                    element={<EditQuotationResponseView/>}
                />
                <Route
                    path="/dashboard/ordenes-de-compra"
                    element={< OrdenesDeCompraView/>}
                />
                <Route
                    path="/dashboard/ordenes-de-compra/detalles/:ordenCompraId"
                    element={< DetallesOrdenCompra/>}
                />
                <Route
                    path="/dashboard/ordenes-de-compra/detalles/:ordenCompraId/:subQuotationId/productos"
                    element={< ProductosDetallesOrdenCompra/>}
                />
                <Route
                    path="/dashboard/gestion-de-cotizacion/respuestas/:quotationId/responder"
                    element={<GestionDeCotizacionResponderRoute/>}
                />
                <Route
                    path="/dashboard/inspeccion-de-mercancias"
                    element={<GestionDeMercanciasView/>}
                />
                <Route
                    path="/dashboard/inspeccion-de-mercancias/:id"
                    element={<InspeccionDeMercanciasDetail />}
                />
                <Route
                    path="/dashboard/tracking-de-mercancias"
                    element={<Tracking/>}
                />
                <Route
                    path="/dashboard/tracking-de-mercancias/:id"
                    element={<ShipmentDetailView/>}
                />
                <Route
                    path="/dashboard/gestion-de-tracking"
                    element={<GestionDeTracking/>}
                />
                <Route
                    path="/dashboard/gestion-de-mercancias"
                    element={<GestionDeMercanciasView/>}
                />
                <Route
                    path="/dashboard/gestion-de-mercancias/:id"
                    element={<InspectionDetailView/>}
                />
                <Route
                    path="/dashboard/gestion-de-cotizacion"
                    element={<GestionDeCotizacionesView/>}
                />
                <Route
                    path="/dashboard/gestion-de-cotizacion/crear-para-cliente"
                    element={<AdminCreateQuotationView/>}
                />
                <Route
                    path="/dashboard/gestion-de-usuarios"
                    element={<GestionDeUsuarios/>}
                />

                {/* Rutas de la plataforma */}
                <Route
                    path="/dashboard/cotizacion-de-productos"
                    element={<CreateCotizacionView/>}
                />
                <Route
                    path="/dashboard/calculador-de-impuestos"
                    element={<Calculador/>}
                />
                <Route path="/dashboard/educacion" element={<Educacion/>}/>
                <Route
                    path="/dashboard/herramientas-logisticas"
                    element={<Herramientas/>}
                />
                <Route path="/dashboard/tarifas-servicios" element={<Tarifas/>}/>
                <Route
                    path="/dashboard/mis-cotizaciones"
                    element={<MisCotizacionesView/>}
                />
                <Route
                    path="/dashboard/mis-cotizaciones/respuestas/:quotationId"
                    element={<RespuestasCotizacionRoute/>}
                />
                <Route
                    path="/dashboard/editar/:quotationId"
                    element={<EditarCotizacionRoute/>}
                />
            </Route>

            {/* Cualquier otra ruta redirige al login */}
            <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
    );
}

export default App;

// Wrappers para inyectar el parámetro de ruta a los componentes existentes
function GestionDeCotizacionRespuestaRoute() {
    const {quotationId} = useParams();
    if (!quotationId) return <Navigate to="/dashboard/gestion-de-cotizacion" replace/>;
    return <QuotationResponseView selectedQuotationId={quotationId}/>;
}


function GestionDeCotizacionResponderRoute() {
    const {quotationId} = useParams();
    if (!quotationId) return <Navigate to="/dashboard/gestion-de-cotizacion" replace/>;
    return <QuotationResponseView selectedQuotationId={quotationId}/>;
}

function RespuestasCotizacionRoute() {
    return <RespuestasCotizacionView/>;
}

function EditarCotizacionRoute() {
    const {quotationId} = useParams();
    const [searchParams] = useSearchParams();

    if (!quotationId) return <Navigate to="/dashboard/mis-cotizaciones" replace/>;

    // Obtener el status desde los parámetros de la URL, por defecto "pending"
    const statusQuotation = searchParams.get("status") || "pending";

    return (
        <EditCotizacionView
            quotationId={quotationId}
            onBack={() => window.history.back()}
            status={statusQuotation}
        />
    );
}
