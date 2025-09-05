import React, { useState, useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";

// Utils and Interfaces
import type { ResponsiveProductTableProps, ProductData, ResponsiveTableColumn } from "../utils/interfaces";

import { formatWeight, formatVolume, formatProductName, formatQuantity, formatCurrency } from "../utils/formatters";

// UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Eye, 
  ExternalLink, 
  MessageSquare,
  Package,
  Smartphone,
  Monitor
} from "lucide-react";
import useIsMobile from "@/hooks/use-mobile";

// Hooks


/**
 * Responsive product table with mobile-optimized design
 * Features automatic column collapsing and progressive disclosure
 */
const ResponsiveProductTable: React.FC<ResponsiveProductTableProps> = ({
  products,
  onProductUpdate,
  readonly = false,
  mode = 'user',
  showAdminColumns = false,
}) => {
  const isMobile = useIsMobile();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editComment, setEditComment] = useState<string>("");
  const [editQuoted, setEditQuoted] = useState<boolean>(false);

  // Define responsive columns
  const columns = useMemo<ColumnDef<ProductData>[]>(() => {
    const baseColumns: ColumnDef<ProductData>[] = [
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {formatProductName(product.name, isMobile ? 30 : 50)}
              </div>
              {product.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                  onClick={() => window.open(product.url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
            </div>
          );
        },
        minSize: 200,
      },
      {
        accessorKey: "quantityTotal",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="text-center font-medium">
            {formatQuantity(row.original.quantityTotal)}
          </div>
        ),
        minSize: 80,
      },
      {
        accessorKey: "variants",
        header: "Variants",
        cell: ({ row }) => {
          const variants = row.original.variants || [];
          const totalPrice = variants.reduce((sum, variant) => 
            sum + (Number(variant.price) || 0), 0
          );
          
          return (
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">
                {variants.length} variant{variants.length !== 1 ? 's' : ''}
              </Badge>
              <div className="text-sm font-medium">
                {formatCurrency(totalPrice)}
              </div>
            </div>
          );
        },
        minSize: 100,
      },
    ];

    // Add desktop-only columns
    if (!isMobile) {
      baseColumns.push(
        {
          accessorKey: "weight",
          header: "Weight",
          cell: ({ row }) => (
            <div className="text-center text-sm">
              {formatWeight(row.original.weight)}
            </div>
          ),
          minSize: 80,
        },
        {
          accessorKey: "volume",
          header: "Volume",
          cell: ({ row }) => (
            <div className="text-center text-sm">
              {formatVolume(row.original.volume)}
            </div>
          ),
          minSize: 80,
        }
      );
    }

    // Add admin columns if in admin mode
    if (showAdminColumns && mode === 'admin') {
      baseColumns.push(
        {
          accessorKey: "seCotizaProducto",
          header: "Quoted",
          cell: ({ row }) => (
            <div className="text-center">
              <Badge variant={row.original.seCotizaProducto ? "default" : "outline"}>
                {row.original.seCotizaProducto ? "Yes" : "No"}
              </Badge>
            </div>
          ),
          minSize: 80,
        },
        {
          accessorKey: "adminComment",
          header: "Admin Comment",
          cell: ({ row }) => {
            const comment = row.original.adminComment;
            return (
              <div className="max-w-32">
                {comment ? (
                  <div className="text-xs text-muted-foreground truncate" title={comment}>
                    {comment}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No comment</span>
                )}
              </div>
            );
          },
          minSize: 120,
        }
      );
    }

    // Actions column
    baseColumns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{row.original.name}</DialogTitle>
              </DialogHeader>
              <ProductDetailView product={row.original} />
            </DialogContent>
          </Dialog>
          
          {!readonly && mode === 'admin' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditProduct(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      minSize: 100,
    });

    return baseColumns;
  }, [isMobile, showAdminColumns, mode, readonly]);

  // Table configuration
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle product editing
  const handleEditProduct = (product: ProductData) => {
    setEditingProduct(product.productId);
    setEditComment(product.adminComment || "");
    setEditQuoted(product.seCotizaProducto);
  };

  const handleSaveEdit = () => {
    if (editingProduct && onProductUpdate) {
      onProductUpdate(editingProduct, {
        adminComment: editComment,
        seCotizaProducto: editQuoted,
      });
      setEditingProduct(null);
      setEditComment("");
      setEditQuoted(false);
    }
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">Mobile View</span>
          </div>
          <Badge variant="outline">{products.length} products</Badge>
        </div>
        
        <div className="space-y-3">
          {products.map((product, index) => (
            <MobileProductCard
              key={product.productId || index}
              product={product}
              onEdit={!readonly && mode === 'admin' ? () => handleEditProduct(product) : undefined}
              readonly={readonly}
              showActions={mode === 'admin'}
            />
          ))}
        </div>

        {/* Edit Dialog for Mobile */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Admin Comment</label>
                <Textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Add admin comment..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quoted"
                  checked={editQuoted}
                  onCheckedChange={(checked) => setEditQuoted(checked as boolean)}
                />
                <label htmlFor="quoted" className="text-sm font-medium">
                  Mark as quoted
                </label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingProduct(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">Table View</span>
        </div>
        <Badge variant="outline">{products.length} products</Badge>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ minWidth: header.column.columnDef.minSize }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog for Desktop */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Comment</label>
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Add admin comment..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="quoted"
                checked={editQuoted}
                onCheckedChange={(checked) => setEditQuoted(checked as boolean)}
              />
              <label htmlFor="quoted" className="text-sm font-medium">
                Mark as quoted
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingProduct(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mobile Product Card Component
const MobileProductCard: React.FC<{
  product: ProductData;
  onEdit?: () => void;
  readonly: boolean;
  showActions: boolean;
}> = ({ product, onEdit, readonly, showActions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalPrice = product.variants?.reduce(
    (sum, variant) => sum + (Number(variant.price) || 0),
    0
  ) || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-sm font-medium leading-tight">
                  {formatProductName(product.name, 40)}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Qty: {formatQuantity(product.quantityTotal)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(totalPrice)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showActions && onEdit && (
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <ProductDetailView product={product} compact />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Product Detail View Component
const ProductDetailView: React.FC<{ product: ProductData; compact?: boolean }> = ({ 
  product, 
  compact = false 
}) => {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Weight:</span>
          <span className="ml-2 font-medium">{formatWeight(product.weight)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Volume:</span>
          <span className="ml-2 font-medium">{formatVolume(product.volume)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Boxes:</span>
          <span className="ml-2 font-medium">{product.number_of_boxes}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Quoted:</span>
          <Badge variant={product.seCotizaProducto ? "default" : "outline"} className="ml-2">
            {product.seCotizaProducto ? "Yes" : "No"}
          </Badge>
        </div>
      </div>

      {/* Admin Comment */}
      {product.adminComment && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground font-medium">Admin Comment</div>
              <div className="text-sm mt-1">{product.adminComment}</div>
            </div>
          </div>
        </div>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && !compact && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Variants ({product.variants.length})</div>
          <div className="space-y-2">
            {product.variants.map((variant, index) => (
              <div key={variant.variantId || index} className="p-2 border rounded text-xs">
                <div className="grid grid-cols-2 gap-2">
                  {variant.size && <div>Size: {variant.size}</div>}
                  {variant.color && <div>Color: {variant.color}</div>}
                  {variant.model && <div>Model: {variant.model}</div>}
                  {variant.presentation && <div>Presentation: {variant.presentation}</div>}
                  <div>Quantity: {formatQuantity(variant.quantity)}</div>
                  <div>Price: {formatCurrency(Number(variant.price) || 0)}</div>
                </div>
                {variant.seCotizaVariante && (
                  <Badge variant="default" className="mt-1 text-xs">
                    Quoted Variant
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {product.attachments && product.attachments.length > 0 && !compact && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Attachments ({product.attachments.length})</div>
          <div className="flex flex-wrap gap-2">
            {product.attachments.map((attachment, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => window.open(attachment, '_blank')}
              >
                <Package className="h-3 w-3 mr-1" />
                File {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveProductTable;