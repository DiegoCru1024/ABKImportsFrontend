import { Card, CardContent } from "@/components/ui/card";

interface QuotationSummaryCardProps {
  productCount: number;
  totalCBM: number;
  totalWeight: number;
  totalPrice: number;
  totalExpress: number;
  totalGeneral: number;
  itemCount?: number;
}

export function QuotationSummaryCard({
  productCount,
  totalCBM,
  totalWeight,
  totalPrice,
  totalExpress,
  totalGeneral,
  itemCount,
}: QuotationSummaryCardProps) {
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Resumen de Cotización</h2>
        <p className="text-slate-600 text-sm">Información general de la cotización actual</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {/* N° de Items */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {formatNumber(itemCount !== undefined ? itemCount : productCount)}
            </div>
            <div className="text-xs text-slate-600 font-medium">N° de Items</div>
          </CardContent>
        </Card>

        {/* N° Productos */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">{productCount}</div>
            <div className="text-xs text-slate-600 font-medium">N° PRODUCTOS</div>
          </CardContent>
        </Card>

        {/* CBM Total */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">{totalCBM.toFixed(2)}</div>
            <div className="text-xs text-slate-600 font-medium">CBM TOTAL</div>
          </CardContent>
        </Card>

        {/* Peso */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">{totalWeight.toFixed(1)}</div>
            <div className="text-xs text-slate-600 font-medium">PESO (KG)</div>
          </CardContent>
        </Card>

        {/* Precio Total */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-slate-800 mb-1">{formatCurrency(totalPrice)}</div>
            <div className="text-xs text-slate-600 font-medium">PRECIO</div>
          </CardContent>
        </Card>

        {/* Express */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-slate-800 mb-1">{formatCurrency(totalExpress)}</div>
            <div className="text-xs text-slate-600 font-medium">EXPRESS</div>
          </CardContent>
        </Card>

        {/* Total - Destacado */}
        <Card className="bg-emerald-500 shadow-sm hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-white mb-1">{formatCurrency(totalGeneral)}</div>
            <div className="text-xs text-emerald-100 font-medium">P. TOTAL</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}