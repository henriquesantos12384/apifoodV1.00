import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePromotionDto } from "./dto/create-promotion.dto";
import { UpdatePromotionDto } from "./dto/update-promotion.dto";

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  create(createPromotionDto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: createPromotionDto,
    });
  }

  findAll(companyId: string) {
    return this.prisma.promotion.findMany({
      where: { companyId },
    });
  }

  findOne(id: string) {
    return this.prisma.promotion.findUnique({
      where: { id },
    });
  }

  update(id: string, updatePromotionDto: UpdatePromotionDto) {
    return this.prisma.promotion.update({
      where: { id },
      data: updatePromotionDto,
    });
  }

  remove(id: string) {
    return this.prisma.promotion.delete({
      where: { id },
    });
  }
}
