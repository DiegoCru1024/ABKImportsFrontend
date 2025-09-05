/**
 * Refactored Gestión de Cotización main page component
 * Uses new modular architecture with containers and presentation components
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  RefreshCw, 
  Plus,
  LayoutGrid,
  List
} from 'lucide-react';

// Import new modular components
import { QuotationCard } from '@/components/quotation-management/components/QuotationCard';
import { ImageGallery } from '@/components/shared/data-display/ImageGallery';

// Import existing components for specific views
import DetailsResponse from './components/views/detailsreponse';
import ListResponses from './components/views/listreponses';
import { QuotationFilters, useQuotationListContainer, useQuotationNavigation } from '@/components/quotation-management';

export default function GestionDeCotizacionesView() {
  const navigate = useNavigate();
  
  // Navigation state management with stable callbacks
  const handleViewChange = useCallback((view: string, quotationId?: string) => {
    console.log('View changed:', view, quotationId);
  }, []);

  const {
    state: navState,
    actions: navActions,
  } = useQuotationNavigation({
    initialView: 'list',
    onViewChange: handleViewChange,
  });

  // View configuration
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Image modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalProductName, setModalProductName] = useState('');

  // Quotation list container logic with stable callbacks
  const handleQuotationSelect = useCallback((quotationId: string) => {
    navActions.selectQuotation(quotationId);
  }, [navActions]);

  const handleViewMode = useCallback((mode: string) => {
    navActions.setView(mode);
  }, [navActions]);

  const quotationContainer = useQuotationListContainer({
    onQuotationSelect: handleQuotationSelect,
    onViewMode: handleViewMode,
    enableFiltering: true,
    enableSorting: true,
    autoRefresh: false,
  });

  // Event handlers - memoized for stability
  const handleViewDetails = useCallback((quotationId: string) => {
    navActions.selectQuotation(quotationId);
    navActions.setView('details');
    navigate(`/dashboard/gestion-de-cotizacion/respuesta/${quotationId}`);
  }, [navActions, navigate]);

  const handleViewResponses = useCallback((quotationId: string) => {
    navActions.selectQuotation(quotationId);
    navActions.setView('responses');
    navigate(`/dashboard/gestion-de-cotizacion/respuestas/${quotationId}`);
  }, [navActions, navigate]);

  const handleProductToggle = useCallback((quotationId: string, productId: string) => {
    const key = `${quotationId}-${productId}`;
    setExpandedProducts(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleImageClick = useCallback((images: string[], productName: string, index: number = 0) => {
    setSelectedImages(images);
    setModalProductName(productName);
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setImageModalOpen(false);
    setSelectedImages([]);
    setModalProductName('');
    setCurrentImageIndex(0);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // Render different views based on navigation state
  const renderCurrentView = () => {
    switch (navState.currentView) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navActions.setView('list')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
              <h1 className="text-2xl font-bold">Quotation Details</h1>
            </div>
            <DetailsResponse  selectedQuotationId={navState.selectedQuotationId || ''} />
          </div>
        );

      case 'responses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navActions.setView('list')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
              <h1 className="text-2xl font-bold">Quotation Responses</h1>
            </div>
            <ListResponses selectedQuotationId={navState.selectedQuotationId || ''} />
          </div>
        );

      case 'list':
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quotation Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and respond to quotation requests
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={quotationContainer.handleRefresh}
                  disabled={quotationContainer.isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${quotationContainer.isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  onClick={toggleViewMode}
                  className="flex items-center gap-2"
                >
                  {viewMode === 'grid' ? (
                    <>
                      <List className="h-4 w-4" />
                      List View
                    </>
                  ) : (
                    <>
                      <LayoutGrid className="h-4 w-4" />
                      Grid View
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Filters */}
            <QuotationFilters
              searchTerm={quotationContainer.filters.searchTerm}
              onSearchChange={quotationContainer.filterActions.setSearchTerm}
              statusFilter={quotationContainer.filters.statusFilter}
              onStatusChange={quotationContainer.filterActions.setStatusFilter}
              onClearFilters={quotationContainer.filterActions.clearFilters}
              showAdvancedFilters={true}
              statistics={quotationContainer.stats}
            />

            {/* Loading State */}
            {quotationContainer.isLoading && (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Loading quotations...</p>
              </div>
            )}

            {/* Error State */}
            {quotationContainer.isError && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Error Loading Quotations
                  </h3>
                  <p className="text-red-600 mb-4">
                    {quotationContainer.error || 'An unexpected error occurred'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={quotationContainer.handleRefresh}
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Quotations Grid/List */}
            {!quotationContainer.isLoading && !quotationContainer.isError && (
              <>
                {quotationContainer.quotations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Quotations Found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {quotationContainer.filters.searchTerm || quotationContainer.filters.statusFilter !== 'all'
                          ? 'No quotations match your current filters.'
                          : 'No quotations have been created yet.'}
                      </p>
                      {(quotationContainer.filters.searchTerm || quotationContainer.filters.statusFilter !== 'all') && (
                        <Button
                          variant="outline"
                          onClick={quotationContainer.filterActions.clearFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                  }>
                    {quotationContainer.quotations.map((quotation: any) => (
                      <QuotationCard
                        key={quotation.id}
                        quotation={quotation}
                        onViewDetails={handleViewDetails}
                        onViewResponses={handleViewResponses}
                        compact={viewMode === 'list'}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {quotationContainer.pageInfo.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <Button
                        variant="outline"
                        onClick={() => quotationContainer.handlePageChange(quotationContainer.pageInfo.pageNumber - 1)}
                        disabled={quotationContainer.pageInfo.pageNumber <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => quotationContainer.handlePageChange(quotationContainer.pageInfo.pageNumber + 1)}
                        disabled={quotationContainer.pageInfo.pageNumber >= quotationContainer.pageInfo.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">
                            {((quotationContainer.pageInfo.pageNumber - 1) * quotationContainer.pageInfo.pageSize) + 1}
                          </span>{' '}
                          to{' '}
                          <span className="font-medium">
                            {Math.min(
                              quotationContainer.pageInfo.pageNumber * quotationContainer.pageInfo.pageSize,
                              quotationContainer.pageInfo.totalElements
                            )}
                          </span>{' '}
                          of{' '}
                          <span className="font-medium">{quotationContainer.pageInfo.totalElements}</span>{' '}
                          results
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quotationContainer.handlePageChange(quotationContainer.pageInfo.pageNumber - 1)}
                          disabled={quotationContainer.pageInfo.pageNumber <= 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-700">
                          Page {quotationContainer.pageInfo.pageNumber} of {quotationContainer.pageInfo.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quotationContainer.handlePageChange(quotationContainer.pageInfo.pageNumber + 1)}
                          disabled={quotationContainer.pageInfo.pageNumber >= quotationContainer.pageInfo.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <ImageGallery
          images={selectedImages.map((url, index) => ({
            id: `modal-${index}`,
            url,
            alt: `${modalProductName} - Image ${index + 1}`,
            title: `${modalProductName} - Image ${index + 1}`,
          }))}
          title={modalProductName}
          allowDownload={true}
          onImageClick={(index: number) => setCurrentImageIndex(index)}
        />
      )}
    </div>
  );
}