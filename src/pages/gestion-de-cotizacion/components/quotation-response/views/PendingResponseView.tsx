import React, { useState, useMemo } from "react";

// Utils and Interfaces
import type { PendingResponseViewProps, ProductData } from "../utils/interfaces";
import { calculatePendingTotals} from "../utils/calculations";
import { formatWeight, formatVolume, formatProductName, formatQuantity, formatCurrency } from "../utils/formatters";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Weight, 
  Ruler, 
  DollarSign, 
  Hash,
  ChevronDown,
  ChevronRight,
  Eye,
  ExternalLink,
  FileText
} from "lucide-react";

// Import responsive table component (will be created)
import ResponsiveProductTable from "../tables/ResponsiveProductTable";

interface ExtendedPendingResponseViewProps extends PendingResponseViewProps {
  isCompactMode?: boolean;
}

/**
 * Specialized view for "Pendiente" responses with mobile-first responsive design
 * Features horizontal scroll handling and collapsible sections
 */
const PendingResponseView: React.FC<ExtendedPendingResponseViewProps> = ({
  response,
  onProductUpdate,
  readonly = false,
  mode = 'user',
  isCompactMode = false,
}) => {
  // Local state
  const [selectedView, setSelectedView] = useState<'grid' | 'table' | 'summary'>('grid');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    products: true,
    summary: true,
    details: false,
  });

  // Process response data
  const products = useMemo(() => {
    return response.products || [];
  }, [response.products]);

  // Calculate totals
  const totals = useMemo(() => {
    return calculatePendingTotals(products);
  }, [products]);

  // Summary cards data
  const summaryCards = useMemo(() => [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Quantity",
      value: totals.totalQuantity,
      icon: Hash,
      color: "text-green-600",
    },
    {
      title: "Total Weight",
      value: formatWeight(totals.totalWeight),
      icon: Weight,
      color: "text-orange-600",
    },
    {
      title: "Total Volume",
      value: formatVolume(totals.totalCBM),
      icon: Ruler,
      color: "text-purple-600",
    },
    {
      title: "Total Value",
      value: formatCurrency(totals.totalPrice),
      icon: DollarSign,
      color: "text-red-600",
    },
  ], [products.length, totals]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle product update
  const handleProductUpdate = (productId: string, data: any) => {
    if (onProductUpdate && !readonly) {
      onProductUpdate(productId, data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <card.icon className={`h-5 w-5 ${card.color}`} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    {card.title}
                  </p>
                  <p className="text-lg font-bold">
                    {typeof card.value === 'number' && card.title !== 'Total Value' 
                      ? formatQuantity(card.value)
                      : card.value
                    }
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
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('details')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Response Details</CardTitle>
              {expandedSections.details ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          
          {expandedSections.details && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Correlative:</span>
                    <span className="text-sm font-medium">
                      {response.quotationInfo?.correlative || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm font-medium">
                      {response.quotationInfo?.date || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service Type:</span>
                    <Badge variant="outline">{response.serviceType}</Badge>
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
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Products ({products.length})
            </CardTitle>
            
            {/* View Toggle */}
            <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={selectedView} className="w-full">
            {/* Grid View - Mobile Optimized Cards */}
            <TabsContent value="grid" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.productId || index}
                    product={product}
                    onUpdate={handleProductUpdate}
                    readonly={readonly}
                    mode={mode}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Table View - Responsive Table */}
            <TabsContent value="table">
              <div className="overflow-hidden">
                <ResponsiveProductTable
                  products={products}
                  onProductUpdate={handleProductUpdate}
                  readonly={readonly}
                  mode={mode}
                  showAdminColumns={mode === 'admin'}
                />
              </div>
            </TabsContent>

            {/* Summary View - Aggregated Data */}
            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Product Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {products.slice(0, 5).map((product, index) => {
                        const percentage = (Number(product.quantityTotal) / totals.totalQuantity) * 100;
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="truncate">{formatProductName(product.name, 20)}</span>
                              <span>{percentage.toFixed(1)}%</span>
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

                {/* Value Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Value Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average per Product:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(totals.totalPrice / products.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average per Unit:</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(totals.totalPrice / totals.totalQuantity)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Weight/Value:</span>
                        <span className="text-sm font-medium">
                          {(totals.totalWeight / totals.totalPrice).toFixed(2)} kg/$
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Volume/Value:</span>
                        <span className="text-sm font-medium">
                          {(totals.totalCBM / totals.totalPrice).toFixed(4)} m³/$
                        </span>
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

// Product Card Component for Grid View
const ProductCard: React.FC<{
  product: ProductData;
  onUpdate: (productId: string, data: any) => void;
  readonly: boolean;
  mode: 'admin' | 'user';
}> = ({ product, onUpdate, readonly, mode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalPrice = product.variants?.reduce(
    (sum, variant) => sum + (Number(variant.price) || 0),
    0
  ) || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm leading-tight">
              {formatProductName(product.name, 40)}
            </h4>
            {product.url && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                onClick={() => window.open(product.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Product
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Quantity:</span>
            <span className="ml-1 font-medium">{formatQuantity(product.quantityTotal)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Value:</span>
            <span className="ml-1 font-medium">{formatCurrency(totalPrice)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Weight:</span>
            <span className="ml-1 font-medium">{formatWeight(product.weight)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Volume:</span>
            <span className="ml-1 font-medium">{formatVolume(product.volume)}</span>
          </div>
        </div>

        {/* Variants Count */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
            </Badge>
            {product.seCotizaProducto && (
              <Badge variant="default" className="text-xs">
                Quoted
              </Badge>
            )}
          </div>
        )}

        {/* Admin Comment */}
        {mode === 'admin' && product.adminComment && (
          <div className="p-2 bg-muted rounded text-xs">
            <FileText className="h-3 w-3 inline mr-1" />
            {product.adminComment}
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-2 border-t pt-3">
            {product.variants?.map((variant, index) => (
              <div key={variant.variantId || index} className="text-xs space-y-1">
                <div className="font-medium">Variant {index + 1}</div>
                <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                  {variant.size && <div>Size: {variant.size}</div>}
                  {variant.color && <div>Color: {variant.color}</div>}
                  {variant.model && <div>Model: {variant.model}</div>}
                  <div>Qty: {formatQuantity(variant.quantity)}</div>
                  <div>Price: {formatCurrency(Number(variant.price) || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingResponseView;