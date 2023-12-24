import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpdateProductDto } from './update-product.dto';
import { IsOptional } from 'class-validator';

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
