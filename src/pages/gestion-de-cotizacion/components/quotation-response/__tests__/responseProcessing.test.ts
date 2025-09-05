import { describe, test, expect, beforeEach } from '@jest/globals';
import type { QuotationGetResponsesForUsersDTO } from '@/api/interface/quotationResponseInterfaces';
import {
  processQuotationResponses,
  groupResponsesByServiceType,
  filterResponses,
  generateUniqueId,
  calculateDisplayMetadata,
  findResponseByUniqueId,
  activateResponse,
} from '../utils/responseProcessing';
import type { FilterCriteria } from '../utils/interfaces';

// Mock data
const mockResponse1: QuotationGetResponsesForUsersDTO = {
  quotationInfo: {
    correlative: 'TEST-001',
    date: '2024-01-15',
    serviceType: 'Pendiente',
    cargoType: 'Mixed',
    courier: 'UPS',
    incoterm: 'DDP',
    idQuotationResponse: 'resp-1',
  },
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  },
  serviceType: 'Pendiente',
  products: [
    {
      productId: 'prod-1',
      name: 'Product 1',
      url: 'https://example.com/product1',
      comment: 'Test product',
      quantityTotal: 10,
      weight: '5.5',
      volume: '2.3',
      number_of_boxes: 2,
      adminComment: 'Admin test comment',
      seCotizaProducto: true,
      attachments: [],
      variants: [
        {
          variantId: 'var-1',
          size: 'M',
          presentation: 'Box',
          model: 'Model-A',
          color: 'Red',
          quantity: 10,
          price: '100.50',
          unitCost: '10.05',
          importCosts: '5.25',
          seCotizaVariante: true,
        },
      ],
    },
  ],
};

const mockResponse2: QuotationGetResponsesForUsersDTO = {
  quotationInfo: {
    correlative: 'TEST-002',
    date: '2024-01-16',
    serviceType: 'Consolidado Marítimo',
    cargoType: 'Container',
    courier: 'DHL',
    incoterm: 'FOB',
    idQuotationResponse: 'resp-2',
  },
  user: {
    id: 'user-2',
    name: 'Test User 2',
    email: 'test2@example.com',
  },
  serviceType: 'Consolidado Marítimo',
  products: [
    {
      productId: 'prod-2',
      name: 'Product 2',
      url: 'https://example.com/product2',
      comment: 'Another test product',
      quantityTotal: 20,
      weight: '10.0',
      volume: '4.5',
      number_of_boxes: 5,
      adminComment: 'Second admin comment',
      seCotizaProducto: false,
      attachments: ['file1.pdf'],
      variants: [
        {
          variantId: 'var-2',
          size: 'L',
          presentation: 'Pallet',
          model: 'Model-B',
          color: 'Blue',
          quantity: 20,
          price: '200.75',
          unitCost: '10.04',
          importCosts: '15.50',
          seCotizaVariante: false,
        },
      ],
    },
  ],
};

