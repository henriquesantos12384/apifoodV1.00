import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { AddOrderItemDto } from "./dto/add-order-item.dto";
import { AddOrderPizzaDto } from "./dto/add-order-pizza.dto";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const {
      companyId,
      customerId,
      waiterId,
      deliverymanId,
      orderType,
      tableId,
      deliveryAddress,
      paymentMethod,
      items,
      pizzas,
      totalProducts,
      deliveryFee,
      discount,
      totalFinal,
    } = createOrderDto;

    // Build nested create data
    const itemsCreate = await Promise.all(
      items.map(async (it) => {
        const product = await this.prisma.product.findUnique({
          where: { id: it.productId },
        });
        if (!product) throw new BadRequestException("Produto inválido: " + it.productId);
        return {
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: product.price,
          notes: it.notes,
        };
      })
    );

    const pizzasCreate = pizzas.map((p) => ({
      sizeId: p.sizeId,
      borderId: p.borderId,
      quantity: p.quantity,
      finalPrice: p.finalPrice,
      notes: p.notes,
      flavors: {
        create: p.flavors.map((f) => ({ flavorId: f.flavorId })),
      },
    }));

    const order = await this.prisma.order.create({
      data: {
        companyId,
        customerId,
        waiterId,
        deliverymanId,
        orderType,
        tableId,
        deliveryAddress,
        paymentMethod,
        totalProducts,
        deliveryFee,
        discount,
        totalFinal,
        items: {
          create: itemsCreate,
        },
        pizzas: {
          create: pizzasCreate,
        },
      },
      include: {
        items: { include: { product: true, addons: { include: { additional: true } } } },
        pizzas: { include: { flavors: { include: { flavor: true } }, border: true, size: true } },
      },
    });

    return order;
  }

  async addItem(orderId: string, dto: AddOrderItemDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new BadRequestException('Produto inválido');

    const created = await this.prisma.orderItem.create({
      data: {
        orderId,
        productId: dto.productId,
        quantity: dto.quantity,
        unitPrice: product.price,
        notes: dto.notes,
      },
      include: { product: true, addons: { include: { additional: true } } },
    });

    // If addons provided, create them
    if (dto.addons && dto.addons.length) {
      for (const a of dto.addons) {
        const additional = await this.prisma.additional.findUnique({ where: { id: a.additionalId } });
        if (!additional) throw new BadRequestException('Adicional inválido: ' + a.additionalId);
        await this.prisma.orderItemAdditional.create({
          data: { orderItemId: created.id, additionalId: a.additionalId, price: additional.price },
        });
      }
    }

    return this.prisma.orderItem.findUnique({ where: { id: created.id }, include: { product: true, addons: { include: { additional: true } } } });
  }

  async addPizza(orderId: string, dto: AddOrderPizzaDto) {
    // validate size
    const size = await this.prisma.pizzaSize.findUnique({ where: { id: dto.sizeId } });
    if (!size) throw new BadRequestException('Tamanho inválido');

    if (dto.borderId) {
      const border = await this.prisma.pizzaBorder.findUnique({ where: { id: dto.borderId } });
      if (!border) throw new BadRequestException('Borda inválida');
    }

    const created = await this.prisma.orderPizza.create({
      data: {
        orderId,
        sizeId: dto.sizeId,
        borderId: dto.borderId,
        quantity: dto.quantity,
        finalPrice: dto.finalPrice,
        notes: dto.notes,
        flavors: { create: dto.flavors.map((f) => ({ flavorId: f.flavorId })) },
      },
      include: { flavors: { include: { flavor: true } }, border: true, size: true },
    });

    return created;
  }

  async addItemAddon(orderItemId: string, additionalId: string) {
    const additional = await this.prisma.additional.findUnique({ where: { id: additionalId } });
    if (!additional) throw new BadRequestException('Adicional inválido');

    const created = await this.prisma.orderItemAdditional.create({
      data: { orderItemId, additionalId, price: additional.price },
      include: { additional: true },
    });

    return created;
  }

  findByTable(tableId: string) {
    return this.prisma.order.findMany({
      where: { tableId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, pizzas: true, customer: true },
    });
  }

  findOpen(companyId: string) {
    return this.prisma.order.findMany({
      where: { companyId, status: { notIn: ['CONCLUIDO', 'CANCELADO'] } },
      orderBy: { createdAt: 'desc' },
      include: { items: true, pizzas: true, customer: true },
    });
  }

  findAll(companyId: string) {
    return this.prisma.order.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        waiter: true,
        deliveryman: true,
        items: { include: { product: true, addons: { include: { additional: true } } } },
        pizzas: { include: { flavors: { include: { flavor: true } }, border: true, size: true } },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        waiter: true,
        deliveryman: true,
        items: { include: { product: true, addons: { include: { additional: true } } } },
        pizzas: { include: { flavors: { include: { flavor: true } }, border: true, size: true } },
      },
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    // Cast to any to satisfy Prisma generated types; controller validation still runs.
    return this.prisma.order.update({ where: { id }, data: updateOrderDto as any });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }
}
