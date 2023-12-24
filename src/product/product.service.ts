import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  ProductAllResponseDto,
  ProductResponse,
  ProductResponseDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  prisma: PrismaService;
  constructor(private _prisma: PrismaService) {
    this.prisma = _prisma;
  }
  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const { sku, category, itemCost, itemName, itemPrice, taxId, uom } =
      createProductDto;
    const tax = await this.prisma.tax.findFirst({
      where: {
        id: taxId,
      },
    });
    if (!tax) {
      throw new HttpException('tax id not found', HttpStatus.BAD_REQUEST);
    }

    if (sku != null && sku != undefined && sku != '') {
      const existSku = await this.prisma.product.findFirst({
        where: {
          sku: sku,
        },
      });
      if (existSku) {
        throw new HttpException('sku already exist', HttpStatus.BAD_REQUEST);
      }
    }
    const product = await this.prisma.product.create({
      data: {
        sku: sku,
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
        id: product.id,
        ...createProductDto,
      },
    };
    return res;
  }

  async find(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: id,
      },
    });
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

  async findAll(): Promise<ProductAllResponseDto> {
    const products = await this.prisma.product.findMany();
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
  ): Promise<ProductResponseDto> {
    const { category, itemCost, itemName, itemPrice, taxId, uom } =
      updateProductDto;
    const product = await this.prisma.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!product) {
      throw new HttpException('product id not found', HttpStatus.BAD_REQUEST);
    }

    const update = await this.prisma.product.update({
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

  async remove(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!product) {
      throw new HttpException('product id not found', HttpStatus.BAD_REQUEST);
    }
    const remove = await this.prisma.product.delete({
      where: {
        id: id,
      },
    });
    return {
      message: `success delete product id ${remove.id}`,
    };
  }
}
