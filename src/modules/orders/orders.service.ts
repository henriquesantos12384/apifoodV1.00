import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PrintersService } from "../printers/printers.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { AddOrderItemDto } from "./dto/add-order-item.dto";
import { AddOrderPizzaDto } from "./dto/add-order-pizza.dto";
import { randomBytes } from "crypto";

import { BatchOrderItemsDto } from "./dto/batch-order-items.dto";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private printersService: PrintersService
  ) {}

  async addBatch(orderId: string, dto: BatchOrderItemsDto) {
    const order = await this.findOne(orderId);
    if (!order) throw new BadRequestException("Order not found");

    if (order.status === "FINALIZADO" || order.status === "CANCELADO") {
      throw new BadRequestException("Order is closed");
    }

    // Process Standard Items
    for (const item of dto.items) {
      await this.addItem(orderId, item);
    }

    // Process Pizzas
    for (const pizza of dto.pizzas) {
      await this.addPizza(orderId, pizza);
    }

    // Optional Print
    if (dto.printAfter) {
      // Small artificial delay to ensure DB triggers
      await new Promise((r) => setTimeout(r, 500));
      // NEW: Pass explicit items to avoid printing history
      console.log(
        `[BatchPrint] Printing ONLY new items: Items=${dto.items?.length}, Pizzas=${dto.pizzas?.length}`
      );
      await this.printOrder(orderId, dto.items || [], dto.pizzas || []);
    }

    return this.findOne(orderId);
  }

  async startDelivery(orderId: string) {
    const order = await this.findOne(orderId);
    if (!order) throw new BadRequestException("Order not found");

    // Create tracking session
    // Generate a simple token (e.g. 16 hex chars)
    const token = randomBytes(16).toString("hex");

    // Create session (upsert to avoid Unique constraint if already exists from a retry)
    const session = await this.prisma.trackingSession.upsert({
      where: { orderId },
      create: {
        orderId,
        token,
        isActive: true,
      },
      update: {
        isActive: true,
      },
    });

    // Update status
    await this.updateStatus(orderId, "SAIU_PARA_ENTREGA");

    return { order, session };
  }

  async updateDriverLocation(orderId: string, lat: number, lng: number) {
    const session = await this.prisma.trackingSession.findUnique({
      where: { orderId },
    });

    if (session) {
      return this.prisma.trackingSession.update({
        where: { orderId },
        data: {
          currentLatitude: lat,
          currentLongitude: lng,
          lastUpdate: new Date(),
        },
      });
    }
    return null;
  }

  async getTrackingByToken(token: string) {
    const session = await this.prisma.trackingSession.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            customer: true,
            driver: true, // to show driver name/avatar?
          },
        },
      },
    });

    if (!session) throw new NotFoundException("Rastreio não encontrado");
    if (!session.isActive && session.order.status === "FINALIZADO") {
      // Optionally Handle expired
    }

    return session;
  }

  async create(createOrderDto: CreateOrderDto) {
    const {
      companyId,
      customerId,
      orderType,
      tableId,
      waiterId,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      items,
      pizzas,
      totalProducts,
      deliveryFee,
      discount,
      totalFinal,
    } = createOrderDto;

    // Build nested create data
    const itemsCreate =
      items && items.length > 0
        ? await Promise.all(
            items.map(async (it) => {
              const product = await this.prisma.product.findUnique({
                where: { id: it.productId },
              });
              if (!product)
                throw new BadRequestException(
                  "Produto inválido: " + it.productId
                );
              return {
                companyId,
                productId: it.productId,
                quantity: it.quantity,
                unitPrice: product.price,
                totalPrice: Number(product.price) * it.quantity,
              };
            })
          )
        : [];

    const pizzasCreate =
      pizzas && pizzas.length > 0
        ? await Promise.all(
            pizzas.map(async (p) => {
              // Validar Tamanho
              const size = await this.prisma.pizzaSize.findUnique({
                where: { id: p.sizeId },
              });
              if (!size) {
                throw new BadRequestException(
                  "Tamanho de pizza inválido: " + p.sizeId
                );
              }

              return {
                companyId,
                sizeId: p.sizeId,
                borderId: p.borderId || null,
                observation: p.notes, // Map DTO notes to Schema observation
                quantity: p.quantity,
                unitPrice: p.finalPrice,
                totalPrice: Number(p.finalPrice) * p.quantity,
                flavors: {
                  create: p.flavors.map((f) => ({
                    flavorId: f.flavorId,
                  })),
                },
              };
            })
          )
        : [];

    const order = await this.prisma.order.create({
      data: {
        companyId,
        customerId,
        orderType,
        tableId,
        waiterId,
        deliveryAddress,
        deliveryLatitude,
        deliveryLongitude,
        totalProducts: totalProducts || 0,
        deliveryFee: deliveryFee || 0,
        discount: discount || 0,
        totalFinal: totalFinal || 0,
        items: {
          create: itemsCreate,
        },
        pizzas: {
          create: pizzasCreate,
        },
      },
      include: {
        items: { include: { product: true } },
        pizzas: true,
      },
    });

    return order;
  }

  async addItem(orderId: string, dto: AddOrderItemDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException("Pedido não encontrado");

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new BadRequestException("Produto inválido");

    const created = await this.prisma.orderItem.create({
      data: {
        companyId: order.companyId,
        orderId,
        productId: dto.productId,
        quantity: dto.quantity,
        unitPrice: product.price,
        totalPrice: Number(product.price) * dto.quantity,
      },
      include: { product: true },
    });

    await this.recalculateOrderTotals(orderId);

    return created;
  }

  async addPizza(orderId: string, dto: AddOrderPizzaDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException("Pedido não encontrado");

    // validate size
    const size = await this.prisma.pizzaSize.findUnique({
      where: { id: dto.sizeId },
    });
    if (!size) throw new BadRequestException("Tamanho inválido");

    const created = await this.prisma.orderPizza.create({
      data: {
        companyId: order.companyId,
        orderId,
        sizeId: dto.sizeId,
        borderId: dto.borderId || null,
        observation: dto.observation,
        quantity: dto.quantity,
        unitPrice: dto.finalPrice,
        totalPrice: Number(dto.finalPrice) * dto.quantity,
        flavors: {
          create: dto.flavors.map((f) => ({
            flavorId: f.flavorId,
          })),
        },
      },
      include: {
        size: true,
        border: true,
        flavors: { include: { flavor: true } },
      },
    });

    await this.recalculateOrderTotals(orderId);

    return created;
  }

  async removeItem(itemId: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new BadRequestException("Item não encontrado");

    await this.prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Check if order is empty
    const order = await this.prisma.order.findUnique({
      where: { id: item.orderId },
      include: { items: true, pizzas: true },
    });

    if (order && order.items.length === 0 && order.pizzas.length === 0) {
      await this.prisma.order.delete({
        where: { id: item.orderId },
      });
      return null;
    }

    await this.recalculateOrderTotals(item.orderId);

    // Return the updated order
    return this.prisma.order.findUnique({
      where: { id: item.orderId },
      include: { items: { include: { product: true } }, pizzas: true },
    });
  }

  async updateItemNotes(itemId: string, notes: string) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new BadRequestException("Item não encontrado");

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { notes },
    });

    return this.prisma.order.findUnique({
      where: { id: item.orderId },
      include: { items: { include: { product: true } }, pizzas: true },
    });
  }

  private async recalculateOrderTotals(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, pizzas: true },
    });

    if (!order) return;

    const totalItems = order.items.reduce(
      (acc, item) => acc + Number(item.totalPrice),
      0
    );
    const totalPizzas = order.pizzas.reduce(
      (acc, pizza) => acc + Number(pizza.totalPrice),
      0
    );
    const totalProducts = totalItems + totalPizzas;

    // Recalculate final total (considering existing fee and discount)
    const totalFinal =
      totalProducts + Number(order.deliveryFee) - Number(order.discount);

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        totalProducts,
        totalFinal,
      },
    });
  }

  findByTable(tableId: string) {
    return this.prisma.order.findMany({
      where: { tableId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        pizzas: {
          include: {
            size: true,
            border: true,
            flavors: { include: { flavor: true } },
          },
        },
        customer: true,
        waiter: true,
      },
    });
  }

  findOpen(companyId: string) {
    return this.prisma.order.findMany({
      where: { companyId, status: { notIn: ["FINALIZADO", "CANCELADO"] } },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        pizzas: {
          include: {
            size: true,
            border: true,
            flavors: { include: { flavor: true } },
          },
        },
        customer: true,
        waiter: true,
      },
    });
  }

  findAll(companyId: string) {
    return this.prisma.order.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: { include: { product: true } },
        pizzas: {
          include: {
            size: true,
            border: true,
            flavors: { include: { flavor: true } },
          },
        },
        waiter: true,
        driver: true,
      },
    });
  }

  async assignDriver(orderId: string, driverId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException("Order not found");

    if (order.driverId) {
      throw new BadRequestException(
        "This order is already taken by another driver"
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { driverId },
    });
  }

  async releaseDriver(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      // @ts-ignore
      data: { driverId: null, status: "PRONTO_PARA_ENTREGA" },
    });
  }

  findDeliveryQueue(companyId: string) {
    return this.prisma.order.findMany({
      where: {
        companyId,
        // @ts-ignore - Status values depend on skipped generation
        status: "PRONTO_PARA_ENTREGA",
        driverId: null,
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        pizzas: {
          include: {
            size: true,
            border: true,
            flavors: { include: { flavor: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  findDriverOrders(driverId: string) {
    return this.prisma.order.findMany({
      where: {
        driverId,
        // @ts-ignore
        status: { in: ["PRONTO_PARA_ENTREGA", "SAIU_PARA_ENTREGA"] },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        pizzas: {
          include: {
            size: true,
            border: true,
            flavors: { include: { flavor: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        pizzas: {
          include: {
            size: true,
            border: true,
            flavors: { include: { flavor: true } },
          },
        },
        table: true,
        waiter: true,
      },
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    // Cast to any to satisfy Prisma generated types; controller validation still runs.
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto as any,
    });
  }

  async updateStatus(id: string, status: any) {
    if (
      status === "ENTREGUE" ||
      status === "FINALIZADO" ||
      status === "CANCELADO"
    ) {
      try {
        // Close tracking session if exists
        await this.prisma.trackingSession.update({
          where: { orderId: id },
          data: { isActive: false },
        });
      } catch (e) {
        // ignore
      }
    }
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }

  async printOrder(id: string, newItems?: any[], newPizzas?: any[]) {
    const order = await this.findOne(id);
    if (!order) throw new BadRequestException("Order not found");

    const printers = await this.prisma.printer.findMany({
      where: {
        companyId: order.companyId,
        isActive: true,
      },
    });

    let targetPrinters = printers;

    if (printers.length === 0) {
      console.warn(
        `[OrderPrint] No active printers found for company ${order.companyId}. Checking inactive...`
      );
      // Fallback: Try to find ANY printer for this company
      const anyPrinters = await this.prisma.printer.findMany({
        where: { companyId: order.companyId },
      });

      if (anyPrinters.length > 0) {
        console.warn(
          `[OrderPrint] Found ${anyPrinters.length} inactive printers. Using them as fallback.`
        );
        targetPrinters = anyPrinters;
      } else {
        return {
          printed: false,
          reason: "No printers found (active or inactive)",
        };
      }
    }

    console.log(
      `[OrderPrint] Found ${targetPrinters.length} printers. Starting print job...`
    );

    const line = "-".repeat(32);
    let text = "";
    text += line + "\n";

    // Custom Header based on Order Type
    if (order.orderType === "DELIVERY") {
      text += "******** DELIVERY ********\n";
      const customerName = order.customer?.name
        ? order.customer.name.toUpperCase().substring(0, 20)
        : "NAO IDENTIFICADO";
      text += `CLIENTE: ${customerName}\n`;

      if (order.customer?.phone) {
        text += `TEL: ${order.customer.phone}\n`;
      }
      // if (order.deliveryAddress) {
      //    text += `END: ${order.deliveryAddress.substring(0, 25)}\n`;
      // }
    } else {
      // Standard Waiter/Table Header
      text += `MESA: ${order.table?.tableNumber || "BALCAO"}\n`;
      text += `GARÇOM: ${order.waiter?.fullName?.toUpperCase() || "N/A"}\n`;
    }

    text += `PEDIDO: #${order.id.slice(0, 4).toUpperCase()}\n`;
    text += `DATA: ${new Date().toLocaleString("pt-BR")}\n`;
    text += line + "\n";

    // --- LOGIC CHANGE: Print only NEW items or FALLBACK to existing items (for reprint) ---
    // Note: newItems comes from DTO, so we need to fetch Product Names manually if using DTO directly.
    // However, for simplicity/speed in this context, we will filter `order.items` by ID or just accept DTO.
    // BUT: DTO only has ID. We need names.
    // Strategy: If newItems provided, we will match them with the FETCHED order items (which have names)
    // based on created_at or simply print EVERYTHING if no filter provided.

    // A nicer approach for "Kitchen Ticket": It lists partials.
    // If newItems/newPizzas are passed, we print ONLY them.

    let itemsToPrint = order.items;
    let pizzasToPrint = order.pizzas;

    // Check if we received explicit lists (even if empty, which means nothing to print for that category)
    // If undefined, it means "print everything" (legacy/manual call).
    // If array (empty or not), it means "partial print".
    const isPartialPrint = Array.isArray(newItems) || Array.isArray(newPizzas);

    if (isPartialPrint) {
      text += "--- ADICIONAL / PARCIAL ---\n";

      if (newItems && newItems.length > 0) {
        // Take the last N standard items
        // items are ordered by createdAt desc in findMany, but here findUnique -> include items.
        // We sort by createdAt ASCENDING to slice correctly from the end.
        const sortedItems = [...order.items].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
        const lastN = sortedItems.slice(-newItems.length);
        itemsToPrint = lastN;
      } else {
        itemsToPrint = [];
      }

      if (newPizzas && newPizzas.length > 0) {
        const sortedPizzas = [...order.pizzas].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
        const lastN = sortedPizzas.slice(-newPizzas.length);
        pizzasToPrint = lastN;
      } else {
        pizzasToPrint = [];
      }
    } else {
      text += "--- CONFERÊNCIA GERAL ---\n";
    }

    if (itemsToPrint) {
      itemsToPrint.forEach((item) => {
        text += `${item.quantity}x ${item.product.name}\n`;
        if (item.notes) text += `   [${item.notes}]\n`;
      });
    }

    if (pizzasToPrint) {
      pizzasToPrint.forEach((pizza) => {
        text += `${pizza.quantity}x PIZZA ${pizza.size?.name || "Tamanho Desconhecido"}\n`;
        const flavorNames = pizza.flavors.map((f) => f.flavor.name).join("/");
        text += `   Sabores: ${flavorNames}\n`;
        if (pizza.border) text += `   Borda: ${pizza.border.name}\n`;
        if (pizza.observation) text += `   [${pizza.observation}]\n`;
      });
    }

    text += line + "\n\n\n\n";

    await Promise.all(
      targetPrinters.map((p) => this.printersService.printText(p.id, text))
    );

    return { printed: true, printers: targetPrinters.length };
  }
}
