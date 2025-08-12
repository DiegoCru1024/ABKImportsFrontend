import {
  createQuatitationResponse,
  deleteQuatitationResponse,
  patchQuatitationResponse,
  getResponsesForUsers,
  listQuatitationResponses,
  getListResponsesByQuotationId,
  getDetailsResponse,
  } from "@/api/quotation-responses";
import type { QuotationResponseDTO } from "@/api/interface/quotationResponseInterfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Función para aplicar valores por defecto a un QuotationResponseDTO
 * @param data - Los datos originales
 * @returns {QuotationResponseDTO} - Los datos con valores por defecto aplicados
 */
const applyDefaultValues = (data: QuotationResponseDTO): QuotationResponseDTO => {
  return {
    ...data,
    quotationInfo: {
      quotationId: data.quotationInfo?.quotationId || "",
      correlative: data.quotationInfo?.correlative || "",
      status: data.quotationInfo?.status || "ANSWERED",
      date: data.quotationInfo?.date || "",
      serviceType: data.quotationInfo?.serviceType || "",
      cargoType: data.quotationInfo?.cargoType || "",
      courier: data.quotationInfo?.courier || "",
      incoterm: data.quotationInfo?.incoterm || "",
      isFirstPurchase: data.quotationInfo?.isFirstPurchase ?? false,
      regime: data.quotationInfo?.regime || "",
      originCountry: data.quotationInfo?.originCountry || "",
      destinationCountry: data.quotationInfo?.destinationCountry || "",
      customs: data.quotationInfo?.customs || "",
      originPort: data.quotationInfo?.originPort || "",
      destinationPort: data.quotationInfo?.destinationPort || "",
      serviceTypeDetail: data.quotationInfo?.serviceTypeDetail || "",
      transitTime: data.quotationInfo?.transitTime || 0.0,
      naviera: data.quotationInfo?.naviera || "",
      proformaValidity: data.quotationInfo?.proformaValidity || "",
      id_asesor: data.quotationInfo?.id_asesor || "",
    },
    dynamicValues: {
      comercialValue: data.dynamicValues?.comercialValue || 0.0,
      flete: data.dynamicValues?.flete || 0.0,
      cajas: data.dynamicValues?.cajas || 0.0,
      desaduanaje: data.dynamicValues?.desaduanaje || 0.0,
      kg: data.dynamicValues?.kg || 0.0,
      ton: data.dynamicValues?.ton || 0.0,
      kv: data.dynamicValues?.kv || 0.0,
      fob: data.dynamicValues?.fob || 0.0,
      seguro: data.dynamicValues?.seguro || 0.0,
      tipoCambio: data.dynamicValues?.tipoCambio || 0.0,
      nroBultos: data.dynamicValues?.nroBultos || 0.0,
      volumenCBM: data.dynamicValues?.volumenCBM || 0.0,
      calculoFlete: data.dynamicValues?.calculoFlete || 0.0,
      servicioConsolidado: data.dynamicValues?.servicioConsolidado || 0.0,
      separacionCarga: data.dynamicValues?.separacionCarga || 0.0,
      inspeccionProductos: data.dynamicValues?.inspeccionProductos || 0.0,
      gestionCertificado: data.dynamicValues?.gestionCertificado || 0.0,
      inspeccionProducto: data.dynamicValues?.inspeccionProducto || 0.0,
      inspeccionFabrica: data.dynamicValues?.inspeccionFabrica || 0.0,
      transporteLocal: data.dynamicValues?.transporteLocal || 0.0,
      otrosServicios: data.dynamicValues?.otrosServicios || 0.0,
      adValoremRate: data.dynamicValues?.adValoremRate || 0.0,
      antidumpingGobierno: data.dynamicValues?.antidumpingGobierno || 0.0,
      antidumpingCantidad: data.dynamicValues?.antidumpingCantidad || 0.0,
      iscRate: data.dynamicValues?.iscRate || 0.0,
      igvRate: data.dynamicValues?.igvRate || 0.0,
      ipmRate: data.dynamicValues?.ipmRate || 0.0,
      percepcionRate: data.dynamicValues?.percepcionRate || 0.0,
      transporteLocalChinaEnvio: data.dynamicValues?.transporteLocalChinaEnvio || 0.0,
      transporteLocalClienteEnvio: data.dynamicValues?.transporteLocalClienteEnvio || 0.0,
      cif: data.dynamicValues?.cif || 0.0,
      shouldExemptTaxes: data.dynamicValues?.shouldExemptTaxes ?? false,
    },
    exemptions: {
      servicioConsolidadoAereo: data.exemptions?.servicioConsolidadoAereo ?? false,
      separacionCarga: data.exemptions?.separacionCarga ?? false,
      inspeccionProductos: data.exemptions?.inspeccionProductos ?? false,
      obligacionesFiscales: data.exemptions?.obligacionesFiscales ?? false,
      desaduanajeFleteSaguro: data.exemptions?.desaduanajeFleteSaguro ?? false,
      transporteLocalChina: data.exemptions?.transporteLocalChina ?? false,
      transporteLocalCliente: data.exemptions?.transporteLocalCliente ?? false,
      servicioConsolidadoMaritimo: data.exemptions?.servicioConsolidadoMaritimo ?? false,
      gestionCertificado: data.exemptions?.gestionCertificado ?? false,
      servicioInspeccion: data.exemptions?.servicioInspeccion ?? false,
      transporteLocal: data.exemptions?.transporteLocal ?? false,
      totalDerechos: data.exemptions?.totalDerechos ?? false,
    },
    serviceCalculations: {
      serviceFields: {
        servicioConsolidado: data.serviceCalculations?.serviceFields?.servicioConsolidado || 0.0,
        separacionCarga: data.serviceCalculations?.serviceFields?.separacionCarga || 0.0,
        inspeccionProductos: data.serviceCalculations?.serviceFields?.inspeccionProductos || 0.0,
      },
      subtotalServices: data.serviceCalculations?.subtotalServices || 0.0,
      igvServices: data.serviceCalculations?.igvServices || 0.0,
      totalServices: data.serviceCalculations?.totalServices || 0.0,
      fiscalObligations: {
        adValorem: data.serviceCalculations?.fiscalObligations?.adValorem || 0.0,
        antidumping: data.serviceCalculations?.fiscalObligations?.antidumping || 0.0,
        isc: data.serviceCalculations?.fiscalObligations?.isc || 0.0,
        baseIgvIpm: data.serviceCalculations?.fiscalObligations?.baseIgvIpm || 0.0,
        igvFiscal: data.serviceCalculations?.fiscalObligations?.igvFiscal || 0.0,
        ipm: data.serviceCalculations?.fiscalObligations?.ipm || 0.0,
        percepcion: data.serviceCalculations?.fiscalObligations?.percepcion || 0.0,
        totalDerechosDolares: data.serviceCalculations?.fiscalObligations?.totalDerechosDolares || 0.0,
        totalDerechosSoles: data.serviceCalculations?.fiscalObligations?.totalDerechosSoles || 0.0,
        totalDerechosDolaresFinal: data.serviceCalculations?.fiscalObligations?.totalDerechosDolaresFinal || 0.0,
      },
      importExpenses: {
        servicioConsolidadoFinal: data.serviceCalculations?.importExpenses?.servicioConsolidadoFinal || 0.0,
        separacionCargaFinal: data.serviceCalculations?.importExpenses?.separacionCargaFinal || 0.0,
        inspeccionProductosFinal: data.serviceCalculations?.importExpenses?.inspeccionProductosFinal || 0.0,
        servicioConsolidadoMaritimoFinal: data.serviceCalculations?.importExpenses?.servicioConsolidadoMaritimoFinal || 0.0,
        gestionCertificadoFinal: data.serviceCalculations?.importExpenses?.gestionCertificadoFinal || 0.0,
        servicioInspeccionFinal: data.serviceCalculations?.importExpenses?.servicioInspeccionFinal || 0.0,
        transporteLocalFinal: data.serviceCalculations?.importExpenses?.transporteLocalFinal || 0.0,
        desaduanajeFleteSaguro: data.serviceCalculations?.importExpenses?.desaduanajeFleteSaguro || 0.0,
        finalValues: {
          servicioConsolidado: data.serviceCalculations?.importExpenses?.finalValues?.servicioConsolidado || 0.0,
          gestionCertificado: data.serviceCalculations?.importExpenses?.finalValues?.gestionCertificado || 0.0,
          servicioInspeccion: data.serviceCalculations?.importExpenses?.finalValues?.servicioInspeccion || 0.0,
          transporteLocal: data.serviceCalculations?.importExpenses?.finalValues?.transporteLocal || 0.0,
          separacionCarga: data.serviceCalculations?.importExpenses?.finalValues?.separacionCarga || 0.0,
          inspeccionProductos: data.serviceCalculations?.importExpenses?.finalValues?.inspeccionProductos || 0.0,
          desaduanajeFleteSaguro: data.serviceCalculations?.importExpenses?.finalValues?.desaduanajeFleteSaguro || 0.0,
          transporteLocalChina: data.serviceCalculations?.importExpenses?.finalValues?.transporteLocalChina || 0.0,
          transporteLocalCliente: data.serviceCalculations?.importExpenses?.finalValues?.transporteLocalCliente || 0.0,
        },
        totalGastosImportacion: data.serviceCalculations?.importExpenses?.totalGastosImportacion || 0.0,
      },
      totals: {
        inversionTotal: data.serviceCalculations?.totals?.inversionTotal || 0.0,
      },
    },
    unitCostProducts: data.unitCostProducts?.map(product => ({
      id: product.id || "",
      name: product.name || "",
      price: product.price || 0.0,
      quantity: product.quantity || 0.0,
      total: product.total || 0.0,
      equivalence: product.equivalence || 0.0,
      importCosts: product.importCosts || 0.0,
      totalCost: product.totalCost || 0.0,
      unitCost: product.unitCost || 0.0,
    })) || [],
  };
};


