import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { useGetQuotationsByUser } from "@/hooks/use-quation";
import { columnsQuotationsList } from "../../../MisCotizaciones/components/table/columnsQuotationsList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SolicitudesTabProps {
  onViewDetails: (quotationId: string) => void;
}

const SolicitudesTab: React.FC<SolicitudesTabProps> = ({ onViewDetails }) => {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  // Estados para nueva creación y eliminación
  const [searchTerm, setSearchTerm] = useState("");
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const { data: dataQuotations, isLoading, isError } = useGetQuotationsByUser();

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

  const handleGenerateInspectionId = (quotationId: string, estado: string) => {
    console.log("Generar Id de Inspección", quotationId, estado);
    setOpen(true);
  };

  const columns = columnsQuotationsList({
    onViewDetails,
    onGenerateInspectionId: handleGenerateInspectionId,
  });

  return (
    <>
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
        <DialogHeader>
          <DialogTitle>Generar Id de Inspección</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <DialogDescription>
            <p>
              ¿Desea generar un id de inspección para la cotización{" "}
              {data[0]?.correlative}?
            </p>
            <p>
              Esta acción generará un id de inspección de mercancias para la
              cotización <br />
              <span className="text-red-500">
                Esta acción no se puede deshacer.
              </span>
            </p>
            <p>¿Desea continuar?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button variant="default">Generar Id de Inspección</Button>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SolicitudesTab;
