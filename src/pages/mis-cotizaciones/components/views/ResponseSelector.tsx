import React from "react";
import {
  User,
  Calendar,
  Tag,
  Truck,
  Mail,
  ChevronDown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuotationResponse {
  quotationInfo: {
    idQuotationResponse: string;
    correlative: string;
    date: string;
    serviceType: string;
    cargoType: string;
    courier: string;
    incoterm: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  serviceType: string;
  products: any[];
}

interface ResponseSelectorProps {
  responses: QuotationResponse[];
  selectedResponseId: string | null;
  onResponseSelect: (responseId: string) => void;
}

export default function ResponseSelector({
  responses,
  selectedResponseId,
  onResponseSelect,
}: ResponseSelectorProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getServiceTypeBadge = (serviceType: string) => {
    const serviceConfig = {
      "Pendiente": { color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
      "Marítimo": { color: "bg-blue-100 text-blue-800", icon: "🚢" },
      "Aéreo": { color: "bg-sky-100 text-sky-800", icon: "✈️" },
      "Express": { color: "bg-purple-100 text-purple-800", icon: "⚡" },
    };
    
    const config = serviceConfig[serviceType as keyof typeof serviceConfig] || 
                   { color: "bg-gray-100 text-gray-800", icon: "📦" };
    
    return (
      <Badge className={`${config.color} font-medium`}>
        <span className="mr-1">{config.icon}</span>
        {serviceType}
      </Badge>
    );
  };

  if (responses.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-muted-foreground text-lg">
              No hay respuestas disponibles para esta cotización
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (responses.length === 1) {
    const response = responses[0];
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-blue-900">Respuesta de Cotización</span>
            {getServiceTypeBadge(response.serviceType)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-blue-900">{response.user.name}</div>
                <div className="text-sm text-blue-600 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {response.user.email}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Fecha</div>
                <div className="text-sm text-gray-600">{formatDate(response.quotationInfo.date)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Detalles</div>
                <div className="text-sm text-gray-600">
                  {response.quotationInfo.courier} • {response.quotationInfo.incoterm}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            Seleccionar Respuesta ({responses.length} disponibles)
          </CardTitle>
          <Badge variant="secondary" className="font-medium">
            {responses.length} respuesta{responses.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedResponseId || ""} onValueChange={onResponseSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una respuesta para visualizar...">
                {selectedResponseId && responses.find(r => r.quotationInfo.idQuotationResponse === selectedResponseId) && (
                  <div className="flex items-center gap-2">
                    <span>
                      {responses.find(r => r.quotationInfo.idQuotationResponse === selectedResponseId)?.user.name}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    {getServiceTypeBadge(responses.find(r => r.quotationInfo.idQuotationResponse === selectedResponseId)?.serviceType || "")}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {responses.map((response) => (
                <SelectItem 
                  key={response.quotationInfo.idQuotationResponse} 
                  value={response.quotationInfo.idQuotationResponse}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <div className="font-medium">{response.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {response.user.email} • {formatDate(response.quotationInfo.date)}
                      </div>
                    </div>
                    <div className="ml-4">
                      {getServiceTypeBadge(response.serviceType)}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedResponseId && (
            <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
              {(() => {
                const selectedResponse = responses.find(r => r.quotationInfo.idQuotationResponse === selectedResponseId);
                if (!selectedResponse) return null;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Administrador</div>
                      <div className="font-semibold text-blue-900">{selectedResponse.user.name}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Productos</div>
                      <div className="font-semibold text-green-600">
                        {selectedResponse.products.filter(p => p.seCotizaProducto).length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Correlativo</div>
                      <div className="font-semibold text-orange-600">{selectedResponse.quotationInfo.correlative}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Servicio</div>
                      <div className="font-semibold text-purple-600">
                        {selectedResponse.quotationInfo.courier} • {selectedResponse.quotationInfo.incoterm}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}