import React, { useState, useMemo } from "react";

// Utils and Interfaces
import type { CompletedResponseViewProps, ProductData } from "../utils/interfaces";
import { calculateUnitCostsForTable, calculateFactorM

} from "../utils/calculations";
import { formatWeight, formatVolume, formatResponseDate, formatCurrency, formatQuantity } from "../utils/formatters";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/table/data-table";
import { 
  Calculator, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Weight, 
  Ruler,
  FileText,
  BarChart3,
  PieChart,
  Download
} from "lucide-react";

// Import existing unit cost table types (we'll use the existing interface)
import type { ProductRow } from "@/pages/gestion-de-cotizacion/components/views/editableunitcosttable";

interface ExtendedCompletedResponseViewProps extends CompletedResponseViewProps {
  isCompactMode?: boolean;
}

/**
 * Display component for completed quotation responses
 * Features advanced calculations, cost breakdown tables, and summary visualizations
 */
const CompletedResponseView: React.FC<ExtendedCompletedResponseViewProps> = ({
  response,
  readonly = false,
  mode = 'user',
  showCalculations = false,
  isCompactMode = false,
}) => {
  // Local state
  const [selectedTab, setSelectedTab] = useState<'overview' | 'calculations' | 'breakdown'>('overview');

  // Process response data
  const products = useMemo(() => {
    return response.products || [];
  }, [response.products]);

  // Calculate totals and metrics
  const totals = useMemo(() => {
    const totalQuantity = products.reduce((sum, product) => {
      if (product.quantityTotal !== undefined) {
        return sum + (Number(product.quantityTotal) || 0);
      }
      const productTotal = product.variants?.reduce(
        (vSum, variant) => vSum + (Number(variant.quantity) || 0),
        0
      ) || 0;
      return sum + productTotal;
    }, 0);

    const totalCBM = products.reduce(
      (sum, product) => sum + (Number(product.volume) || 0),
      0
    );

    const totalWeight = products.reduce(
      (sum, product) => sum + (Number(product.weight) || 0),
      0
    );

    const totalPrice = products.reduce((sum, product) => {
      const productTotal = product.variants?.reduce(
        (vSum, variant) => vSum + (Number(variant.price) || 0),
        0
      ) || 0;
      return sum + productTotal;
    }, 0);

    return {
      totalQuantity,
      totalCBM,
      totalWeight,
      totalPrice,
    };
  }, [products]);

  // Calculate unit costs for table display
  const productsList = useMemo(() => {
    return calculateUnitCostsForTable(products, totals.totalPrice);
  }, [products, totals.totalPrice]);

  // Calculate Factor M
  const factorM = useMemo(() => {
    return calculateFactorM(productsList);
  }, [productsList]);

  // Summary metrics for cards
  const summaryMetrics = useMemo(() => [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-blue-600",
      change: null,
    },
    {
      title: "Total Quantity",
      value: formatQuantity(totals.totalQuantity),
      icon: Package,
      color: "text-green-600",
      change: null,
    },
    {
      title: "Total Weight",
      value: formatWeight(totals.totalWeight),
      icon: Weight,
      color: "text-orange-600",
      change: null,
    },
    {
      title: "Total Volume",
      value: formatVolume(totals.totalCBM),
      icon: Ruler,
      color: "text-purple-600",
      change: null,
    },
    {
      title: "Total Value",
      value: formatCurrency(totals.totalPrice),
      icon: DollarSign,
      color: "text-red-600",
      change: null,
    },
    {
      title: "Factor M",
      value: formatCurrency(factorM),
      icon: Calculator,
      color: "text-indigo-600",
      change: null,
    },
  ], [products.length, totals, factorM]);

  // Define columns for the unit cost table
  const unitCostColumns = useMemo(() => {
    return [
      {
        id: "name",
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => (
          <div className="font-medium text-sm">
            {row.original.name}
          </div>
        ),
      },
      {
        id: "price",
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => (
          <div className="text-center font-semibold">
            {formatCurrency(Number(row.original.price) || 0)}
          </div>
        ),
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }: any) => (
          <div className="text-center font-semibold">
            {formatQuantity(row.original.quantity)}
          </div>
        ),
      },
      {
        id: "equivalence",
        accessorKey: "equivalence",
        header: "Equivalence %",
        cell: ({ row }: any) => (
          <div className="text-center">
            {(row.original.equivalence || 0).toFixed(2)}%
          </div>
        ),
      },
      {
        id: "importCosts",
        accessorKey: "importCosts",
        header: "Import Costs",
        cell: ({ row }: any) => (
          <div className="text-center">
            {formatCurrency(row.original.importCosts || 0)}
          </div>
        ),
      },
      {
        id: "totalCost",
        accessorKey: "totalCost",
        header: "Total Cost",
        cell: ({ row }: any) => (
          <div className="text-center font-semibold">
            {formatCurrency(row.original.totalCost || 0)}
          </div>
        ),
      },
      {
        id: "unitCost",
        accessorKey: "unitCost",
        header: "Unit Cost",
        cell: ({ row }: any) => (
          <div className="text-center font-semibold text-primary">
            {formatCurrency(row.original.unitCost || 0)}
          </div>
        ),
      },
    ];
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    {metric.title}
                  </p>
                  <p className="text-sm font-bold">
                    {metric.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response Information */}
      {!isCompactMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Response Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Service Type:</span>
                  <Badge variant="default">{response.serviceType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Correlative:</span>
                  <span className="text-sm font-medium">
                    {response.quotationInfo?.correlative || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">
                    {formatResponseDate(response.quotationInfo?.date || '')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cargo Type:</span>
                  <span className="text-sm font-medium">
                    {response.quotationInfo?.cargoType || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Courier:</span>
                  <span className="text-sm font-medium">
                    {response.quotationInfo?.courier || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Incoterm:</span>
                  <span className="text-sm font-medium">
                    {response.quotationInfo?.incoterm || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="text-sm font-medium">
                    {response.user?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">
                    {response.user?.email || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Detailed Analysis</CardTitle>
            
            {/* Export Button */}
            {mode === 'admin' && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="calculations" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculations
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Breakdown
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Product Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {products.slice(0, 5).map((product, index) => {
                        const productTotal = product.variants?.reduce(
                          (sum, variant) => sum + (Number(variant.price) || 0),
                          0
                        ) || 0;
                        const percentage = (productTotal / totals.totalPrice) * 100;
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="truncate">{product.name}</span>
                              <span className="font-medium">{formatCurrency(productTotal)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {products.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{products.length - 5} more products
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average Product Value:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(totals.totalPrice / products.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average Unit Price:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(totals.totalPrice / totals.totalQuantity)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Weight/Value Ratio:</span>
                        <span className="text-sm font-medium">
                          {(totals.totalWeight / totals.totalPrice).toFixed(2)} kg/$
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Volume/Value Ratio:</span>
                        <span className="text-sm font-medium">
                          {(totals.totalCBM / totals.totalPrice).toFixed(4)} m³/$
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Density:</span>
                        <span className="text-sm font-medium">
                          {(totals.totalWeight / totals.totalCBM).toFixed(2)} kg/m³
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Calculations Tab */}
            <TabsContent value="calculations" className="space-y-4">
              {showCalculations && (
                <div className="overflow-x-auto">
                  <DataTable
                    columns={unitCostColumns}
                    data={productsList}
                    pageInfo={{
                      pageNumber: 1,
                      pageSize: productsList.length,
                      totalElements: productsList.length,
                      totalPages: 1,
                    }}
                    onPageChange={() => {}}
                    onSearch={() => {}}
                    searchTerm=""
                    isLoading={false}
                    paginationOptions={{
                      showPagination: false,
                      showSelectedCount: false,
                      showNavigation: false,
                    }}
                    toolbarOptions={{
                      showSearch: false,
                      showViewOptions: true,
                    }}
                  />
                </div>
              )}
              
              {!showCalculations && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    Detailed calculations are only available in admin mode.
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Breakdown Tab */}
            <TabsContent value="breakdown" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Commercial Value:</span>
                        <span className="font-medium">{formatCurrency(totals.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Import Costs:</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Cost:</span>
                        <span>{formatCurrency(totals.totalPrice)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Service Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service Type:</span>
                        <Badge variant="outline">{response.serviceType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processing Status:</span>
                        <Badge variant="default">Completed</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Date:</span>
                        <span>{formatResponseDate(response.quotationInfo?.date || '')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompletedResponseView;