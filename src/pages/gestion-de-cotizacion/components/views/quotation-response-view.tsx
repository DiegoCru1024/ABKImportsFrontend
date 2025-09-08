import { useState } from "react";
import { FileText, Send, Loader2 } from "lucide-react";

import { useGetQuotationById } from "@/hooks/use-quation";
import { useCreateQuatitationResponse } from "@/hooks/use-quatitation-response";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import SendingModal from "@/components/sending-modal";

import { QuotationSummaryCard } from "../forms/quotation-summary-card";
import { QuotationConfigurationForm } from "../forms/quotation-configuration-form";
import { MaritimeServiceForm } from "../forms/maritime-service-form";
import { DynamicValuesForm } from "../forms/dynamic-values-form";
import { ExemptionControls } from "../forms/exemption-controls";

import { useQuotationResponseForm } from "../../hooks/use-quotation-response-form";
import { useQuotationCalculations } from "../../hooks/use-quotation-calculations";
import type { DetailsResponseProps } from "../utils/interface";
import {
  aduana,
  courier,
  incotermsOptions,
  paisesDestino,
  paisesOrigen,
  proformaVigencia,
  puertosDestino,
  puertosSalida,
  regimenOptions,
  serviciosLogisticos,
  tipoServicio,
  typeLoad,
} from "../utils/static";
import ServiceConsolidationCard from "./partials/ServiceConsolidationCard";
import ImportExpensesCard from "./partials/ImportExpensesCard";
import ImportSummaryCard from "./partials/ImportSummaryCard";
import TaxObligationsCard from "./partials/TaxObligationsCard";
import EditableUnitCostTable from "./tables/editable-unit-cost-table";