/**
 * Hook para crear una respuesta de una cotización con valores por defecto
 * @returns {useMutation} - La respuesta de la cotización creada
 */
export function useCreateQuatitationResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      quotationId,
    }: {
      data: QuotationResponseDTO;
      quotationId: string;
    }) => {
      // Aplicar valores por defecto antes de enviar
      const dataWithDefaults = applyDefaultValues(data);
      return createQuatitationResponse(dataWithDefaults, quotationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allQuatitationResponse"],
      });
      toast.success("Respuesta de cotización creada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al crear la respuesta de la cotización:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al crear la respuesta de la cotización");
      }
    },
  });
}

/**
 * Hook para eliminar una respuesta de una cotización
 * @param {string} quotationResponseId - El ID de la respuesta
 * @returns {useMutation} - La respuesta de la cotización eliminada
 */
export function useDeleteQuatitationResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quotationResponseId: string) => deleteQuatitationResponse(quotationResponseId),
    onSuccess: () => {
      toast.success("Respuesta de cotización eliminada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar la respuesta de la cotización:", error);
      throw error;
    },
    onSettled: () => {
      // Invalida tanto el listado general como el listado por quotationId
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [key] = query.queryKey as unknown as [string];
          return (
            key === "allQuatitationResponse" ||
            key === "getListResponsesByQuotationId"
          );
        },
      });
    },
  });
}

