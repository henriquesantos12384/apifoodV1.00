import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePizzaSizeDto } from "./dto/create-pizza-size.dto";
import { UpdatePizzaSizeDto } from "./dto/update-pizza-size.dto";

@Injectable()
export class PizzaSizesService {
  constructor(private prisma: PrismaService) {}

  create(createPizzaSizeDto: CreatePizzaSizeDto) {
    return this.prisma.pizzaSize.create({
      data: createPizzaSizeDto,
    });
  }

  findAll(companyId: string) {
    return this.prisma.pizzaSize.findMany({
      where: { companyId },
      include: {
        flavorPrices: true,
        borderPrices: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.pizzaSize.findUnique({
      where: { id },
      include: {
        flavorPrices: true,
        borderPrices: true,
      },
    });
  }

  update(id: string, updatePizzaSizeDto: UpdatePizzaSizeDto) {
    return this.prisma.pizzaSize.update({
      where: { id },
      data: updatePizzaSizeDto,
    });
  }

  remove(id: string) {
    return this.prisma.pizzaSize.delete({
      where: { id },
    });
  }
}
