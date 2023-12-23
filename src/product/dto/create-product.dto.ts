import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  sku: string;
  @ApiProperty()
  itemName: string;
  @ApiProperty()
  uom: string;
  @ApiProperty()
  category: string;
  @ApiProperty()
  itemCost: number;
  @ApiProperty()
  itemPrice: number;
  @ApiProperty()
  taxId: string;
  @ApiProperty()
  stock: number;
}
