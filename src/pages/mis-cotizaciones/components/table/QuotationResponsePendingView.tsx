import React from "react";
import {
  Package,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ImageCarouselModal from "@/components/ImageCarouselModal";

interface ProductVariant {
  variantId: string;
  quantity: number;
  precioUnitario: string;
  precioExpressUnitario: string;
  seCotizaVariante: boolean;
}

interface Product {
  productId: string;
  name: string;
  url: string;
  comment: string;
  quantityTotal: number;
  weight: string;
  volume: string;
  number_of_boxes: number;
  seCotizaProducto: boolean;
  variants: ProductVariant[];
  attachments: string[];
}

interface QuotationResponsePendingViewProps {
  products: Product[];
}

export default function QuotationResponsePendingView({ 
  products 
}: QuotationResponsePendingViewProps) {
  const [isImageModalOpen, setIsImageModalOpen] = React.useState<boolean>(false);
  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);
  const [selectedProductName, setSelectedProductName] = React.useState<string>("");

  const handleOpenImages = (images: string[], productName: string) => {
    setSelectedImages(images);
    setSelectedProductName(productName);
    setIsImageModalOpen(true);
  };

  const selectedProducts = products.filter(product => product.seCotizaProducto);

  const totals = React.useMemo(() => {
    let totalQuantity = 0;
    let totalPrice = 0;
    let totalExpress = 0;

    selectedProducts.forEach(product => {
      const selectedVariants = product.variants.filter(variant => variant.seCotizaVariante);
      
      selectedVariants.forEach(variant => {
        totalQuantity += variant.quantity;
        totalPrice += parseFloat(variant.precioUnitario) * variant.quantity;
        totalExpress += parseFloat(variant.precioExpressUnitario) * variant.quantity;
      });
    });

    return {
      totalQuantity,
      totalPrice,
      totalExpress,
      grandTotal: totalPrice + totalExpress
    };
  }, [selectedProducts]);

  return (
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Respuesta de Cotización - Vista Administrativa
            </CardTitle>
            <p className="text-slate-600 text-sm mt-1">
              Productos cotizados con precios unitarios y express
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total General</div>
            <div className="text-lg font-bold text-green-600">
              ${totals.grandTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <span className="text-muted-foreground block">Productos</span>
                <span className="font-bold text-blue-600 text-lg">{selectedProducts.length}</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Cantidad Total</span>
                <span className="font-bold text-purple-600 text-lg">{totals.totalQuantity}</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Total Productos</span>
                <span className="font-bold text-orange-600 text-lg">${totals.totalPrice.toFixed(2)}</span>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground block">Total Express</span>
                <span className="font-bold text-red-600 text-lg">${totals.totalExpress.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedProducts.map((product, index) => {
              const selectedVariants = product.variants.filter(variant => variant.seCotizaVariante);
              
              return (
                <Card key={product.productId} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Badge variant="secondary" className="font-body">
                            Producto #{index + 1}
                          </Badge>
                        </div>

                        <div className="flex-shrink-0">
                          {product.attachments && product.attachments.length > 0 ? (
                            <div className="relative">
                              <img
                                src={product.attachments[0]}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg border border-border"
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={() => handleOpenImages(product.attachments, product.name)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-heading text-lg font-bold text-foreground truncate">
                              {product.name}
                            </h3>
                            <Badge variant="secondary" className="font-body">
                              {selectedVariants.length} variante{selectedVariants.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-body">
                            <div>
                              <span className="text-muted-foreground">Peso:</span>
                              <span className="ml-1 font-semibold">{parseFloat(product.weight).toFixed(2)}kg</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Volumen:</span>
                              <span className="ml-1 font-semibold">{parseFloat(product.volume).toFixed(3)} m³</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cajas:</span>
                              <span className="ml-1 font-semibold">{product.number_of_boxes}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">URL:</span>
                              <span className="ml-1 font-semibold text-blue-600 truncate">{product.url}</span>
                            </div>
                          </div>
                          {product.comment && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Comentario:</span>
                              <span className="ml-1 italic text-gray-700">{product.comment}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedVariants.length > 0 && (
                      <div className="bg-muted/30">
                        <div className="p-4">
                          <h4 className="font-heading text-sm font-bold text-foreground mb-3">
                            Variantes Cotizadas
                          </h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted hover:bg-muted">
                                  <TableHead className="font-semibold text-foreground">Variante</TableHead>
                                  <TableHead className="font-semibold text-foreground text-center">Cantidad</TableHead>
                                  <TableHead className="font-semibold text-foreground text-center">Precio Unit.</TableHead>
                                  <TableHead className="font-semibold text-foreground text-center">Precio Express</TableHead>
                                  <TableHead className="font-semibold text-foreground text-center">Total Producto</TableHead>
                                  <TableHead className="font-semibold text-foreground text-center">Total Express</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedVariants.map((variant) => {
                                  const totalProduct = parseFloat(variant.precioUnitario) * variant.quantity;
                                  const totalExpress = parseFloat(variant.precioExpressUnitario) * variant.quantity;
                                  
                                  return (
                                    <TableRow key={variant.variantId}>
                                      <TableCell>
                                        <div className="font-medium text-sm">
                                          Variante #{variant.variantId.slice(-4)}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="font-semibold">{variant.quantity}</span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="font-semibold text-blue-600">
                                          ${parseFloat(variant.precioUnitario).toFixed(2)}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="font-semibold text-purple-600">
                                          ${parseFloat(variant.precioExpressUnitario).toFixed(2)}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="font-semibold text-orange-600">
                                          ${totalProduct.toFixed(2)}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="font-semibold text-red-600">
                                          ${totalExpress.toFixed(2)}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </CardContent>

      <ImageCarouselModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        files={[]}
        attachments={selectedImages}
        productName={selectedProductName}
      />
    </Card>
  );
}