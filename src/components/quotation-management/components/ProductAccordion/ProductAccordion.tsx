/**
 * Reusable product accordion component
 * Displays products with expandable details and variants
 */

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Ruler, 
  Palette, 
  Link as LinkIcon, 
  ExternalLink,
  MessageSquare,
  Weight,
  Box,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageGallery } from '../../../shared/data-display/ImageGallery';
import type { ProductAccordionProps, ProductData, VariantData } from '../../types';

export const ProductAccordion: React.FC<ProductAccordionProps> = ({
  products,
  expandedProducts,
  onToggleProduct,
  onImageClick,
  showAdminFeatures = false,
}) => {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Products
          </h3>
          <p className="text-gray-600">
            No products have been added to this quotation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductItem
          key={product.productId}
          product={product}
          isExpanded={expandedProducts[product.productId] || false}
          onToggle={() => onToggleProduct(product.productId)}
          onImageClick={onImageClick}
          showAdminFeatures={showAdminFeatures}
        />
      ))}
    </div>
  );
};

interface ProductItemProps {
  product: ProductData;
  isExpanded: boolean;
  onToggle: () => void;
  onImageClick?: (images: string[], productName: string, index: number) => void;
  showAdminFeatures: boolean;
}

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  isExpanded,
  onToggle,
  onImageClick,
  showAdminFeatures,
}) => {
  const handleImageClick = (index: number) => {
    if (onImageClick && product.attachments) {
      onImageClick(product.attachments, product.name, index);
    }
  };

  return (
    <Card className="overflow-hidden">
      <Accordion type="single" value={isExpanded ? product.productId : undefined}>
        <AccordionItem value={product.productId} className="border-none">
          <AccordionTrigger 
            onClick={onToggle}
            className="px-6 py-4 hover:no-underline hover:bg-gray-50"
          >
            <div className="flex items-center justify-between w-full mr-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>Qty: {product.quantity}</span>
                    <span>Size: {product.size}</span>
                    <span>Color: {product.color}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {product.variants && (
                  <Badge variant="secondary" className="text-xs">
                    {product.variants.length} variants
                  </Badge>
                )}
                {product.attachments && product.attachments.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {product.attachments.length}
                  </Badge>
                )}
                {showAdminFeatures && product.isQuoted && (
                  <Badge variant="default" className="text-xs">
                    Quoted
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProductDetailCard
                  icon={<Weight className="h-4 w-4" />}
                  label="Weight"
                  value={`${product.weight} kg`}
                />
                <ProductDetailCard
                  icon={<Box className="h-4 w-4" />}
                  label="Volume"
                  value={`${product.volume} m³`}
                />
                <ProductDetailCard
                  icon={<Package className="h-4 w-4" />}
                  label="Boxes"
                  value={product.numberOfBoxes.toString()}
                />
              </div>

              {/* Product URL */}
              {product.url && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <Button
                    variant="link"
                    onClick={() => window.open(product.url, '_blank')}
                    className="p-0 h-auto text-blue-600 hover:text-blue-800"
                  >
                    View Product Link
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}

              {/* Comments */}
              {product.comment && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Client Comment</span>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {product.comment}
                  </p>
                </div>
              )}

              {/* Admin Comment */}
              {showAdminFeatures && product.adminComment && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Admin Comment</span>
                  </div>
                  <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    {product.adminComment}
                  </p>
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Product Variants</h4>
                  <div className="grid gap-3">
                    {product.variants.map((variant, index) => (
                      <VariantCard
                        key={variant.variantId}
                        variant={variant}
                        showPricing={showAdminFeatures}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {product.attachments && product.attachments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Product Images</h4>
                  <ImageGallery
                    images={product.attachments.map((url, index) => ({
                      id: `${product.productId}-${index}`,
                      url,
                      alt: `${product.name} - Image ${index + 1}`,
                      title: `${product.name} - Image ${index + 1}`,
                    }))}
                    showThumbnails={true}
                    allowDownload={true}
                    maxThumbnails={6}
                    onImageClick={handleImageClick}
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

interface ProductDetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ProductDetailCard: React.FC<ProductDetailCardProps> = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-500">{icon}</div>
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
};

interface VariantCardProps {
  variant: VariantData;
  showPricing: boolean;
}

const VariantCard: React.FC<VariantCardProps> = ({
  variant,
  showPricing,
}) => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-medium text-gray-900">
              {variant.presentation || 'Variant'}
            </h5>
            {variant.isQuoted && showPricing && (
              <Badge variant="default" className="text-xs">
                Quoted
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            Qty: {variant.quantity}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Ruler className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">{variant.size}</span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">Color:</span>
            <span className="font-medium">{variant.color}</span>
          </div>
          {variant.model && (
            <div className="flex items-center gap-2">
              <Package className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{variant.model}</span>
            </div>
          )}
        </div>

        {showPricing && (variant.price || variant.unitCost) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {variant.price && (
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium ml-1">${variant.price}</span>
                </div>
              )}
              {variant.unitCost && (
                <div>
                  <span className="text-gray-600">Unit Cost:</span>
                  <span className="font-medium ml-1">${variant.unitCost}</span>
                </div>
              )}
              {variant.importCosts && (
                <div>
                  <span className="text-gray-600">Import Costs:</span>
                  <span className="font-medium ml-1">${variant.importCosts}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};