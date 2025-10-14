import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Product } from "../../utils/interface";
import type { ProductVariant } from "../tables/editable-unit-cost-table";



interface ProductManagerProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  serviceType: string;
}

export default function ProductManager({
  products,
  onProductsChange,
  serviceType,
}: ProductManagerProps) {
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [editingVariant, setEditingVariant] = useState<{
    productIndex: number;
    variantIndex: number;
  } | null>(null);

  const addNewProduct = () => {
    const newProduct: Product = {
      originalProductId: null,
      name: "Nuevo Producto",
      adminComment: "",
      seCotizaProducto: true,
      variants: [
        {
          originalVariantId: null,
          size: "N/A",
          presentation: "Unidad",
          model: "N/A",
          color: "N/A",
          quantity: 1,
          price: 0,
          unitCost: 0,
          importCosts: 0,
          seCotizaVariante: true,
        },
      ],
    };

    onProductsChange([...products, newProduct]);
  };

  const addNewVariant = (productIndex: number) => {
    const newVariant: ProductVariant = {
      originalVariantId: null,
      size: "N/A",
      presentation: "Unidad",
      model: "N/A",
      color: "N/A",
      quantity: 1,
      price: 0,
      unitCost: 0,
      importCosts: 0,
      seCotizaVariante: true,
    };

    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      variants: [...updatedProducts[productIndex].variants, newVariant],
    };

    onProductsChange(updatedProducts);
  };

  const removeProduct = (productIndex: number) => {
    const updatedProducts = products.filter((_, index) => index !== productIndex);
    onProductsChange(updatedProducts);
  };

  const removeVariant = (productIndex: number, variantIndex: number) => {
    const updatedProducts = [...products];
    const updatedVariants = updatedProducts[productIndex].variants.filter(
      (_, index) => index !== variantIndex
    );

    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      variants: updatedVariants,
    };

    onProductsChange(updatedProducts);
  };

  const updateProduct = (
    productIndex: number,
    field: keyof Product,
    value: any
  ) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      [field]: value,
    };

    onProductsChange(updatedProducts);
  };

  const updateVariant = (
    productIndex: number,
    variantIndex: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const updatedProducts = [...products];
    const updatedVariants = [...updatedProducts[productIndex].variants];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      [field]: value,
    };

    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      variants: updatedVariants,
    };

    onProductsChange(updatedProducts);
  };

  const calculateVariantTotal = (variant: ProductVariant) => {
    return variant.price * variant.quantity;
  };

  const calculateProductTotal = (product: Product) => {
    return product.variants.reduce((total, variant) => {
      if (variant.seCotizaVariante) {
        return total + calculateVariantTotal(variant);
      }
      return total;
    }, 0);
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Gestor de Productos
              </CardTitle>
              <p className="text-slate-600 text-sm mt-1">
                Administra los productos y sus variantes para la cotización
              </p>
            </div>
          </div>
          <Button
            onClick={addNewProduct}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Producto
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {products.map((product, productIndex) => (
          <Card
            key={productIndex}
            className="border-2 border-gray-200 hover:border-blue-300 transition-colors"
          >
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={product.seCotizaProducto}
                    onCheckedChange={(checked) =>
                      updateProduct(productIndex, "seCotizaProducto", checked)
                    }
                  />
                  <CardTitle className="text-lg">
                    {editingProduct === productIndex ? (
                      <Input
                        value={product.name}
                        onChange={(e) =>
                          updateProduct(productIndex, "name", e.target.value)
                        }
                        className="w-64"
                      />
                    ) : (
                      product.name
                    )}
                  </CardTitle>
                  {product.originalProductId ? (
                    <Badge variant="outline" className="text-xs">
                      Original
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Nuevo
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingProduct === productIndex ? (
                    <Button
                      size="sm"
                      onClick={() => setEditingProduct(null)}
                      className="flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(productIndex)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNewVariant(productIndex)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Variante
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeProduct(productIndex)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {editingProduct === productIndex && (
                <div className="space-y-2">
                  <Label>Comentario del Administrador</Label>
                  <Textarea
                    value={product.adminComment || ""}
                    onChange={(e) =>
                      updateProduct(productIndex, "adminComment", e.target.value)
                    }
                    placeholder="Agregar comentario sobre el producto..."
                    rows={2}
                  />
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Variantes</h4>
                {product.variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
                    className={`p-4 border rounded-lg transition-colors ${
                      editingVariant?.productIndex === productIndex &&
                      editingVariant?.variantIndex === variantIndex
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={variant.seCotizaVariante}
                          onCheckedChange={(checked) =>
                            updateVariant(
                              productIndex,
                              variantIndex,
                              "seCotizaVariante",
                              checked
                            )
                          }
                        />
                        <span className="font-medium">
                          Variante {variantIndex + 1}
                        </span>
                        {variant.originalVariantId ? (
                          <Badge variant="outline" className="text-xs">
                            Original
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Nueva
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingVariant?.productIndex === productIndex &&
                        editingVariant?.variantIndex === variantIndex ? (
                          <Button
                            size="sm"
                            onClick={() => setEditingVariant(null)}
                            className="flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            Guardar
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditingVariant({ productIndex, variantIndex })
                              }
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                removeVariant(productIndex, variantIndex)
                              }
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tamaño</Label>
                        {editingVariant?.productIndex === productIndex &&
                        editingVariant?.variantIndex === variantIndex ? (
                          <Input
                            value={variant.size}
                            onChange={(e) =>
                              updateVariant(
                                productIndex,
                                variantIndex,
                                "size",
                                e.target.value
                              )
                            }
                            placeholder="Tamaño"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
                            {variant.size}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Presentación</Label>
                        {editingVariant?.productIndex === productIndex &&
                        editingVariant?.variantIndex === variantIndex ? (
                          <Input
                            value={variant.presentation}
                            onChange={(e) =>
                              updateVariant(
                                productIndex,
                                variantIndex,
                                "presentation",
                                e.target.value
                              )
                            }
                            placeholder="Presentación"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
                            {variant.presentation}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Modelo</Label>
                        {editingVariant?.productIndex === productIndex &&
                        editingVariant?.variantIndex === variantIndex ? (
                          <Input
                            value={variant.model}
                            onChange={(e) =>
                              updateVariant(
                                productIndex,
                                variantIndex,
                                "model",
                                e.target.value
                              )
                            }
                            placeholder="Modelo"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
                            {variant.model}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Color</Label>
                        {editingVariant?.productIndex === productIndex &&
                        editingVariant?.variantIndex === variantIndex ? (
                          <Input
                            value={variant.color}
                            onChange={(e) =>
                              updateVariant(
                                productIndex,
                                variantIndex,
                                "color",
                                e.target.value
                              )
                            }
                            placeholder="Color"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
                            {variant.color}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Cantidad</Label>
                        <Input
                          type="number"
                          value={variant.quantity}
                          onChange={(e) =>
                            updateVariant(
                              productIndex,
                              variantIndex,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Precio</Label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(
                              productIndex,
                              variantIndex,
                              "price",
                              Number(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Costo Unitario</Label>
                        <Input
                          type="number"
                          value={variant.unitCost}
                          onChange={(e) =>
                            updateVariant(
                              productIndex,
                              variantIndex,
                              "unitCost",
                              Number(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Costos Importación
                        </Label>
                        <Input
                          type="number"
                          value={variant.importCosts}
                          onChange={(e) =>
                            updateVariant(
                              productIndex,
                              variantIndex,
                              "importCosts",
                              Number(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Total Variante:</span>
                        <span className="font-bold text-blue-600">
                          ${calculateVariantTotal(variant).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Producto:</span>
                <span className="font-bold text-lg text-green-600">
                  ${calculateProductTotal(product).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">No hay productos agregados</p>
              <Button
                onClick={addNewProduct}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Agregar Primer Producto
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}