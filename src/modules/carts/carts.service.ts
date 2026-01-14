import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async findByTable(tableId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { tableId },
      include: {
        items: { include: { product: true } },
        pizzas: {
          include: {
            size: true,
            border: true,
            flavors: { include: { flavor: true } },
          },
        },
      },
    });

    return cart;
  }

  async getOrCreateCart(companyId: string, tableId: string) {
    let cart = await this.findByTable(tableId);

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          companyId,
          tableId,
        },
        include: {
          items: { include: { product: true } },
          pizzas: {
            include: {
              size: true,
              border: true,
              flavors: { include: { flavor: true } },
            },
          },
        },
      });
    }
    return cart;
  }

  async addItem(tableId: string, companyId: string, dto: any) {
    const cart = await this.getOrCreateCart(companyId, tableId);

    // Check if item already exists (optional, strictly speaking we usually just add another line or increment qty)
    // For simplicity, let's create a new line if it has notes, or update qty if identical.

    // For now, simpler approach: Always create new line or user handles logic?
    // Let's implement simple "Add"
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        notes: dto.notes,
      },
      include: { product: true },
    });
  }

  async addPizza(tableId: string, companyId: string, dto: any) {
    const cart = await this.getOrCreateCart(companyId, tableId);

    // 1. Calculate Price
    let finalPrice = 0;

    // Get Flavor Prices for this Size
    const flavorPrices = await this.prisma.flavorSizePrice.findMany({
      where: {
        sizeId: dto.sizeId,
        flavorId: { in: dto.flavorIds },
      },
    });

    // Strategy: Highest Price (common)
    if (flavorPrices.length > 0) {
      const prices = flavorPrices.map((fp) => Number(fp.price));
      finalPrice = Math.max(...prices);
    }

    // Get Border Price
    if (dto.borderId) {
      const borderPrice = await this.prisma.borderSizePrice.findUnique({
        where: {
          borderId_sizeId: {
            borderId: dto.borderId,
            sizeId: dto.sizeId,
          },
        },
      });
      if (borderPrice) {
        finalPrice += Number(borderPrice.price);
      }
    }

    // Fallback: If no flavor prices found (maybe fixed price size?), try to get from Size?
    // Usually Size has base slices, but price is in matrix. If matrix empty, maybe 0?
    // Let's assume matrix is populated.

    // Create Cart Pizza
    return this.prisma.cartPizza.create({
      data: {
        cartId: cart.id,
        sizeId: dto.sizeId,
        borderId: dto.borderId || null,
        quantity: dto.quantity,
        observation: dto.observation,
        unitPrice: finalPrice,
        flavors: {
          create: dto.flavorIds.map((flavorId: string) => ({
            flavorId,
          })),
        },
      },
      include: {
        size: true,
        border: true,
        flavors: { include: { flavor: true } },
      },
    });
  }

  async removeItem(itemId: string) {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async removePizza(pizzaId: string) {
    return this.prisma.cartPizza.delete({ where: { id: pizzaId } });
  }

  async clearCart(tableId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { tableId } });
    if (cart) {
      // Prisma cascade delete handles items if configured, but explicit delete is safer sometimes
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await this.prisma.cartPizza.deleteMany({ where: { cartId: cart.id } });
    }
    return { success: true };
  }
}
