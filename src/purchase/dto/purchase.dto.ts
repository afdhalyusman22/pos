import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from '../../product/dto/product.dto';

export class CreatePurchaseDto {
  @ApiProperty()
  invoiceNo: string;
  @ApiProperty()
  invoiceDate: string;
  @ApiProperty()
  note: string;
  @ApiProperty()
  itemLines: ProductItemDto[];
}

export class ProductItemDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  qty: number;
}

export class ProductItemResponseDto extends PartialType(CreateProductDto) {
  id: string;
  qty: number;
}

export class PurchaseResponseDto extends PartialType(CreatePurchaseDto) {
  id: string;
  totalBeforeTax: number;
  total: number;
  itemLines: ProductItemResponseDto[];
}

export class CreatePurchaseResponse {
  data: PurchaseResponseDto;
}

export class DetailPurchaseResponse {
  data: PurchaseResponseDto;
}

export class AllPurchaseResponse {
  data: PurchaseResponseDto[];
}
