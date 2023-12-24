import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreatePurchaseDto,
  CreatePurchaseResponse,
  PurchaseResponseDto,
  ProductItemResponseDto,
  DetailPurchaseResponse,
  AllPurchaseResponse,
  DetailPurchaseResponseDto,
} from './dto/purchase.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SequenceService } from '../sequence/sequence.service';

@Injectable()
export class PurchaseService {
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
    createPurchaseDto: CreatePurchaseDto,
    userId: string,
  ): Promise<CreatePurchaseResponse> {
    const { invoiceDate, itemLines, note } = createPurchaseDto;
    let { invoiceNo } = createPurchaseDto;
    if (invoiceNo != null && invoiceNo != undefined && invoiceNo != '') {
      const existInvoice = await this._prisma.purchase.findFirst({
        where: {
          invoice_no: invoiceNo,
        },
      });
      if (existInvoice) {
        throw new HttpException('sku already exist', HttpStatus.BAD_REQUEST);
      }
    } else {
      invoiceNo = await this._sequence.generate('PRC');
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

    if (products.length !== productIds.length) {
      const codeNotExist = productIds.filter(
        (i) =>
          !products
            .map((x) => {
              return x.id;
            })
            .includes(i),
      );

      throw new HttpException(
        `failed create purchase, product ${codeNotExist.join(', ')} not exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let total: number = 0;
    let totalBeforeTax: number = 0;

    const mapItem: ProductItemResponseDto[] = [];

    const purchaseDetail = itemLines.map((item) => {
      const product = products.find((q) => q.id === item.id);

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

    const create = await this._prisma.purchase.create({
      data: {
        invoice_date: new Date(invoiceDate),
        note: note,
        created_by: userId,
        invoice_no: invoiceNo,
        status: 'purchase',
        total: total,
        total_before_tax: totalBeforeTax,
        purchase_detail: {
          create: purchaseDetail,
        },
      },
    });

    if (!create) {
      throw new HttpException('failed create purchase', HttpStatus.BAD_REQUEST);
    }

    await Promise.all(
      itemLines.map(async (x) => {
        const currentStock = products.find((q) => q.id === x.id)?.stock ?? 0;
        await this._prisma.product.updateMany({
          where: {
            id: x.id,
          },
          data: {
            stock: currentStock + x.qty,
          },
        });
      }),
    );

    const mapData: PurchaseResponseDto = {
      invoiceNo: invoiceNo,
      invoiceDate: invoiceDate,
      note: note,
      totalBeforeTax: totalBeforeTax,
      total: total,
      itemLines: mapItem,
    };

    const res: CreatePurchaseResponse = {
      data: mapData,
    };
    return res;
  }

  async findAll(userId: string) {
    const data = await this._prisma.purchase.findMany({
      where: {
        created_by: userId,
      },
      include: {
        purchase_detail: {
          include: {
            product: true,
          },
        },
      },
    });

    const map = data.map((purchase) => {
      const mapItem = purchase.purchase_detail.map((detail) => {
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

      const mapData: DetailPurchaseResponseDto = {
        id: purchase.id,
        invoiceNo: purchase.invoice_no,
        invoiceDate: purchase.invoice_date.toISOString(),
        note: purchase.note,
        totalBeforeTax: +purchase.total_before_tax,
        total: +purchase.total,
        itemLines: mapItem,
      };
      return mapData;
    });

    const res: AllPurchaseResponse = {
      data: map,
    };

    return res;
  }

  async findOne(id: string, userId: string) {
    const data = await this._prisma.purchase.findFirst({
      where: {
        id: id,
      },
      include: {
        purchase_detail: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!data) {
      throw new HttpException(
        'data purchase not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.created_by != userId) {
      throw new HttpException(
        'your not own the purchase data',
        HttpStatus.BAD_REQUEST,
      );
    }

    const mapItem = data.purchase_detail.map((detail) => {
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

    const mapData: DetailPurchaseResponseDto = {
      id: data.id,
      invoiceNo: data.invoice_no,
      invoiceDate: data.invoice_date.toISOString(),
      note: data.note,
      totalBeforeTax: +data.total_before_tax,
      total: +data.total,
      itemLines: mapItem,
    };

    const res: DetailPurchaseResponse = {
      data: mapData,
    };

    return res;
  }

  async void(id: string, userId: string) {
    const data = await this._prisma.purchase.findFirst({
      where: {
        id: id,
      },
      include: {
        purchase_detail: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!data) {
      throw new HttpException(
        'data purchase not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.created_by != userId) {
      throw new HttpException(
        'your not own the purchase data',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data.status === 'void') {
      throw new HttpException('purchase already void', HttpStatus.BAD_REQUEST);
    }

    const productItem = data.purchase_detail.map((x) => {
      return {
        id: x.product_id,
        qty: x.qty,
        currentStock: x.product.stock,
      };
    });

    const updatePurchase = await this._prisma.purchase.update({
      where: {
        id: id,
      },
      data: {
        status: 'void',
      },
    });

    if (!updatePurchase) {
      throw new HttpException('void purchase failed', HttpStatus.BAD_REQUEST);
    }

    await Promise.all(
      productItem.map(async (x) => {
        await this._prisma.product.updateMany({
          where: {
            id: x.id,
          },
          data: {
            stock: x.currentStock - x.qty,
          },
        });
      }),
    );
    return {
      message: 'success void purchase',
    };
  }
}
