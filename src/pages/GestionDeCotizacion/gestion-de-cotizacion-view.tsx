import { useState } from "react";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

// Importar componentes modulares
import SolicitudesTab from "./components/tabs/Solicitudes";
import DetallesTab from "./components/tabs/Detalles";
import RespuestaTab from "./components/tabs/Respuesta";

// Definir las tabs
const tabs = [
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: FileText,
    description: "Ver todas las solicitudes de cotización",
    disabled: false,
  },
  {
    id: "detalles",
    label: "Detalles de la cotización",
    icon: FileText,
    description: "Ver detalles de la cotización seleccionada",
    disabled: false,
  },
  {
    id: "respuesta",
    label: "Respuesta",
    icon: FileText,
    description: "Responder cotización",
    disabled: false,
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function GestionDeCotizacionesView() {
  //********Tabs**** */
  const [mainTab, setMainTab] = useState<TabId>("solicitudes");

  //********Cotización seleccionada**** */
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>("");
  
  //********Producto seleccionado para respuesta**** */
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");

  // Función para manejar la vista de detalles
  const handleViewDetails = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setMainTab("detalles");
  };

  // Función para manejar la selección de producto para respuesta
  const handleSelectProductForResponse = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setMainTab("respuesta");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 border-t-2 border-b-2 border-gray-200">
      {/* Barra de navegación superior */}
      <div className="border-b-2 border-gray-100 px-4 py-4 bg-white">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Gestión de cotizaciones
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="overflow-hidden rounded-md border bg-white shadow-sm">
          {/* Tabs Principales mejorados */}
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex">
              {tabs.map((tabItem) => {
                const Icon = tabItem.icon;
                const isActive = mainTab === tabItem.id;
                
                // Lógica de habilitación de tabs
                const isDisabled = 
                  (tabItem.id === "detalles" && !selectedQuotationId) ||
                  (tabItem.id === "respuesta" && (!selectedProductId || !selectedQuotationId));

                return (
                  <button
                    key={tabItem.id}
                    className={`
                      relative flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out
                      ${
                        isActive
                          ? "text-white bg-gradient-to-b from-orange-400/20 to-orange-400/90 border-b-2 border-orange-400"
                          : isDisabled
                          ? "text-gray-500 cursor-not-allowed opacity-50"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }
                      ${!isDisabled && !isActive ? "hover:scale-105" : ""}
                    `}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setMainTab(tabItem.id)}
                    title={tabItem.description}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                    <span className="whitespace-nowrap">{tabItem.label}</span>

                    {/* Indicador activo mejorado */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabAdmin"
                        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-t-lg"
                        initial={false}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}

                    {/* Efecto hover */}
                    {!isActive && !isDisabled && (
                      <div className="absolute bg-white/0 hover:bg-white/5 transition-colors duration-200 rounded-t-lg" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Línea divisoria sutil */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          </div>

          {/* Contenidos de las tabs */}
          {mainTab === "solicitudes" && (
            <SolicitudesTab onViewDetails={handleViewDetails} />
          )}

          {mainTab === "detalles" && selectedQuotationId && (
            <DetallesTab 
              selectedQuotationId={selectedQuotationId}
              onSelectProductForResponse={handleSelectProductForResponse}
            />
          )}

          {mainTab === "respuesta" && selectedProductId && selectedQuotationId && (
            <RespuestaTab
              selectedQuotationId={selectedQuotationId}
              selectedProductId={selectedProductId}
              selectedProductName={selectedProductName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
