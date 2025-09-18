import { Card, CardContent } from "@/components/ui/card";

interface QuotationResponseSummaryCardProps {
  basicInfo: any;
}

export function QuotationResponseSummaryCard({
  basicInfo,
}: QuotationResponseSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-ES").format(num);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-slate-50 rounded-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Resumen de Respuesta</h2>
        <p className="text-slate-600 text-sm">Información general de la respuesta de cotización</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {formatNumber(basicInfo?.totalQuantity || 0)}
            </div>
            <div className="text-xs text-slate-600 font-medium">CANTIDAD TOTAL</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {parseFloat(basicInfo?.totalCBM || "0").toFixed(4)}
            </div>
            <div className="text-xs text-slate-600 font-medium">CBM TOTAL</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {parseFloat(basicInfo?.totalWeight || "0").toFixed(4)}
            </div>
            <div className="text-xs text-slate-600 font-medium">PESO (KG)</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-slate-800 mb-1">
              {formatCurrency(basicInfo?.totalPrice || 0)}
            </div>
            <div className="text-xs text-slate-600 font-medium">PRECIO</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-slate-800 mb-1">
              {formatCurrency(basicInfo?.totalExpress || 0)}
            </div>
            <div className="text-xs text-slate-600 font-medium">EXPRESS</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}