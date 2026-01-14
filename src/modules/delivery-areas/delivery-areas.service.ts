import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDeliveryAreaDto } from "./dto/create-delivery-area.dto";
import { UpdateDeliveryAreaDto } from "./dto/update-delivery-area.dto";

@Injectable()
export class DeliveryAreasService {
  constructor(private prisma: PrismaService) {}

  create(createDeliveryAreaDto: CreateDeliveryAreaDto) {
    return this.prisma.deliveryArea.create({
      data: createDeliveryAreaDto,
    });
  }

  findAll(companyId: string) {
    return this.prisma.deliveryArea.findMany({
      where: { companyId },
      orderBy: { neighborhood: "asc" },
    });
  }

  findOne(id: string) {
    return this.prisma.deliveryArea.findUnique({
      where: { id },
    });
  }

  update(id: string, updateDeliveryAreaDto: UpdateDeliveryAreaDto) {
    return this.prisma.deliveryArea.update({
      where: { id },
      data: updateDeliveryAreaDto,
    });
  }

  remove(id: string) {
    return this.prisma.deliveryArea.delete({
      where: { id },
    });
  }
}
