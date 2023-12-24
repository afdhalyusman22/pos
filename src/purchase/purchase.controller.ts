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
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/purchase.dto';
import { AuthGuard } from '../utils/auth-guard/auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('purchase')
@ApiBearerAuth()
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto, @Request() req) {
    const userId = req.user.userId;
    return await this.purchaseService.create(createPurchaseDto, userId);
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
