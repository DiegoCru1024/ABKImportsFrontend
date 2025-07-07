import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";

import { columnsQuotationsList } from "../../../mis-cotizaciones/components/table/columnsQuotationsList";

import SendingModal from "@/components/sending-modal";

import { useGenerateInspectionId } from "@/hooks/use-inspections";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetQuotationsListWithPagination } from "@/hooks/use-quation";

interface SolicitudesTabProps {
  onViewDetails: (quotationId: string) => void;
}

const SolicitudesTab: React.FC<SolicitudesTabProps> = ({ onViewDetails }) => {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [sendId, setSendId] = useState(false);
  const [shippingServiceType, setShippingServiceType] = useState("maritime");
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(
    null
  );
  const [selectedCorrelative, setSelectedCorrelative] = useState<string | null>(
    null
  );
  const { mutate: generateInspectionId } = useGenerateInspectionId();
  // Estados para nueva creación y eliminación
  const [searchTerm, setSearchTerm] = useState("");
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const {
    data: dataQuotations,
    isLoading,
    isError,
  } = useGetQuotationsListWithPagination(
    searchTerm,
    pageInfo.pageNumber,
    pageInfo.pageSize
  );

  // Configurar datos para la tabla con paginación mock

  useEffect(() => {
    if (dataQuotations) {
      console.log("data", dataQuotations);
      setData(dataQuotations.content); // Aquí actualizas el estado de forma controlada
      setPageInfo({
        pageNumber: dataQuotations.pageNumber,
        pageSize: dataQuotations.pageSize,
        totalElements: dataQuotations.totalElements,
        totalPages: dataQuotations.totalPages,
      });
    }
  }, [dataQuotations, isLoading]);

  const handlePageChange = (page: number, pageSize: number) => {
    console.log(`Cambiando a página ${page} con tamaño ${pageSize}`);
    setPageInfo((prev) => ({
      ...prev,
      pageNumber: page,
      pageSize: pageSize,
    }));
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPageInfo((prev) => ({
      ...prev,
      pageNumber: 0,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-red-600">
          Error al cargar las solicitudes de cotización. Por favor, intente
          nuevamente.
        </div>
      </div>
    );
  }

  const handleGenerateInspectionId = (
    quotationId: string,
    correlative: string
  ) => {
    setSelectedQuotation(quotationId);
    setSelectedCorrelative(correlative);
    setOpen(true);
  };

  const handleSendId = (quotationId: string, shipping_service_type: string) => {
    if (shipping_service_type === "aereo") {
      shipping_service_type = "aerial";
    } else if (shipping_service_type === "maritimo") {
      shipping_service_type = "maritime";
    }
    try {
      setSendId(true);
      generateInspectionId({
        quotation_id: quotationId,
        shipping_service_type: shipping_service_type,
      });
    } catch (error) {
      console.error("Error al generar el id de inspección", error);
    } finally {
      setSendId(false);
    }
  };

  const columns = columnsQuotationsList({
    onViewDetails,
    onGenerateInspectionId: handleGenerateInspectionId,
  });

  return (
    <div>
      <div className="space-y-4 p-6">
        <p className="text-black leading-relaxed">
          Aquí podrá ver todas las solicitudes de cotización recibidas.
        </p>
        <DataTable
          columns={columns}
          data={data}
          pageInfo={pageInfo}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          isLoading={isLoading}
          toolbarOptions={{ showSearch: true, showViewOptions: false }}
          paginationOptions={{
            showSelectedCount: true,
            showPagination: true,
            showNavigation: true,
          }}
        />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Id de Inspección</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <p>{`¿Desea generar un id de inspección para la cotización ${selectedCorrelative}?`}</p>
            <p>Ingrese el tipo de envío</p>
            <Select
              value={shippingServiceType}
              onValueChange={setShippingServiceType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de envío" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aerial">aerial</SelectItem>
                <SelectItem value="maritime">maritime</SelectItem>
              </SelectContent>
            </Select>
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() => {
                handleSendId(selectedQuotation as string, shippingServiceType);
                console.log("Click");
              }}
            >
              Generar Id de Inspección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SendingModal isOpen={sendId} onClose={() => setSendId(false)} />
    </div>
  );
};

export default SolicitudesTab;
