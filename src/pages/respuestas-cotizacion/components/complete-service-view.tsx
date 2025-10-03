import {
  DollarSign,
  FileText,
  Package,
  Ship,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { ResponseInformationDTO } from "@/api/interface/quotationResponseInterfaces";
import type { ResponseDataComplete } from "@/api/interface/quotation-response/dto/complete/response-data-complete";
import type { CompleteProductInterface } from "@/api/interface/quotation-response/dto/complete/products/complete-products";

import { CompleteProductTable } from "./complete-product-table";

interface CompleteServiceViewProps {
  serviceResponse: ResponseInformationDTO;
  quotationDetail?: any;
}

export function CompleteServiceView({ serviceResponse, quotationDetail }: CompleteServiceViewProps) {
  const responseData = serviceResponse.responseData as ResponseDataComplete;
  const products = serviceResponse.products as CompleteProductInterface[];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Tipo de Servicio</h4>
              <Badge variant="default" className={`text-lg px-4 py-2 ${getServiceTypeColor()}`}>
                {responseData.type}
              </Badge>
            </div>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Resumen de Información</span>
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

      {serviceResponse.serviceType === "MARITIME" && responseData.maritimeConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ship className="h-5 w-5" />
              <span>Configuración Marítima</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Régimen</h4>
                <p className="text-sm text-gray-800">{responseData.maritimeConfig.regime}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Aduana</h4>
                <p className="text-sm text-gray-800">{responseData.maritimeConfig.customs}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Naviera</h4>
                <p className="text-sm text-gray-800">{responseData.maritimeConfig.naviera}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Puerto Origen</h4>
                <p className="text-sm text-gray-800">{responseData.maritimeConfig.originPort}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Puerto Destino</h4>
                <p className="text-sm text-gray-800">{responseData.maritimeConfig.destinationPort}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">Tiempo de Tránsito</h4>
                <p className="text-sm text-gray-800">{responseData.maritimeConfig.transitTime} días</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">País Origen</h4>
                <p className="text-sm text-gray-800">{responseData.maritimeConfig.originCountry}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-600">País Destino</h4>
                <p className="text-sm text-gray-800">{responseData.maritimeConfig.destinationCountry}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Obligaciones Fiscales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Ad Valorem</h4>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(responseData.fiscalObligations.adValorem)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">IGV</h4>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(responseData.fiscalObligations.igv)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">IPM</h4>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(responseData.fiscalObligations.ipm)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Antidumping</h4>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(responseData.fiscalObligations.antidumping)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Total Impuestos</h4>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(responseData.fiscalObligations.totalTaxes)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Gastos de Importación</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total de Gastos</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(responseData.importCosts.totalExpenses)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Resumen de Cotización</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Valor Comercial</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(responseData.quoteSummary.comercialValue)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Total Gastos</h4>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(responseData.quoteSummary.totalExpenses)}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Inversión Total</h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(responseData.quoteSummary.totalInvestment)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Productos con Costos Calculados ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map((product, index) => (
            <CompleteProductTable
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