import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../utils/auth-guard/auth-guard';

@UseGuards(AuthGuard)
@ApiTags('product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(200)
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    const userId = req.user.userId;
    return await this.productService.create(createProductDto, userId);
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return await this.productService.find(id, userId);
  }

  @Get()
  @HttpCode(200)
  async findAll(@Request() req) {
    const userId = req.user.userId;
    return await this.productService.findAll(userId);
  }

  @Post(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return await this.productService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return await this.productService.remove(id, userId);
  }
}
