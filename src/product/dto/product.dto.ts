import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  itemName: string;
  @ApiProperty()
  @IsNotEmpty()
  uom: string;
  @ApiProperty()
  @IsNotEmpty()
  category: string;
  @ApiProperty()
  @IsNotEmpty()
  itemCost: number;
  @ApiProperty()
  @IsNotEmpty()
  itemPrice: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  taxId: string;
}

export class CreateProductDto extends PartialType(UpdateProductDto) {
  @ApiProperty()
  @IsOptional()
  sku: string;
}

export class ProductResponse extends PartialType(UpdateProductDto) {
  id: string;
  sku: string;
}

export class ProductResponseDto {
  data: ProductResponse;
}
export class ProductAllResponseDto {
  data: ProductResponse[];
}
