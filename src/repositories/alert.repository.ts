import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AlertRepository {
  private prisma = new PrismaClient();

  async createAlert(chain: string, price: number, email: string) {
    return this.prisma.alert.create({
      data: { chain, price, email },
    });
  }

  async findActiveAlerts() {
    return this.prisma.alert.findMany({ where: { active: true } });
  }

  async updateAlertStatus(id: string, active: boolean) {
    return this.prisma.alert.update({
      where: { id },
      data: { active },
    });
  }
}
