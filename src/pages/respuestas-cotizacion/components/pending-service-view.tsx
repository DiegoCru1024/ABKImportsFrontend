import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { QuotationResponseSummaryCard } from "./quotation-response-summary-card";
import { QuotationResponseProductRow } from "./quotation-response-product-row";

interface PendingServiceViewProps {
  serviceResponse: any;
}

export function PendingServiceView({ serviceResponse }: PendingServiceViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Detalles del Servicio - {serviceResponse.serviceLogistic}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Servicio Logístico</h4>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {serviceResponse.serviceLogistic}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Incoterm</h4>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {serviceResponse.incoterm}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Tipo de Carga</h4>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {serviceResponse.cargoType}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Courier</h4>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {serviceResponse.courier}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <QuotationResponseSummaryCard basicInfo={serviceResponse.basicInfo} />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Productos Cotizados ({serviceResponse.products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceResponse.products.map((product, index) => (
              <QuotationResponseProductRow
                key={product.productId}
                product={product}
                index={index}
                type="PENDING"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}