/**
 * Hook para actualizar una respuesta de una cotización
 * @param {string} quotationId - El ID de la cotización
 * @param {string} quotationResponseId - El ID de la respuesta
 * @returns {useMutation} - La respuesta de la cotización actualizada
 */
export function usePatchQuatitationResponse(quotationId: string, quotationResponseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: QuotationResponseDTO;
    }) => patchQuatitationResponse(quotationId, quotationResponseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allQuatitationResponse"],
      });
      toast.success("Respuesta de cotización actualizada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar la respuesta de la cotización:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error desconocido al actualizar la respuesta de la cotización");
      }
    },
  });
}

/**
 * Hook para listar las respuestas de una cotización
 * @param {string} quotationId - El ID de la cotización
 * @param {number} page - La página actual
 * @param {number} size - El tamaño de la página
 * @returns {useQuery} - Las respuestas de la cotización
 */
export function useListQuatitationResponse(quotationId: string, page: number, size: number) {
  return useQuery({
    queryKey: ["allQuatitationResponse", quotationId, page, size],
    queryFn: () => listQuatitationResponses(quotationId, page, size),
  });
}

/**
 * Hook para obtener las respuestas de una cotización
 * @param {string} quotationId - El ID de la cotización
 * @returns {useQuery} - Las respuestas de la cotización
 */
export function useGetQuatitationResponse(quotationId: string) {
  return useQuery({
    queryKey: ["allQuatitationResponse", quotationId],
    queryFn: () => getResponsesForUsers(quotationId),
  });
}


/**
 * Hook para obtener las respuestas de una cotización por su ID (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @param {number} page - La página actual
 * @param {number} size - El tamaño de la página
 * @returns {useQuery} - Las respuestas de la cotización
 */
export function useGetListResponsesByQuotationId(quotationId: string, page: number, size: number) {
  return useQuery({
    queryKey: ["getListResponsesByQuotationId", quotationId, page, size],
    queryFn: () => getListResponsesByQuotationId(quotationId, page, size),
    enabled: Boolean(quotationId),
  });
}


/**
 * Hook para obtener los detalles de una respuesta de una cotización por su ID (Admin Only)
 * @param {string} quotationId - El ID de la cotización
 * @param {string} quotationResponseId - El ID de la respuesta
 * @returns {useQuery} - Los detalles de la respuesta
 */
export function useGetDetailsResponse(quotationId: string, quotationResponseId: string) {
  return useQuery({
    queryKey: ["getDetailsResponse", quotationId, quotationResponseId],
    queryFn: () => getDetailsResponse(quotationId, quotationResponseId),
  });
}
