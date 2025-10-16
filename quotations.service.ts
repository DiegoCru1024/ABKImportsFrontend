import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Quotation } from '../entities/quotation.entity';
import { QuotationStatus } from '../entities/enums';
import { ProductsQuotation } from '../entities/products-quotation.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { StatusHistory } from '../entities/status-history.entity';
import { Observation } from '../entities/observation.entity';
import { QuotationResponse } from '../entities/quotation-response.entity';
import { UsersService } from '../users/users.service';
import { UserType } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationsRepository: Repository<Quotation>,
    @InjectRepository(ProductsQuotation)
    private productsRepository: Repository<ProductsQuotation>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(StatusHistory)
    private statusHistoryRepository: Repository<StatusHistory>,
    @InjectRepository(Observation)
    private observationsRepository: Repository<Observation>,
    @InjectRepository(QuotationResponse)
    private quotationResponseRepository: Repository<QuotationResponse>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  private async checkQuotationAccess(quotation: Quotation, userId: string) {
    try {
      if (quotation.user.id_usuario !== userId) {
        const user = await this.usersService.findOneWithPassword(userId);
        if (user.type !== UserType.ADMIN) {
          throw new ForbiddenException(
            'You do not have access to this quotation',
          );
        }
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error in checkQuotationAccess:', error);
      throw new ForbiddenException('You do not have access to this quotation');
    }
  }

  async create(createQuotationDto: {
    userId: string;
    service_type: string;
    products: Array<{
      name: string;
      url: string;
      comment?: string;
      weight: number;
      volume: number;
      number_of_boxes: number;
      variants: Array<{
        variantId?: string;
        size: string;
        presentation: string;
        model: string;
        color: string;
        quantity: number;
      }>;
      attachments?: string[];
    }>;
    saveAsDraft?: boolean;
  }): Promise<any> {
    return await this.quotationsRepository.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        const user = await this.usersService.findOneWithPassword(
          createQuotationDto.userId,
        );

        // Generar correlative dentro de la transacción
        const correlative = await this.generateCorrelativeInTransaction(
          transactionalEntityManager,
        );

        // Determinar el estado inicial
        const initialStatus = createQuotationDto.saveAsDraft
          ? QuotationStatus.DRAFT
          : QuotationStatus.PENDING;
        console.log('saveAsDraft:', createQuotationDto.saveAsDraft);
        console.log('initialStatus determined:', initialStatus);

        const quotation = this.quotationsRepository.create({
          user,
          correlative,
          status: initialStatus,
        });

        console.log('Quotation created with status:', quotation.status);

        const savedQuotation = await transactionalEntityManager.save(quotation);
        console.log('Saved quotation with status:', savedQuotation.status);

        // Crear productos sin las variantes primero
        const products = createQuotationDto.products.map((product) => {
          const { variants, ...productData } = product;
          return this.productsRepository.create({
            ...productData,
            quotation: savedQuotation,
          });
        });
        const savedProducts = await transactionalEntityManager.save(products);

        // Crear las variantes para cada producto
        for (let i = 0; i < createQuotationDto.products.length; i++) {
          const productData = createQuotationDto.products[i];
          const savedProduct = savedProducts[i];

          if (productData.variants && productData.variants.length > 0) {
            const variants = productData.variants.map((variant) => {
              const { variantId, ...variantData } = variant;
              return this.productVariantRepository.create({
                ...variantData,
                product: savedProduct,
              });
            });
            await transactionalEntityManager.save(variants);
          }
        }

        const statusHistory = this.statusHistoryRepository.create({
          status: initialStatus,
          quotation: savedQuotation,
        });
        await transactionalEntityManager.save(statusHistory);

        // Enviar notificación si no es draft (fuera de la transacción)
        if (!createQuotationDto.saveAsDraft && this.notificationsService) {
          // Usar setImmediate para ejecutar después de que la transacción se complete
          setImmediate(async () => {
            try {
              await this.notificationsService.notifyQuotationCreated(
                savedQuotation.id_quotation,
                savedQuotation.correlative,
              );
            } catch (error) {
              console.error('Error sending notification:', error);
            }
          });
        }

        // Obtener la cotización completa con todas las relaciones dentro de la transacción
        const completeQuotation = await transactionalEntityManager.findOne(
          Quotation,
          {
            where: { id_quotation: savedQuotation.id_quotation },
            relations: ['products', 'products.variants', 'user'],
          },
        );

        if (!completeQuotation) {
          throw new NotFoundException(
            `Created quotation with ID ${savedQuotation.id_quotation} not found`,
          );
        }

        // Retornar la estructura esperada
        return {
          id: completeQuotation.id_quotation,
          correlative: completeQuotation.correlative,
          status: completeQuotation.status, // Este será 'draft' cuando saveAsDraft: true
          service_type: createQuotationDto.service_type,
          user: {
            id: completeQuotation.user.id_usuario,
            name: completeQuotation.user.name || completeQuotation.user.email,
            email: completeQuotation.user.email,
          },
          products: completeQuotation.products.map((product) => ({
            productId: product.id_product_quotation,
            name: product.name,
            url: product.url,
            comment: product.comment,
            quantityTotal: product.quantityTotal,
            weight: product.weight,
            volume: product.volume,
            number_of_boxes: product.number_of_boxes,
            variants: product.variants
              ? product.variants.map((variant) => ({
                  variantId: variant.id_product_variant,
                  size: variant.size,
                  presentation: variant.presentation,
                  model: variant.model,
                  color: variant.color,
                  quantity: variant.quantity,
                }))
              : [],
            attachments: product.attachments,
          })),
          createdAt: this.formatDateTime(completeQuotation.created_at),
          updatedAt: this.formatDateTime(completeQuotation.updated_at),
        };
      },
    );
  }

  private async generateCorrelativeInTransaction(
    transactionalEntityManager: any,
  ): Promise<string> {
    const currentYear = new Date().getFullYear();

    const result = await transactionalEntityManager.query(
      `
      SELECT MAX(CAST(SUBSTRING(correlative, 5, 5) AS INTEGER)) as max_number
      FROM "Quotation" 
      WHERE correlative LIKE $1
    `,
      [`COT-%-${currentYear}`],
    );

    const maxNumber = parseInt(result[0]?.max_number) || 0;
    const nextNumber = maxNumber + 1;
    const correlative = `COT-${nextNumber.toString().padStart(5, '0')}-${currentYear}`;

    return correlative;
  }

  async findAllByUser(userId: string): Promise<any[]> {
    const quotations = await this.quotationsRepository.find({
      where: {
        user: { id_usuario: userId },
      },
      relations: ['products', 'products.variants', 'user'],
      order: { created_at: 'DESC' },
      withDeleted: false,
    });

    const quotationIds = quotations.map((q) => q.id_quotation);

    // Obtener respuestas para todas las cotizaciones
    const responses = await this.quotationResponseRepository.find({
      where: { quotation: { id_quotation: In(quotationIds) } },
      relations: ['responseProducts'],
    });

    // Crear un mapa de respuestas por cotización
    const responsesMap = new Map();
    responses.forEach((response) => {
      const quotationId = response.quotation.id_quotation;
      if (!responsesMap.has(quotationId)) {
        responsesMap.set(quotationId, []);
      }
      responsesMap.get(quotationId).push(response);
    });

    return quotations.map((quotation) => ({
      quotationId: quotation.id_quotation,
      correlative: quotation.correlative,
      status: quotation.status,
      user: {
        id: quotation.user.id_usuario,
        email: quotation.user.email,
      },
      products: quotation.products
        .filter((product) => product.is_active !== false)
        .map((product) => ({
          productId: product.id_product_quotation,
          name: product.name,
          url: product.url,
          comment: product.comment,
          quantityTotal: product.quantityTotal,
          weight: product.weight,
          volume: product.volume,
          number_of_boxes: product.number_of_boxes,
          variants: product.variants
            ? product.variants
                .filter((variant) => variant.is_active !== false)
                .map((variant) => ({
                  variantId: variant.id_product_variant,
                  size: variant.size,
                  presentation: variant.presentation,
                  model: variant.model,
                  color: variant.color,
                  quantity: variant.quantity,
                }))
            : [],
          attachments: product.attachments,
        })),
      respondedProducts: responsesMap.get(quotation.id_quotation)?.length || 0,
      createdAt: this.formatDateTime(quotation.created_at),
      updatedAt: this.formatDateTime(quotation.updated_at),
    }));
  }

  async findAllPaginated(
    userId: string,
    page: number = 1,
    size: number = 10,
    searchTerm?: string,
    status?: QuotationStatus,
  ): Promise<{
    content: any[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  }> {
    const user = await this.usersService.findOneWithPassword(userId);
    //console.log('user:', user);
    const isAdmin = user.type === UserType.ADMIN;
    //console.log('isAdmin:', isAdmin);

    const queryBuilder = this.quotationsRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.user', 'user')
      .leftJoinAndSelect('quotation.products', 'products')
      .leftJoinAndSelect('products.variants', 'variants')
      .where('quotation.deleted_at IS NULL'); // Excluir registros soft deleted

    // Filtrar por usuario si no es admin
    if (!isAdmin) {
      queryBuilder.andWhere('quotation.user.id_usuario = :userId', { userId });
    }

    // Búsqueda por correlativo
    if (searchTerm) {
      queryBuilder.andWhere('quotation.correlative ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    // Filtrar por status
    if (status) {
      queryBuilder.andWhere('quotation.status = :status', { status });
    }

    const totalElements = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalElements / size);

    const quotations = await queryBuilder
      .orderBy('quotation.created_at', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getMany();

    // Obtener respuestas para todas las cotizaciones
    const quotationIds = quotations.map((q) => q.id_quotation);
    const responses = await this.quotationResponseRepository.find({
      where: { quotation: { id_quotation: In(quotationIds) } },
      relations: ['responseProducts', 'quotation'],
    });

    // Crear un mapa de respuestas por cotización
    const responsesMap = new Map();
    responses.forEach((response) => {
      const quotationId = response.quotation.id_quotation;
      if (!responsesMap.has(quotationId)) {
        responsesMap.set(quotationId, []);
      }
      responsesMap.get(quotationId).push(response);
    });

    const content = quotations.map((quotation) => {
      // Obtener service_type de la primera respuesta disponible para esta cotización
      const quotationResponses = responsesMap.get(quotation.id_quotation) || [];
      const serviceType =
        quotationResponses.length > 0
          ? quotationResponses[0].service_type
          : 'Por determinar';

      return {
        quotationId: quotation.id_quotation,
        correlative: quotation.correlative,
        status: quotation.status,
        service_type: serviceType,
        user: {
          id: quotation.user.id_usuario,
          name: (quotation.user as any).name || quotation.user.email,
          email: quotation.user.email,
        },
        products: quotation.products
          .filter((product) => product.is_active !== false)
          .map((product) => ({
            productId: product.id_product_quotation,
            name: product.name,
            url: product.url,
            comment: product.comment,
            quantityTotal: product.quantityTotal,
            weight: product.weight,
            volume: product.volume,
            number_of_boxes: product.number_of_boxes,
            variants: product.variants
              ? product.variants
                  .filter((variant) => variant.is_active !== false)
                  .map((variant) => ({
                    variantId: variant.id_product_variant,
                    size: variant.size,
                    presentation: variant.presentation,
                    model: variant.model,
                    color: variant.color,
                    quantity: variant.quantity,
                  }))
              : [],
            attachments: product.attachments,
          })),
        productQuantity: quotation.products.filter((p) => p.is_active !== false)
          .length,
        createdAt: this.formatDateTime(quotation.created_at),
        updatedAt: this.formatDateTime(quotation.updated_at),
      };
    });

    return {
      content,
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      last: page >= totalPages,
    };
  }

  private formatDateTime(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  async findOne(id: string, userId: string): Promise<any> {
    try {
      const quotation = await this.quotationsRepository.findOne({
        where: { id_quotation: id },
        relations: ['products', 'products.variants', 'user'],
        withDeleted: false, // Excluir registros soft deleted
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${id} not found`);
      }

      await this.checkQuotationAccess(quotation, userId);

      // Obtener respuestas de la cotización
      const responses = await this.quotationResponseRepository.find({
        where: { quotation: { id_quotation: id } },
        relations: ['responseProducts'],
      });

      // Obtener el service_type de la primera respuesta disponible
      const serviceType =
        responses.length > 0 ? responses[0].service_type : 'Express shipping';

      return {
        quotationId: quotation.id_quotation,
        correlative: quotation.correlative,
        status: quotation.status,
        service_type: serviceType,
        products: quotation.products
          .filter((product) => product.is_active !== false)
          .map((product) => ({
            productId: product.id_product_quotation,
            name: product.name,
            url: product.url,
            comment: product.comment,
            quantityTotal: product.quantityTotal,
            weight: product.weight,
            volume: product.volume,
            number_of_boxes: product.number_of_boxes,
            variants: product.variants
              ? product.variants
                  .filter((variant) => variant.is_active !== false)
                  .map((variant) => ({
                    variantId: variant.id_product_variant,
                    size: variant.size,
                    presentation: variant.presentation,
                    model: variant.model,
                    color: variant.color,
                    quantity: variant.quantity,
                  }))
              : [],
            attachments: product.attachments,
          })),
        createdAt: this.formatDateTime(quotation.created_at),
        updatedAt: this.formatDateTime(quotation.updated_at),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error in findOne:', error);
      throw new NotFoundException(
        `Quotation with ID ${id} not found or access denied`,
      );
    }
  }

  async updateStatus(
    id: string,
    userId: string,
    status: QuotationStatus,
    observation?: { text: string; image_url?: string },
  ): Promise<{
    id: string;
    correlative: string;
    status: QuotationStatus;
    message: string;
  }> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id_quotation: id },
      relations: ['user'],
      withDeleted: false, // Excluir registros soft deleted
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    await this.checkQuotationAccess(quotation, userId);

    // Actualizar estado
    quotation.status = status;
    await this.quotationsRepository.save(quotation);

    // Crear historial de estado
    const statusHistory = this.statusHistoryRepository.create({
      status,
      quotation,
    });
    await this.statusHistoryRepository.save(statusHistory);

    // Crear observación si se proporciona
    if (observation) {
      const observationEntity = this.observationsRepository.create({
        text: observation.text,
        image_url: observation.image_url,
        statusHistory,
      });
      await this.observationsRepository.save(observationEntity);
    }

    // Enviar notificación
    if (this.notificationsService) {
      await this.notificationsService.notifyQuotationCreated(
        quotation.user.id_usuario,
        quotation.id_quotation,
      );
    }

    return {
      id: quotation.id_quotation,
      correlative: quotation.correlative,
      status: quotation.status,
      message: `Quotation status updated to ${status}`,
    };
  }

  async update(
    id: string,
    userId: string,
    updateQuotationDto: {
      service_type?: string;
      products?: Array<{
        productId?: string;
        name: string;
        url: string;
        comment?: string;
        quantityTotal?: number;
        weight: number;
        volume: number;
        number_of_boxes: number;
        variants: Array<{
          variantId?: string;
          size: string;
          presentation: string;
          model: string;
          color: string;
          quantity: number;
        }>;
        attachments?: string[];
      }>;
    },
  ): Promise<Quotation> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id_quotation: id },
      relations: ['products', 'products.variants'],
      withDeleted: false,
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    if (updateQuotationDto.products) {
      return await this.quotationsRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const existingProducts = quotation.products;
          const dtoProducts = updateQuotationDto.products!;

          const existingProductsMap = new Map(
            existingProducts.map((p) => [p.id_product_quotation, p]),
          );

          const dtoProductIds = dtoProducts
            .filter((p) => p.productId)
            .map((p) => p.productId);

          // 1. DESACTIVAR/ELIMINAR productos que ya NO vienen en el DTO
          const productsToDelete = existingProducts.filter(
            (p) => !dtoProductIds.includes(p.id_product_quotation),
          );

          for (const product of productsToDelete) {
            const hasResponses = await transactionalEntityManager.count(
              'QuotationResponseProducts',
              {
                where: {
                  product: {
                    id_product_quotation: product.id_product_quotation,
                  },
                },
              },
            );

            if (hasResponses > 0) {
              // SOFT DELETE: Marcar producto y sus variantes como inactivos
              await transactionalEntityManager.update(
                'ProductsQuotation',
                { id_product_quotation: product.id_product_quotation },
                { is_active: false },
              );

              // Desactivar todas las variantes del producto
              await transactionalEntityManager.update(
                'ProductVariant',
                { product: { id_product_quotation: product.id_product_quotation } },
                { is_active: false },
              );
            } else {
              // HARD DELETE: Eliminar físicamente si NO tiene respuestas
              await transactionalEntityManager.delete('ProductVariant', {
                product: { id_product_quotation: product.id_product_quotation },
              });
              await transactionalEntityManager.delete('ProductsQuotation', {
                id_product_quotation: product.id_product_quotation,
              });
            }
          }

          // 2. ACTUALIZAR o CREAR productos
          for (const dtoProduct of dtoProducts) {
            const {
              variants: dtoVariants,
              productId,
              quantityTotal,
              ...productData
            } = dtoProduct;

            if (productId && existingProductsMap.has(productId)) {
              // ACTUALIZAR PRODUCTO EXISTENTE
              const existingProduct = existingProductsMap.get(productId)!;

              await transactionalEntityManager.update(
                'ProductsQuotation',
                { id_product_quotation: productId },
                productData,
              );

              const existingVariants = existingProduct.variants || [];
              const existingVariantsMap = new Map(
                existingVariants.map((v) => [v.id_product_variant, v]),
              );

              const dtoVariantIds = dtoVariants
                .filter((v) => v.variantId)
                .map((v) => v.variantId);

              // 2.1 DESACTIVAR/ELIMINAR variantes que ya NO vienen en el DTO
              const variantsToDelete = existingVariants.filter(
                (v) => !dtoVariantIds.includes(v.id_product_variant),
              );

              for (const variant of variantsToDelete) {
                const hasVariantResponses =
                  await transactionalEntityManager.count(
                    'QuotationResponseVariants',
                    {
                      where: {
                        product_variant: {
                          id_product_variant: variant.id_product_variant,
                        },
                      },
                    },
                  );

                if (hasVariantResponses > 0) {
                  // SOFT DELETE: Marcar variante como inactiva
                  await transactionalEntityManager.update(
                    'ProductVariant',
                    { id_product_variant: variant.id_product_variant },
                    { is_active: false },
                  );
                } else {
                  // HARD DELETE: Eliminar físicamente si NO tiene respuestas
                  await transactionalEntityManager.delete('ProductVariant', {
                    id_product_variant: variant.id_product_variant,
                  });
                }
              }

              // 2.2 ACTUALIZAR o CREAR variantes
              for (const dtoVariant of dtoVariants) {
                const { variantId, ...variantData } = dtoVariant;

                if (variantId && existingVariantsMap.has(variantId)) {
                  await transactionalEntityManager.update(
                    'ProductVariant',
                    { id_product_variant: variantId },
                    variantData,
                  );
                } else {
                  const newVariant = this.productVariantRepository.create({
                    ...variantData,
                    product: existingProduct,
                  });
                  await transactionalEntityManager.save(newVariant);
                }
              }
            } else {
              // CREAR NUEVO PRODUCTO (no tiene productId o no existe)
              // Calcular quantityTotal desde las variantes
              const calculatedQuantityTotal =
                dtoVariants?.reduce((sum, v) => sum + v.quantity, 0) || 0;

              const newProduct = this.productsRepository.create({
                ...productData,
                quantityTotal: calculatedQuantityTotal,
                quotation,
              });
              const savedProduct =
                await transactionalEntityManager.save(newProduct);

              if (dtoVariants && dtoVariants.length > 0) {
                const variants = dtoVariants.map((variant) => {
                  const { variantId, ...variantData } = variant;
                  return this.productVariantRepository.create({
                    ...variantData,
                    product: savedProduct,
                  });
                });
                await transactionalEntityManager.save(variants);
              }
            }
          }

          // Calcular quantityTotal para cada producto
          const allProducts = await transactionalEntityManager.find(
            ProductsQuotation,
            {
              where: { quotation: { id_quotation: id } },
              relations: ['variants'],
            },
          );

          for (const product of allProducts) {
            const totalQuantity =
              product.variants?.reduce((sum, v) => sum + v.quantity, 0) || 0;

            await transactionalEntityManager.update(
              'ProductsQuotation',
              { id_product_quotation: product.id_product_quotation },
              { quantityTotal: totalQuantity },
            );
          }

          // Recargar la cotización con todas las relaciones actualizadas
          const updatedQuotation = await transactionalEntityManager.findOne(
            Quotation,
            {
              where: { id_quotation: id },
              relations: ['products', 'products.variants', 'user'],
            },
          );

          return updatedQuotation || quotation;
        },
      );
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    try {
      // Verificar si la quotation existe y no ha sido soft deleted
      const quotation = await this.quotationsRepository.findOne({
        where: { id_quotation: id },
        relations: ['user'], // Necesitamos la relación user para verificar acceso
        withDeleted: false, // Excluir registros soft deleted
      });

      if (!quotation) {
        throw new NotFoundException(`Quotation with ID ${id} not found`);
      }

      // Verificar que la quotation tenga un usuario válido
      if (!quotation.user) {
        throw new NotFoundException(
          `Quotation with ID ${id} has no associated user`,
        );
      }

      // Verificar acceso del usuario
      if (quotation.user.id_usuario !== userId) {
        const user = await this.usersService.findOneWithPassword(userId);
        if (user.type !== UserType.ADMIN) {
          throw new ForbiddenException(
            'You do not have access to this quotation',
          );
        }
      }

      // Implementar soft delete
      await this.quotationsRepository.softDelete(id);

      return { message: 'Quotation deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error in remove:', error);
      throw new NotFoundException(
        `Quotation with ID ${id} not found or access denied`,
      );
    }
  }

  async submitDraft(
    id: string,
    userId: string,
    submitDto: CreateQuotationDto,
  ): Promise<{ message: string; data: any }> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id_quotation: id },
      withDeleted: false, // Excluir registros soft deleted
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    //await this.checkQuotationAccess(quotation, userId);

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new ForbiddenException('Only draft quotations can be submitted');
    }

    // Actualizar productos: eliminar existentes y crear nuevos del DTO
    await this.quotationsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Obtener todos los productos existentes de la cotización
        const existingProducts = await transactionalEntityManager.find(
          ProductsQuotation,
          {
            where: { quotation: { id_quotation: id } },
            relations: ['variants'],
          },
        );

        // Eliminar variantes de cada producto
        for (const product of existingProducts) {
          if (product.variants && product.variants.length > 0) {
            await transactionalEntityManager.delete(ProductVariant, {
              product: { id_product_quotation: product.id_product_quotation },
            });
          }
        }

        // Eliminar productos existentes
        await transactionalEntityManager.delete('ProductsQuotation', {
          quotation: { id_quotation: id },
        });

        // Crear nuevos productos
        const products = submitDto.products.map((product) => {
          const { variants, ...productData } = product;
          return this.productsRepository.create({
            ...productData,
            quotation,
          });
        });
        const savedProducts = await transactionalEntityManager.save(products);

        // Crear las variantes para cada producto
        for (let i = 0; i < submitDto.products.length; i++) {
          const productData = submitDto.products[i];
          const savedProduct = savedProducts[i];

          if (productData.variants && productData.variants.length > 0) {
            const variants = productData.variants.map((variant) => {
              const { variantId, ...variantData } = variant;
              return this.productVariantRepository.create({
                ...variantData,
                product: savedProduct,
              });
            });
            await transactionalEntityManager.save(variants);
          }
        }
      },
    );

    // Cambiar estado a pending
    quotation.status = QuotationStatus.PENDING;
    await this.quotationsRepository.save(quotation);

    // Crear historial de estado
    const statusHistory = this.statusHistoryRepository.create({
      status: QuotationStatus.PENDING,
      quotation,
    });
    await this.statusHistoryRepository.save(statusHistory);

    // Enviar notificación
    if (this.notificationsService) {
      await this.notificationsService.notifyQuotationCreated(
        quotation.id_quotation,
        quotation.correlative,
      );
    }

    // Retornar mensaje de éxito y el DTO enviado
    return {
      message: 'Draft submitted successfully',
      data: {
        service_type: submitDto.service_type,
        products: submitDto.products,
      },
    };
  }
}
