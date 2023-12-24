import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SequenceService {
  _prisma: PrismaService;
  constructor(private prisma: PrismaService) {
    this._prisma = prisma;
  }
  async generate(type: string): Promise<string> {
    const date = new Date();
    let latest_seq = 0;
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
    const seq = await this._prisma.sequence.findFirst({
      where: {
        type: type,
        times: dateStr,
      },
    });
    if (seq) {
      const update = await this._prisma.sequence.update({
        where: {
          id: seq.id,
        },
        data: {
          latest_seq: seq.latest_seq + 1,
        },
      });
      latest_seq = update.latest_seq;
    } else {
      const insert = await this._prisma.sequence.create({
        data: {
          latest_seq: 1,
          times: dateStr,
          type: type,
        },
      });
      latest_seq = insert.latest_seq;
    }
    const genStr = `${type}${dateStr}${latest_seq}`;
    return genStr;
  }
}
