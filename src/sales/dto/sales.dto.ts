import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from '../../product/dto/product.dto';

export class CreateSalesDto {
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

export class SalesResponseDto extends PartialType(CreateSalesDto) {
  id: string;
  totalBeforeTax: number;
  total: number;
  itemLines: ProductItemResponseDto[];
}

export class CreateSalesResponse {
  data: SalesResponseDto;
}

export class DetailSalesResponse {
  data: SalesResponseDto;
}

export class AllSalesResponse {
  data: SalesResponseDto[];
}