export default function QuotationResponseView({
  selectedQuotationId,
}: DetailsResponseProps) {
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  const createQuotationResponseMutation = useCreateQuatitationResponse();

  const quotationForm = useQuotationResponseForm();

  // Mapear productos de la API al formato esperado por los cálculos
  const mappedProducts = (quotationDetail?.products || []).map(product => ({
    id: product.productId,
    name: product.name,
    quantity: product.quantity,
    boxes: product.number_of_boxes,
    priceXiaoYi: 0, // Valor por defecto
    cbmTotal: parseFloat(product.volume) || 0,
    express: 0, // Valor por defecto
    total: 0, // Valor por defecto
    cbm: parseFloat(product.volume) || 0,
    weight: parseFloat(product.weight) || 0,
    price: 0, // Valor por defecto
    variants: product.variants?.map(variant => ({
      id: variant.variantId,
      name: `${variant.size} - ${variant.presentation} - ${variant.model} - ${variant.color}`,
      quantity: 1, // Valor por defecto
      price: 0, // Valor por defecto
      weight: 0, // Valor por defecto
      cbm: 0, // Valor por defecto
      express: 0, // Valor por defecto
    })) || []
  }));

  const calculations = useQuotationCalculations({
    products: mappedProducts,
    dynamicValues: quotationForm.dynamicValues,
    cif: quotationForm.cif,
    exemptionState: quotationForm.exemptionState as unknown as Record<string, boolean>,
    productQuotationState: quotationForm.productQuotationState,
    variantQuotationState: quotationForm.variantQuotationState,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitQuotation = async () => {
    setIsSubmitting(true);
    try {
      // Lógica para enviar la cotización
      // Esta sección necesitará la implementación específica del DTO
      console.log("Enviando cotización...", {
        quotationId: selectedQuotationId,
        formData: quotationForm,
        calculations,
      });

      quotationForm.setIsSendingModalOpen(true);
    } catch (error) {
      console.error("Error al enviar cotización:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Cargando Cotización"
          description="Obteniendo detalles de la cotización..."
        />
        <LoadingState
          message="Cargando detalles de la cotización..."
          variant="card"
        />
      </div>
    );
  }

  if (isError || !quotationDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Error"
          description="No se pudo cargar la cotización"
        />
        <ErrorState
          title="Error al cargar la cotización"
          message="Por favor, intente recargar la página o contacte al administrador."
          variant="card"
        />
      </div>
    );
  }

  // Detectar si es vista "Pendiente" (administrativa) vs vista completa
  const isPendingView = quotationForm.selectedServiceLogistic === "Pendiente";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      <SectionHeader
        icon={<FileText className="h-6 w-6 text-white" />}
        title={
          isPendingView
            ? "Responder Cotización - Vista Administrativa"
            : "Responder Cotización - Vista Completa"
        }
        description={`Respondiendo cotización #${selectedQuotationId}`}
        actions={
          <ConfirmDialog
            trigger={
              <Button
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
              </Button>
            }
            title="Confirmar Envío"
            description="¿Está seguro que desea enviar esta respuesta de cotización?"
            onConfirm={handleSubmitQuotation}
          />
        }
      />

      <div className="container mx-auto px-4 py-6 space-y-8 max-w-full overflow-hidden">
        {/* Resumen de productos */}
        <QuotationSummaryCard
          productCount={calculations.productCount}
          totalCBM={calculations.totalCBM}
          totalWeight={calculations.totalWeight}
          totalPrice={calculations.totalPrice}
          totalExpress={calculations.totalExpress}
          totalGeneral={calculations.totalGeneral}
        />

        {/* Configuración general */}
        <QuotationConfigurationForm
          selectedServiceLogistic={quotationForm.selectedServiceLogistic}
          onServiceLogisticChange={quotationForm.setSelectedServiceLogistic}
          selectedIncoterm={quotationForm.selectedIncoterm}
          onIncotermChange={quotationForm.setSelectedIncoterm}
          selectedTypeLoad={quotationForm.selectedTypeLoad}
          onTypeLoadChange={quotationForm.setSelectedTypeLoad}
          selectedCourier={quotationForm.selectedCourier}
          onCourierChange={quotationForm.setSelectedCourier}
          serviciosLogisticos={serviciosLogisticos}
          incotermsOptions={incotermsOptions}
          typeLoad={typeLoad}
          courier={courier}
        />

        {/* Configuración marítima (solo si es servicio marítimo) */}
        {quotationForm.isMaritimeService() && (
          <MaritimeServiceForm
            selectedRegimen={quotationForm.selectedRegimen}
            onRegimenChange={quotationForm.setSelectedRegimen}
            selectedPaisOrigen={quotationForm.selectedPaisOrigen}
            onPaisOrigenChange={quotationForm.setSelectedPaisOrigen}
            selectedPaisDestino={quotationForm.selectedPaisDestino}
            onPaisDestinoChange={quotationForm.setSelectedPaisDestino}
            selectedAduana={quotationForm.selectedAduana}
            onAduanaChange={quotationForm.setSelectedAduana}
            selectedPuertoSalida={quotationForm.selectedPuertoSalida}
            onPuertoSalidaChange={quotationForm.setSelectedPuertoSalida}
            selectedPuertoDestino={quotationForm.selectedPuertoDestino}
            onPuertoDestinoChange={quotationForm.setSelectedPuertoDestino}
            selectedTipoServicio={quotationForm.selectedTipoServicio}
            onTipoServicioChange={quotationForm.setSelectedTipoServicio}
            tiempoTransito={quotationForm.tiempoTransito}
            onTiempoTransitoChange={quotationForm.setTiempoTransito}
            selectedProformaVigencia={quotationForm.selectedProformaVigencia}
            onProformaVigenciaChange={quotationForm.setSelectedProformaVigencia}
            naviera={quotationForm.naviera}
            onNavieraChange={quotationForm.setNaviera}
            regimenOptions={regimenOptions}
            paisesOrigen={paisesOrigen}
            paisesDestino={paisesDestino}
            aduana={aduana}
            puertosSalida={puertosSalida}
            puertosDestino={puertosDestino}
            tipoServicio={tipoServicio}
            proformaVigencia={proformaVigencia}
          />
        )}

        {/* Vista específica según el tipo de servicio */}
        {isPendingView ? (
          /* Vista administrativa simplificada */
          <>
            <DynamicValuesForm
              dynamicValues={quotationForm.dynamicValues}
              onUpdateValue={quotationForm.updateDynamicValue}
              onKgChange={quotationForm.handleKgChange}
              isMaritimeService={quotationForm.isMaritimeService()}
            />

            <ExemptionControls
              exemptionState={quotationForm.exemptionState}
              onExemptionChange={quotationForm.updateExemptionState}
              isMaritimeService={quotationForm.isMaritimeService()}
            />
          </>
        ) : (
          /* Vista completa con todos los componentes */
          <>
            <DynamicValuesForm
              dynamicValues={quotationForm.dynamicValues}
              onUpdateValue={quotationForm.updateDynamicValue}
              onKgChange={quotationForm.handleKgChange}
              isMaritimeService={quotationForm.isMaritimeService()}
            />

            <ServiceConsolidationCard
              title={quotationForm.getServiceName()}
              serviceFields={quotationForm.getServiceFields()}
              updateDynamicValue={(key, value) => quotationForm.updateDynamicValue(key as keyof typeof quotationForm.dynamicValues, value)}
              igvServices={Object.values(quotationForm.getServiceFields()).reduce((sum, value) => sum + (value || 0), 0) * 0.18}
              totalServices={Object.values(quotationForm.getServiceFields()).reduce((sum, value) => sum + (value || 0), 0) * 1.18}
            />

            <ImportExpensesCard
              isMaritime={quotationForm.isMaritimeService()}
              values={{
                servicioConsolidadoMaritimoFinal: quotationForm.dynamicValues.servicioConsolidado,
                gestionCertificadoFinal: quotationForm.dynamicValues.gestionCertificado,
                servicioInspeccionFinal: quotationForm.dynamicValues.inspeccionProducto,
                transporteLocalFinal: quotationForm.dynamicValues.transporteLocal,
                totalDerechosDolaresFinal: calculations.finalTotal,
                desaduanajeFleteSaguro: quotationForm.dynamicValues.desaduanaje,
                transporteLocalChinaEnvio: quotationForm.dynamicValues.transporteLocalChinaEnvio,
                transporteLocalClienteEnvio: quotationForm.dynamicValues.transporteLocalClienteEnvio,
              }}
              exemptionState={quotationForm.exemptionState as unknown as Record<string, boolean>}
              handleExemptionChange={(field, checked) => quotationForm.updateExemptionState(field as keyof typeof quotationForm.exemptionState, checked)}
              applyExemption={(value, exempted) => exempted ? 0 : value}
              servicioConsolidadoFinal={quotationForm.dynamicValues.servicioConsolidado}
              separacionCargaFinal={quotationForm.dynamicValues.separacionCarga}
              inspeccionProductosFinal={quotationForm.dynamicValues.inspeccionProductos}
              shouldExemptTaxes={quotationForm.exemptionState.obligacionesFiscales}
              totalGastosImportacion={calculations.finalTotal}
            />

            <ImportSummaryCard
              cif={quotationForm.cif}
              taxCalculations={calculations}
              exemptionState={{
                adValorem: quotationForm.exemptionState.totalDerechos,
                igv: quotationForm.exemptionState.obligacionesFiscales,
                ipm: quotationForm.exemptionState.totalDerechos,
                percepcion: quotationForm.exemptionState.obligacionesFiscales,
              }}
            />

            <TaxObligationsCard
              adValoremRate={quotationForm.dynamicValues.adValoremRate}
              setAdValoremRate={(v) => quotationForm.updateDynamicValue("adValoremRate", v)}
              igvRate={quotationForm.dynamicValues.igvRate}
              setIgvRate={(v) => quotationForm.updateDynamicValue("igvRate", v)}
              ipmRate={quotationForm.dynamicValues.ipmRate}
              setIpmRate={(v) => quotationForm.updateDynamicValue("ipmRate", v)}
              isMaritime={quotationForm.isMaritimeService()}
              antidumpingGobierno={quotationForm.dynamicValues.antidumpingGobierno}
              setAntidumpingGobierno={(v) => quotationForm.updateDynamicValue("antidumpingGobierno", v)}
              antidumpingCantidad={quotationForm.dynamicValues.antidumpingCantidad}
              setAntidumpingCantidad={(v) => quotationForm.updateDynamicValue("antidumpingCantidad", v)}
              iscRate={quotationForm.dynamicValues.iscRate}
              setIscRate={(v) => quotationForm.updateDynamicValue("iscRate", v)}
              values={{
                adValorem: calculations.adValoremAmount,
                igvFiscal: calculations.igv,
                ipm: calculations.ipm,
                isc: 0, // ISC no está calculado en este contexto
                percepcion: calculations.percepcion,
                totalDerechosDolares: calculations.finalTotal,
                totalDerechosSoles: calculations.finalTotalInSoles,
              }}
            />

            <EditableUnitCostTable
              products={quotationForm.editableUnitCostProducts}
              onProductsChange={quotationForm.setEditableUnitCostProducts}
            />

            <ExemptionControls
              exemptionState={quotationForm.exemptionState}
              onExemptionChange={quotationForm.updateExemptionState}
              isMaritimeService={quotationForm.isMaritimeService()}
            />
          </>
        )}
      </div>

      {/* Modales */}
      <SendingModal
        isOpen={quotationForm.isSendingModalOpen}
        onClose={() => quotationForm.setIsSendingModalOpen(false)}
      />

    </div>
  );
}
