import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  prisma: PrismaService;
  constructor(private _prisma: PrismaService) {
    this.prisma = _prisma;
  }
  async create(createProductDto: CreateProductDto) {
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
    return {
      data: {
        id: product.id,
        ...createProductDto,
      },
    };
  }

  async find(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: id,
      },
    });
    return {
      data: product,
    };
  }

  async findAll() {
    const products = await this.prisma.product.findMany();
    return {
      data: products,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
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
    return {
      data: {
        id: update.id,
        ...updateProductDto,
      },
    };
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
