import React, { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Utils and Interfaces
import type { ProductFormData, VariantFormData } from "../utils/interfaces";

// UI Components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle, 
  CheckCircle,
  Package,
  DollarSign
} from "lucide-react";

// Validation Schema
const variantFormSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  precio_unitario: z.number().min(0, "Unit price must be non-negative"),
  precio_express_unitario: z.number().min(0, "Express price must be non-negative"),
  seCotizaVariante: z.boolean(),
});

const productFormSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  adminComment: z.string().max(500, "Comment must be less than 500 characters"),
  seCotizaProducto: z.boolean(),
  variants: z.array(variantFormSchema).min(1, "At least one variant is required"),
});

const responseFormSchema = z.object({
  products: z.array(productFormSchema).min(1, "At least one product is required"),
});

type ResponseFormData = z.infer<typeof responseFormSchema>;

interface ResponseFormProps {
  initialData?: ResponseFormData;
  onSubmit: (data: ResponseFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  readonly?: boolean;
}

/**
 * Enhanced form component for quotation responses with improved validation
 * Features admin comment integration and variant management
 */
const ResponseForm: React.FC<ResponseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  readonly = false,
}) => {
  // Local state
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Form setup
  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: initialData || {
      products: [],
    },
  });

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control: form.control,
    name: "products",
  });

  // Form submission
  const handleSubmit = useCallback(async (data: ResponseFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      
      await onSubmit(data);
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  }, [onSubmit]);

  // Product management
  const addProduct = useCallback(() => {
    const newProduct: ProductFormData = {
      productId: crypto.randomUUID(),
      adminComment: "",
      seCotizaProducto: false,
      variants: [{
        variantId: crypto.randomUUID(),
        quantity: 0,
        precio_unitario: 0,
        precio_express_unitario: 0,
        seCotizaVariante: false,
      }],
    };
    
    appendProduct(newProduct);
    setExpandedProducts(prev => ({
      ...prev,
      [newProduct.productId]: true,
    }));
  }, [appendProduct]);

  const toggleProductExpansion = useCallback((productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  }, []);

  // Calculate form statistics
  const formStats = React.useMemo(() => {
    const products = form.watch("products") || [];
    const totalProducts = products.length;
    const totalVariants = products.reduce((sum, product) => sum + (product.variants?.length || 0), 0);
    const quotedProducts = products.filter(product => product.seCotizaProducto).length;
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.variants?.reduce((vSum, variant) => 
        vSum + (variant.precio_unitario * variant.quantity), 0
      ) || 0);
    }, 0);
    
    return {
      totalProducts,
      totalVariants,
      quotedProducts,
      totalValue,
    };
  }, [form.watch("products")]);

  if (readonly) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This form is in read-only mode. Changes cannot be saved.
          </AlertDescription>
        </Alert>
        {/* Render read-only content here */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formStats.totalProducts}</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formStats.totalVariants}</div>
              <div className="text-sm text-muted-foreground">Variants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formStats.quotedProducts}</div>
              <div className="text-sm text-muted-foreground">Quoted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${formStats.totalValue.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Response saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error saving response: {submitError}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Products Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products ({productFields.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProduct}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {productFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products added yet. Click "Add Product" to get started.</p>
                </div>
              ) : (
                productFields.map((productField, productIndex) => (
                  <ProductFormCard
                    key={productField.id}
                    productIndex={productIndex}
                    form={form}
                    onRemove={() => removeProduct(productIndex)}
                    isExpanded={expandedProducts[productField.productId] || false}
                    onToggleExpansion={() => toggleProductExpansion(productField.productId)}
                    isLoading={isLoading}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {form.formState.isDirty && (
                    <span className="text-orange-600">You have unsaved changes</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={isLoading || !form.formState.isValid}
                    className="min-w-32"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Response
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

// Product Form Card Component
interface ProductFormCardProps {
  productIndex: number;
  form: any;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  isLoading: boolean;
}

const ProductFormCard: React.FC<ProductFormCardProps> = ({
  productIndex,
  form,
  onRemove,
  isExpanded,
  onToggleExpansion,
  isLoading,
}) => {
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: `products.${productIndex}.variants`,
  });

  const addVariant = useCallback(() => {
    appendVariant({
      variantId: crypto.randomUUID(),
      quantity: 0,
      precio_unitario: 0,
      precio_express_unitario: 0,
      seCotizaVariante: false,
    });
  }, [appendVariant]);

  const product = form.watch(`products.${productIndex}`);
  const totalValue = product?.variants?.reduce((sum: number, variant: any) => 
    sum + (variant.precio_unitario * variant.quantity), 0
  ) || 0;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
            >
              {isExpanded ? (
                <Package className="h-4 w-4" />
              ) : (
                <Package className="h-4 w-4" />
              )}
            </Button>
            
            <div>
              <div className="font-medium">Product {productIndex + 1}</div>
              <div className="text-sm text-muted-foreground">
                {variantFields.length} variant{variantFields.length !== 1 ? 's' : ''} • 
                ${totalValue.toFixed(2)} total value
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FormField
              control={form.control}
              name={`products.${productIndex}.seCotizaProducto`}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Quoted</FormLabel>
                </FormItem>
              )}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Admin Comment */}
          <FormField
            control={form.control}
            name={`products.${productIndex}.adminComment`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin Comment</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add admin comment for this product..."
                    rows={2}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Optional comment visible to the user about this product.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Variants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Variants ({variantFields.length})</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>

            {variantFields.map((variantField, variantIndex) => (
              <div key={variantField.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Variant {variantIndex + 1}</span>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`products.${productIndex}.variants.${variantIndex}.seCotizaVariante`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Quote this variant</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    {variantFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(variantIndex)}
                        disabled={isLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name={`products.${productIndex}.variants.${variantIndex}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isLoading}
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`products.${productIndex}.variants.${variantIndex}.precio_unitario`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isLoading}
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`products.${productIndex}.variants.${variantIndex}.precio_express_unitario`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Express Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isLoading}
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ResponseForm;