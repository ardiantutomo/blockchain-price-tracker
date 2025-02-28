import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PriceRepository {
  private prisma = new PrismaClient();

  async findPricesSinceYesterday(chain: string) {
    const prices = await this.prisma.price.findMany({
      where: {
        chain,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prices;
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
