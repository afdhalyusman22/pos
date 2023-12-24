import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SequenceService } from '../sequence/sequence.service';

@Module({
  imports: [PrismaModule],
  controllers: [SalesController],
  providers: [SequenceService, SalesService],
})
export class SalesModule {}
