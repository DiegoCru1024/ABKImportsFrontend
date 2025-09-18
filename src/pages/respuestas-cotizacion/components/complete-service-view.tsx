import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { QuotationResponseSummaryCard } from "./quotation-response-summary-card";
import { QuotationResponseProductRow } from "./quotation-response-product-row";

interface CompleteServiceViewProps {
  serviceResponse: any;
}

export function CompleteServiceView({ serviceResponse }: CompleteServiceViewProps) {
  const getServiceTypeLabel = () => {
    switch (serviceResponse.serviceType) {
      case "EXPRESS":
        return "Servicio Express";
      case "MARITIME":
        return "Servicio Marítimo";
      default:
        return "Servicio Completo";
    }
  };

  const getServiceTypeColor = () => {
    switch (serviceResponse.serviceType) {
      case "EXPRESS":
        return "bg-blue-100 text-blue-800";
      case "MARITIME":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              {getServiceTypeLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Badge variant="default" className={`text-lg px-4 py-2 ${getServiceTypeColor()}`}>
                {serviceResponse.serviceType}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <QuotationResponseSummaryCard basicInfo={serviceResponse.basicInfo} />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Productos con Costos Calculados ({serviceResponse.products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceResponse.products.map((product, index) => (
              <QuotationResponseProductRow
                key={product.productId}
                product={product}
                index={index}
                type={serviceResponse.serviceType}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Los costos mostrados incluyen todos los gastos de importación, aranceles,
                y servicios logísticos para el tipo de servicio {serviceResponse.serviceType.toLowerCase()}.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}