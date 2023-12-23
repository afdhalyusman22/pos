import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

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
