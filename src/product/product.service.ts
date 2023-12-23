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
    if (createProductDto.taxId != null && createProductDto.taxId != '') {
      const tax = await this.prisma.tax.findFirst({
        where: {
          id: createProductDto.taxId,
        },
      });
      if (!tax) {
        throw new HttpException('tax id not found', HttpStatus.BAD_REQUEST);
      }
    }
    const create = await this.prisma.product.create({
      data: {
        sku: createProductDto.sku,
        name: createProductDto.itemName,
        uom: createProductDto.uom,
        category: createProductDto.category,
        item_cost: createProductDto.itemCost,
        item_price: createProductDto.itemPrice,
        tax_id: createProductDto.taxId,
        stock: createProductDto.stock,
      },
    });
    return {
      data: {
        id: create.id,
        ...createProductDto,
      },
    };
  }

  async findAll() {
    //const product = await this.prisma.product.findAll();
    return '';
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
