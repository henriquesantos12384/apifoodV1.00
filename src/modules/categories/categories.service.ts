import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  findAll(companyId: string) {
    return this.prisma.category.findMany({
      where: { companyId },
      orderBy: { displayOrder: "asc" },
      include: {
        products: { where: { isActive: true } },
        additionals: true,
        pizzaFlavors: {
          where: { isActive: true },
          include: { sizePrices: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        additionals: true,
        // pizzaFlavors: true, // Removed as PizzaFlavor no longer has a category relation
      },
    });
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
