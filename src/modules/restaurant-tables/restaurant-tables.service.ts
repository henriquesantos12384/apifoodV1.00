import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRestaurantTableDto } from "./dto/create-restaurant-table.dto";
import { UpdateRestaurantTableDto } from "./dto/update-restaurant-table.dto";

@Injectable()
export class RestaurantTablesService {
  constructor(private prisma: PrismaService) {}

  async create(createRestaurantTableDto: CreateRestaurantTableDto) {
    const { companyId, tableNumber } = createRestaurantTableDto;

    const existingTable = await this.prisma.restaurantTable.findUnique({
      where: {
        companyId_tableNumber: {
          companyId,
          tableNumber,
        },
      },
    });

    if (existingTable) {
      throw new ConflictException(
        `Table number ${tableNumber} already exists for this company.`
      );
    }

    return this.prisma.restaurantTable.create({
      data: createRestaurantTableDto,
    });
  }

  async findAll(companyId: string) {
    const tables = await this.prisma.restaurantTable.findMany({
      where: { companyId },
      orderBy: { tableNumber: "asc" },
      include: {
        orders: {
          where: {
            status: {
              in: ["PENDENTE", "EM_PREPARO", "PRONTO"],
            },
          },
          select: {
            id: true,
            status: true,
            waiter: { select: { fullName: true } },
          },
        },
      },
    });

    return tables.map((table) => {
      const { orders, ...rest } = table;
      const activeOrder = orders.length > 0 ? orders[0] : null;
      return {
        ...rest,
        isOccupied: !!activeOrder,
        currentOrderId: activeOrder?.id || null,
        waiterName: activeOrder?.waiter?.fullName || null,
      };
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.restaurantTable.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: {
              in: ["PENDENTE", "EM_PREPARO", "PRONTO"],
            },
          },
          select: {
            id: true,
            status: true,
            waiter: { select: { fullName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    const { orders, ...rest } = table;
    const activeOrder = orders.length > 0 ? orders[0] : null;

    return {
      ...rest,
      isOccupied: !!activeOrder,
      currentOrderId: activeOrder?.id || null,
      waiterName: activeOrder?.waiter?.fullName || null,
    };
  }

  async update(id: string, updateRestaurantTableDto: UpdateRestaurantTableDto) {
    const table = await this.findOne(id);

    if (
      updateRestaurantTableDto.tableNumber &&
      updateRestaurantTableDto.tableNumber !== table.tableNumber
    ) {
      const existingTable = await this.prisma.restaurantTable.findUnique({
        where: {
          companyId_tableNumber: {
            companyId: table.companyId,
            tableNumber: updateRestaurantTableDto.tableNumber,
          },
        },
      });

      if (existingTable) {
        throw new ConflictException(
          `Table number ${updateRestaurantTableDto.tableNumber} already exists.`
        );
      }
    }

    return this.prisma.restaurantTable.update({
      where: { id },
      data: updateRestaurantTableDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.restaurantTable.delete({
      where: { id },
    });
  }
}
