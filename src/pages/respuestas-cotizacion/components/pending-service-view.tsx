import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { ResponseInformationDTO } from "@/api/interface/quotationResponseInterfaces";
import type { ResponseDataPending } from "@/api/interface/quotation-response/dto/pending/response-data-pending";
import type { PendingProductInterface } from "@/api/interface/quotation-response/dto/pending/products/pending-products";

import { PendingProductTable } from "./pending-product-table";

interface PendingServiceViewProps {
  serviceResponse: ResponseInformationDTO;
  quotationDetail?: any;
}

export function PendingServiceView({ serviceResponse, quotationDetail }: PendingServiceViewProps) {
  const responseData = serviceResponse.responseData as ResponseDataPending;
  const products = serviceResponse.products as PendingProductInterface[];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Información General del Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Servicio Logístico</h4>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                {responseData.generalInformation.serviceLogistic}
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Incoterm</h4>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {responseData.generalInformation.incoterm}
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Tipo de Carga</h4>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {responseData.generalInformation.cargoType}
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Courier</h4>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {responseData.generalInformation.courier}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Resumen de Cotización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Cantidad Total</h4>
              <p className="text-lg font-bold text-gray-800">
                {responseData.resumenInfo.totalQuantity} unidades
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Total CBM</h4>
              <p className="text-lg font-bold text-gray-800">
                {responseData.resumenInfo.totalCBM.toFixed(2)} m³
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Peso Total</h4>
              <p className="text-lg font-bold text-gray-800">
                {responseData.resumenInfo.totalWeight.toFixed(2)} kg
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Precio Total</h4>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(responseData.resumenInfo.totalPrice)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Total Express</h4>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(responseData.resumenInfo.totalExpress)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Productos Cotizados ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map((product, index) => (
            <PendingProductTable
              key={product.productId}
              product={product}
              index={index}
              quotationDetail={quotationDetail}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}