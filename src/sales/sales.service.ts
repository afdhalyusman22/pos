import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateSalesDto,
  CreateSalesResponse,
  SalesResponseDto,
  ProductItemResponseDto,
  DetailSalesResponse,
  AllSalesResponse,
} from './dto/sales.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SequenceService } from '../sequence/sequence.service';

@Injectable()
export class SalesService {
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
    createSalesDto: CreateSalesDto,
    userId: string,
  ): Promise<CreateSalesResponse> {
    const { invoiceDate, itemLines, note } = createSalesDto;
    let { invoiceNo } = createSalesDto;
    if (invoiceNo != null && invoiceNo != undefined && invoiceNo != '') {
      const existInvoice = await this._prisma.sales.findFirst({
        where: {
          invoice_no: invoiceNo,
        },
      });
      if (existInvoice) {
        throw new HttpException(
          'invoice sales already exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      invoiceNo = await this._sequence.generate('SLS');
    }
    const productIds = itemLines.map((item) => {
      return item.id;
    });

    const products = await this._prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        tax: true,
      },
    });

    let total: number = 0;
    let totalBeforeTax: number = 0;

    const mapItem: ProductItemResponseDto[] = [];

    const salesDetail = itemLines.map((item) => {
      const product = products.find((q) => q.id === item.id);

      if (!product) {
        throw new HttpException(
          `failed create sales, product with id ${item.id} not exist`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (product.stock < item.qty) {
        throw new HttpException(
          `failed create sales, stock product ${product.name} is insufficient`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const tax = +product.tax.rate / 100;
      const priceItem = item.qty * +product.item_price;
      const priceTax = priceItem * tax;
      const totalItem = priceItem + priceTax;

      totalBeforeTax = totalBeforeTax + priceItem;
      total = total + totalItem;

      const mapResItem: ProductItemResponseDto = {
        id: product.id,
        sku: product.sku,
        category: product.category,
        itemCost: +product.item_cost,
        itemPrice: +product.item_price,
        itemName: product.name,
        taxId: product.tax_id,
        uom: product.uom,
        qty: item.qty,
      };
      mapItem.push(mapResItem);

      const m = {
        product_id: item.id,
        qty: item.qty,
        item_price: product.item_price,
        total_before_tax: priceItem,
        total: totalItem,
      };
      return m;
    });

    const create = await this._prisma.sales.create({
      data: {
        invoice_date: new Date(invoiceDate),
        note: note,
        created_by: userId,
        invoice_no: invoiceNo,
        status: 'sales',
        total: total,
        total_before_tax: totalBeforeTax,
        sales_detail: {
          create: salesDetail,
        },
      },
    });

    if (!create) {
      throw new HttpException('failed create sales', HttpStatus.BAD_REQUEST);
    }

    await Promise.all(
      itemLines.map(async (x) => {
        const currentStock = products.find((q) => q.id === x.id)?.stock ?? 0;
        await this._prisma.product.updateMany({
          where: {
            id: x.id,
          },
          data: {
            stock: currentStock - x.qty,
          },
        });
      }),
    );

    const mapData: SalesResponseDto = {
      id: create.id,
      invoiceNo: invoiceNo,
      invoiceDate: invoiceDate,
      note: note,
      totalBeforeTax: totalBeforeTax,
      total: total,
      itemLines: mapItem,
    };

    const res: CreateSalesResponse = {
      data: mapData,
    };
    return res;
  }

  async findAll(userId: string) {
    const data = await this._prisma.sales.findMany({
      where: {
        created_by: userId,
      },
      include: {
        sales_detail: {
          include: {
            product: true,
          },
        },
      },
    });

    const map = data.map((sales) => {
      const mapItem = sales.sales_detail.map((detail) => {
        const mapResItem: ProductItemResponseDto = {
          id: detail.product.id,
          sku: detail.product.sku,
          category: detail.product.category,
          itemCost: +detail.product.item_cost,
          itemPrice: +detail.item_price,
          itemName: detail.product.name,
          taxId: detail.product.tax_id,
          uom: detail.product.uom,
          qty: detail.qty,
        };
        return mapResItem;
      });

      const mapData: SalesResponseDto = {
        id: sales.id,
        invoiceNo: sales.invoice_no,
        invoiceDate: sales.invoice_date.toISOString(),
        note: sales.note,
        totalBeforeTax: +sales.total_before_tax,
        total: +sales.total,
        itemLines: mapItem,
      };
      return mapData;
    });

    const res: AllSalesResponse = {
      data: map,
    };

    return res;
  }

  async findOne(id: string, userId: string) {
    const data = await this._prisma.sales.findFirst({
      where: {
        id: id,
      },
      include: {
        sales_detail: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!data) {
      throw new HttpException('data sales not found', HttpStatus.BAD_REQUEST);
    }

    if (data.created_by != userId) {
      throw new HttpException(
        'your not own the sales data',
        HttpStatus.BAD_REQUEST,
      );
    }

    const mapItem = data.sales_detail.map((detail) => {
      const mapResItem: ProductItemResponseDto = {
        id: detail.product.id,
        sku: detail.product.sku,
        category: detail.product.category,
        itemCost: +detail.product.item_cost,
        itemPrice: +detail.item_price,
        itemName: detail.product.name,
        taxId: detail.product.tax_id,
        uom: detail.product.uom,
        qty: detail.qty,
      };
      return mapResItem;
    });

    const mapData: SalesResponseDto = {
      id: data.id,
      invoiceNo: data.invoice_no,
      invoiceDate: data.invoice_date.toISOString(),
      note: data.note,
      totalBeforeTax: +data.total_before_tax,
      total: +data.total,
      itemLines: mapItem,
    };

    const res: DetailSalesResponse = {
      data: mapData,
    };

    return res;
  }

  async void(id: string, userId: string) {
    const data = await this._prisma.sales.findFirst({
      where: {
        id: id,
      },
      include: {
        sales_detail: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!data) {
      throw new HttpException('data sales not found', HttpStatus.BAD_REQUEST);
    }

    if (data.created_by != userId) {
      throw new HttpException(
        'your not own the sales data',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.status === 'void') {
      throw new HttpException('sales already void', HttpStatus.BAD_REQUEST);
    }

    const productItem = data.sales_detail.map((x) => {
      return {
        id: x.product_id,
        qty: x.qty,
        currentStock: x.product.stock,
      };
    });

    const updateSales = await this._prisma.sales.update({
      where: {
        id: id,
      },
      data: {
        status: 'void',
      },
    });

    if (!updateSales) {
      throw new HttpException('void sales failed', HttpStatus.BAD_REQUEST);
    }

    await Promise.all(
      productItem.map(async (x) => {
        await this._prisma.product.updateMany({
          where: {
            id: x.id,
          },
          data: {
            stock: x.currentStock + x.qty,
          },
        });
      }),
    );
    return {
      message: 'success void sales',
    };
  }
}
