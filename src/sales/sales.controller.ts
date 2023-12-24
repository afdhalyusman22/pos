import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dto/sales.dto';
import { AuthGuard } from '../utils/auth-guard/auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private readonly purchaseService: SalesService) {}

  @Post()
  async create(@Body() createSalesDto: CreateSalesDto, @Request() req) {
    const userId = req.user.userId;
    return await this.purchaseService.create(createSalesDto, userId);
  }

  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId;
    return await this.purchaseService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return await this.purchaseService.findOne(id, userId);
  }

  @Put('/void/:id')
  async void(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return await this.purchaseService.void(id, userId);
  }
}
