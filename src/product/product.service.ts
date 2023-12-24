import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  ProductAllResponseDto,
  UpdateProductDto,
  ProductResponse,
  ProductResponseDto,
} from './dto/product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SequenceService } from 'src/sequence/sequence.service';

@Injectable()
export class ProductService {
  _prisma: PrismaService;
  _sequence: SequenceService;
  constructor(
    private prisma: PrismaService,
    private sequence: SequenceService,
  ) {
    this._prisma = prisma;
    this._sequence = sequence;
  }
  async create(
    createProductDto: CreateProductDto,
    userId: string,
  ): Promise<ProductResponseDto> {
    const { category, itemCost, itemName, itemPrice, taxId, uom } =
      createProductDto;
    let { sku } = createProductDto;
    const tax = await this._prisma.tax.findFirst({
      where: {
        id: taxId,
      },
    });
    if (!tax) {
      throw new HttpException('tax id not found', HttpStatus.BAD_REQUEST);
    }

    if (sku != null && sku != undefined && sku != '') {
      const existSku = await this._prisma.product.findFirst({
        where: {
          sku: sku,
        },
      });
      if (existSku) {
        throw new HttpException('sku already exist', HttpStatus.BAD_REQUEST);
      }
    } else {
      sku = await this._sequence.generate('SKU');
    }

    const product = await this._prisma.product.create({
      data: {
        sku: sku,
        name: itemName,
        uom: uom,
        category: category,
        item_cost: itemCost,
        item_price: itemPrice,
        tax_id: taxId,
        created_by: userId,
      },
    });

    const res: ProductResponseDto = {
      data: {
        id: product.id,
        sku: sku,
        ...createProductDto,
      },
    };
    return res;
  }

  async find(id: string, userId: string): Promise<ProductResponseDto> {
    const product = await this._prisma.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!product) {
      throw new HttpException('product not found', HttpStatus.BAD_REQUEST);
    }

    if (product.created_by != userId) {
      throw new HttpException(
        'your not own the product',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res: ProductResponseDto = {
      data: {
        id: product.id,
        sku: product.sku,
        category: product.category,
        itemCost: +product.item_cost,
        itemPrice: +product.item_price,
        itemName: product.name,
        taxId: product.tax_id,
        uom: product.uom,
      },
    };
    return res;
  }

  async findAll(userId: string): Promise<ProductAllResponseDto> {
    const products = await this._prisma.product.findMany({
      where: {
        created_by: userId,
      },
    });
    const mapping = products.map((x) => {
      const map: ProductResponse = {
        id: x.id,
        sku: x.sku,
        category: x.category,
        itemCost: +x.item_cost,
        itemPrice: +x.item_price,
        itemName: x.name,
        taxId: x.tax_id,
        uom: x.uom,
      };
      return map;
    });
    const res: ProductAllResponseDto = {
      data: mapping,
    };
    return res;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<ProductResponseDto> {
    const { category, itemCost, itemName, itemPrice, taxId, uom } =
      updateProductDto;
    const product = await this._prisma.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!product) {
      throw new HttpException('product id not found', HttpStatus.BAD_REQUEST);
    }

    if (product.created_by != userId) {
      throw new HttpException(
        'your not own the product',
        HttpStatus.BAD_REQUEST,
      );
    }

    const update = await this._prisma.product.update({
      where: {
        id: id,
      },
      data: {
        name: itemName,
        uom: uom,
        category: category,
        item_cost: itemCost,
        item_price: itemPrice,
        tax_id: taxId,
      },
    });

    const res: ProductResponseDto = {
      data: {
        id: update.id,
        sku: update.sku,
        ...updateProductDto,
      },
    };
    return res;
  }

  async remove(id: string, userId: string) {
    const product = await this._prisma.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!product) {
      throw new HttpException('product id not found', HttpStatus.BAD_REQUEST);
    }

    if (product.created_by != userId) {
      throw new HttpException(
        'your not own the product',
        HttpStatus.BAD_REQUEST,
      );
    }
    const checkPurchase = await this._prisma.purchaseDetail.findFirst({
      where: {
        product_id: id,
      },
    });
    if (checkPurchase) {
      throw new HttpException(
        'cannot remove product because already use for purchase',
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkSales = await this._prisma.salesDetail.findFirst({
      where: {
        product_id: id,
      },
    });
    if (checkSales) {
      throw new HttpException(
        'cannot remove product because already use for sales',
        HttpStatus.BAD_REQUEST,
      );
    }
    const remove = await this._prisma.product.delete({
      where: {
        id: id,
      },
    });
    return {
      message: `success delete product id ${remove.id}`,
    };
  }
}
