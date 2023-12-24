import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SequenceService } from '../sequence/sequence.service';

@Module({
  imports: [PrismaModule],
  controllers: [PurchaseController],
  providers: [SequenceService, PurchaseService],
})
export class PurchaseModule {}
