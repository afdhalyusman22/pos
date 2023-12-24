import { Module } from '@nestjs/common';
import { SequenceService } from './sequence.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SequenceService],
})
export class SequenceModule {}
