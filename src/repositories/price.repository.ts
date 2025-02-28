import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PriceRepository {
  private prisma = new PrismaClient();

  async findHourlyPrices(chain: string) {
    return this.prisma.price.findMany({
      where: { chain },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });
  }

  async findLatestPrice(chain: string) {
    return this.prisma.price.findFirst({
      where: { chain },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPrice(chain: string, price: number) {
    return this.prisma.price.create({
      data: { chain, price },
    });
  }
}
