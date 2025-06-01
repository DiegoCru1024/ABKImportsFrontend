import { FileText, Package } from "lucide-react";

export default function Cotizacion() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50  border-t-2">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="container  flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 ">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500  hover:bg-orange-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Cotización de productos
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="overflow-hidden rounded-xl border bg-gradient-to-r from-gray-900 to-gray-800  shadow-sm">
            <div className="px-4 py-3">
              <h3 className="flex items-center font-semibold text-white">
                <Package className="mr-2 h-4 w-4" />
                Productos
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