describe('Response Processing Utilities', () => {
  describe('generateUniqueId', () => {
    test('should generate unique ID with response ID', () => {
      const id = generateUniqueId(mockResponse1, 0);
      expect(id).toBe('Pendiente-resp-1');
    });

    test('should generate temporary ID when response ID is missing', () => {
      const responseWithoutId = {
        ...mockResponse1,
        quotationInfo: {
          ...mockResponse1.quotationInfo,
          idQuotationResponse: undefined,
        },
      };
      const id = generateUniqueId(responseWithoutId, 0);
      expect(id).toBe('Pendiente-temp-0');
    });

    test('should handle different service types', () => {
      const id = generateUniqueId(mockResponse2, 1);
      expect(id).toBe('Consolidado Marítimo-resp-2');
    });
  });

  describe('calculateDisplayMetadata', () => {
    test('should calculate correct metadata for response with products', () => {
      const metadata = calculateDisplayMetadata(mockResponse1);
      
      expect(metadata.productCount).toBe(1);
      expect(metadata.totalQuantity).toBe(10);
      expect(metadata.totalValue).toBe(100.50);
      expect(metadata.totalWeight).toBe(5.5);
      expect(metadata.totalVolume).toBe(2.3);
      expect(metadata.hasVariants).toBe(true);
    });

    test('should handle response without products', () => {
      const responseWithoutProducts = {
        ...mockResponse1,
        products: [],
      };
      const metadata = calculateDisplayMetadata(responseWithoutProducts);
      
      expect(metadata.productCount).toBe(0);
      expect(metadata.totalQuantity).toBe(0);
      expect(metadata.totalValue).toBe(0);
      expect(metadata.totalWeight).toBe(0);
      expect(metadata.totalVolume).toBe(0);
      expect(metadata.hasVariants).toBe(false);
    });

    test('should calculate from variants when quantityTotal is undefined', () => {
      const responseWithVariantQty = {
        ...mockResponse1,
        products: [
          {
            ...mockResponse1.products[0],
            quantityTotal: undefined,
          },
        ],
      };
      const metadata = calculateDisplayMetadata(responseWithVariantQty);
      
      expect(metadata.totalQuantity).toBe(10); // From variant quantity
    });
  });

  describe('processQuotationResponses', () => {
    test('should process responses correctly', () => {
      const responses = [mockResponse1, mockResponse2];
      const processed = processQuotationResponses(responses);
      
      expect(processed).toHaveLength(2);
      expect(processed[0].uniqueId).toBe('Pendiente-resp-1');
      expect(processed[1].uniqueId).toBe('Consolidado Marítimo-resp-2');
      expect(processed[0].isActive).toBe(false);
      expect(processed[1].isActive).toBe(false);
    });

    test('should handle empty response array', () => {
      const processed = processQuotationResponses([]);
      expect(processed).toHaveLength(0);
    });

    test('should sort by date when requested', () => {
      const responses = [mockResponse1, mockResponse2];
      const processed = processQuotationResponses(responses, { sortByDate: true });
      
      // mockResponse2 has a later date (2024-01-16 vs 2024-01-15)
      expect(processed[0].data.quotationInfo.date).toBe('2024-01-16');
      expect(processed[1].data.quotationInfo.date).toBe('2024-01-15');
    });
  });

  describe('groupResponsesByServiceType', () => {
    test('should group responses by service type', () => {
      const responses = [mockResponse1, mockResponse2];
      const processed = processQuotationResponses(responses);
      const grouped = groupResponsesByServiceType(processed);
      
      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['Pendiente']).toBeDefined();
      expect(grouped['Consolidado Marítimo']).toBeDefined();
      expect(grouped['Pendiente'].count).toBe(1);
      expect(grouped['Consolidado Marítimo'].count).toBe(1);
    });

    test('should set default active response', () => {
      const responses = [mockResponse1, mockResponse2];
      const processed = processQuotationResponses(responses);
      const grouped = groupResponsesByServiceType(processed);
      
      expect(grouped['Pendiente'].defaultActive.uniqueId).toBe('Pendiente-resp-1');
      expect(grouped['Consolidado Marítimo'].defaultActive.uniqueId).toBe('Consolidado Marítimo-resp-2');
    });

    test('should handle multiple responses of same service type', () => {
      const duplicateResponse = {
        ...mockResponse1,
        quotationInfo: {
          ...mockResponse1.quotationInfo,
          idQuotationResponse: 'resp-3',
        },
      };
      const responses = [mockResponse1, duplicateResponse];
      const processed = processQuotationResponses(responses);
      const grouped = groupResponsesByServiceType(processed);
      
      expect(grouped['Pendiente'].count).toBe(2);
      expect(grouped['Pendiente'].responses).toHaveLength(2);
    });
  });

  describe('filterResponses', () => {
    let processed: any[];

    beforeEach(() => {
      const responses = [mockResponse1, mockResponse2];
      processed = processQuotationResponses(responses);
    });

    test('should filter by service type', () => {
      const filters: FilterCriteria = {
        serviceType: 'Pendiente',
      };
      const filtered = filterResponses(processed, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].serviceType).toBe('Pendiente');
    });

    test('should filter by response ID', () => {
      const filters: FilterCriteria = {
        responseId: 'resp-2',
      };
      const filtered = filterResponses(processed, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].responseId).toBe('resp-2');
    });

    test('should filter by date range', () => {
      const filters: FilterCriteria = {
        dateRange: {
          start: new Date('2024-01-16'),
          end: new Date('2024-01-17'),
        },
      };
      const filtered = filterResponses(processed, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].data.quotationInfo.date).toBe('2024-01-16');
    });

    test('should return all responses when no filters applied', () => {
      const filtered = filterResponses(processed, {});
      expect(filtered).toHaveLength(2);
    });

    test('should combine multiple filters', () => {
      const filters: FilterCriteria = {
        serviceType: 'Consolidado Marítimo',
        responseId: 'resp-2',
      };
      const filtered = filterResponses(processed, filters);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].serviceType).toBe('Consolidado Marítimo');
      expect(filtered[0].responseId).toBe('resp-2');
    });
  });

  describe('findResponseByUniqueId', () => {
    test('should find response by unique ID', () => {
      const responses = [mockResponse1, mockResponse2];
      const processed = processQuotationResponses(responses);
      const found = findResponseByUniqueId(processed, 'Pendiente-resp-1');
      
      expect(found).toBeDefined();
      expect(found?.uniqueId).toBe('Pendiente-resp-1');
    });

    test('should return undefined for non-existent ID', () => {
      const responses = [mockResponse1, mockResponse2];
      const processed = processQuotationResponses(responses);
      const found = findResponseByUniqueId(processed, 'non-existent');
      
      expect(found).toBeUndefined();
    });
  });

  describe('activateResponse', () => {
    test('should activate target response and deactivate others', () => {
      const responses = [mockResponse1, mockResponse2];
      const processed = processQuotationResponses(responses);
      const activated = activateResponse(processed, 'Pendiente-resp-1');
      
      const targetResponse = activated.find(r => r.uniqueId === 'Pendiente-resp-1');
      const otherResponse = activated.find(r => r.uniqueId === 'Consolidado Marítimo-resp-2');
      
      expect(targetResponse?.isActive).toBe(true);
      expect(otherResponse?.isActive).toBe(false);
    });

    test('should handle non-existent target ID', () => {
      const responses = [mockResponse1, mockResponse2];
      const processed = processQuotationResponses(responses);
      const activated = activateResponse(processed, 'non-existent');
      
      // All should be inactive when target doesn't exist
      activated.forEach(response => {
        expect(response.isActive).toBe(false);
      });
    });
  });
});