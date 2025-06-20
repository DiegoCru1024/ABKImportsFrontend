import {
  FileText,
} from "lucide-react";
import { useState } from "react";

import { motion } from "framer-motion";
import { tabs } from "./components/utils/static";

// Importar componentes modulares
import QuotationsListTab from "./components/tabs/QuotationsListTab";
import QuotationDetailsTab from "./components/tabs/QuotationDetailsTab";

export default function MisCotizacionesView() {
  //********Tabs**** */
  const [tab, setTab] = useState("mis");

  //********Cotización seleccionada**** */
  const [selectedCotizacionId, setSelectedCotizacionId] = useState<string>("");

  // Función para manejar la vista de detalles
  const handleViewDetails = (quotationId: string) => {
    setSelectedCotizacionId(quotationId);
    setTab("detalles");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      {/* Top Navigation Bar */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full p-1 px-16 py-4 border-b border-border/60">
          <div className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Mis cotizaciones
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="w-fill  p-4 px-16">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {/* Tabs mejorados */}
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex">
              {tabs.map((tabItem) => {
                const Icon = tabItem.icon;
                const isActive = tab === tabItem.id;
                const isDisabled = tabItem.disabled;

                return (
                  <button
                    key={tabItem.id}
                    className={`
                    relative flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? "text-white bg-gradient-to-b from-orange-400/2 to-orange-400/90 border-b-2 border-orange-400"
                        : isDisabled
                        ? "text-gray-500 cursor-not-allowed opacity-50"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }
                    ${!isDisabled && !isActive ? "hover:scale-105" : ""}
                  `}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setTab(tabItem.id)}
                    title={tabItem.description}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : ""}`}
                    />
                    <span className="whitespace-nowrap">{tabItem.label}</span>

                    {/* Indicador activo mejorado */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
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

          {/* Contenidos */}
          {tab === "mis" && (
            <QuotationsListTab onViewDetails={handleViewDetails} />
          )}

          {tab === "detalles" && selectedCotizacionId && (
            <QuotationDetailsTab selectedQuotationId={selectedCotizacionId} />
          )}

          {tab === "seguimiento" && (
            <div className="space-y-4 p-6">
              <div className="text-center text-muted-foreground py-8">
                Esta funcionalidad estará disponible próximamente.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
