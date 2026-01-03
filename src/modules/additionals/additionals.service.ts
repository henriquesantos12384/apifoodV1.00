import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAdditionalDto } from "./dto/create-additional.dto";
import { UpdateAdditionalDto } from "./dto/update-additional.dto";

@Injectable()
export class AdditionalsService {
  constructor(private prisma: PrismaService) {}

  create(createAdditionalDto: CreateAdditionalDto) {
    return this.prisma.additional.create({
      data: createAdditionalDto,
    });
  }

  findAll(companyId: string) {
    return this.prisma.additional.findMany({
      where: { companyId },
      include: {
        category: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.additional.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  update(id: string, updateAdditionalDto: UpdateAdditionalDto) {
    return this.prisma.additional.update({
      where: { id },
      data: updateAdditionalDto,
    });
  }

  remove(id: string) {
    return this.prisma.additional.delete({
      where: { id },
    });
  }
}
