import { useState } from "react";
import { FileText } from "lucide-react";


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
  const handleSelectProductForResponse = (
    productId: string,
    productName: string
  ) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setMainTab("respuesta");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 border-t-2 border-b-2 border-gray-200">
      {/* Barra de navegación superior */}
      <div className="border-b-2 px-4 py-4 backdrop-blur-sm sticky border-border/60 bg-background/80">
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

      <div className="w-full p-2">
        <div className="overflow-x-auto rounded-lg bg-white  shadow-sm">
          {/* Tabs Principales mejorados */}
          <div className="relative flex bg-gray-50/50">
            {tabs.map((tabItem, index) => {
              const Icon = tabItem.icon;
              const isActive = mainTab === tabItem.id;
              // Lógica de habilitación de tabs
              const isDisabled =
                (tabItem.id === "detalles" && !selectedQuotationId) ||
                (tabItem.id === "respuesta" && (!selectedProductId || !selectedQuotationId));
              return (
                <button
                  key={tabItem.id}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && setMainTab(tabItem.id)}
                  className={`
                    relative flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ease-out
                    flex items-center justify-center gap-2 group
                    ${isActive ? "text-orange-700 bg-orange-50" : "text-gray-600 hover:text-orange-600 hover:bg-orange-25"}
                    ${index !== tabs.length - 1 ? "border-r border-gray-200" : ""}
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <Icon
                    size={18}
                    className={`
                      transition-all duration-300 ease-out
                      ${isActive ? "text-orange-600 scale-110" : "text-gray-500 group-hover:text-orange-500 group-hover:scale-105"}
                    `}
                  />
                  <span className="transition-all duration-300 ease-out">
                    {tabItem.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 animate-in slide-in-from-bottom-1 duration-300" />
                  )}
                </button>
              );
            })}
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

          {mainTab === "respuesta" &&
            selectedProductId &&
            selectedQuotationId && (
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
