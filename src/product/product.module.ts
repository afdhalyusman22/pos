import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SequenceService } from '../sequence/sequence.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [SequenceService, ProductService],
})
export class ProductModule {}
