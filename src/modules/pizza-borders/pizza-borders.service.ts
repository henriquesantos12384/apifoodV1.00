import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePizzaBorderDto } from "./dto/create-pizza-border.dto";
import { UpdatePizzaBorderDto } from "./dto/update-pizza-border.dto";

@Injectable()
export class PizzaBordersService {
  constructor(private prisma: PrismaService) {}

  async create(createPizzaBorderDto: CreatePizzaBorderDto) {
    const { companyId, name, isDefault, isActive, isMenu, sizePrices } =
      createPizzaBorderDto;

    // 1. Create the border
    const rows: any[] = await this.prisma.$queryRaw`
      INSERT INTO "pizza_borders" (
        id, company_id, name, is_default, is_active, is_menu, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 
        ${companyId}::uuid, 
        ${name}, 
        ${isDefault ?? false}, 
        ${isActive ?? true}, 
        ${isMenu ?? true},
        NOW(), 
        NOW()
      )
      RETURNING 
        id, 
        company_id as "companyId", 
        name, 
        is_default as "isDefault", 
        is_active as "isActive", 
        is_menu as "isMenu",
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `;
    const border = rows[0];

    // 2. Create size prices if provided
    if (sizePrices && sizePrices.length > 0) {
      for (const sp of sizePrices) {
        await this.prisma.$queryRaw`
          INSERT INTO "border_size_prices" (
            id, company_id, border_id, size_id, price, is_menu, is_active, created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            ${companyId}::uuid,
            ${border.id}::uuid,
            ${sp.sizeId}::uuid,
            ${sp.price},
            true, -- Default isMenu to true
            true, -- Default isActive to true
            NOW(),
            NOW()
          )
        `;
      }
    }

    return border;
  }

  async findAll(companyId: string) {
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    try {
      const query = await this.prisma.$queryRaw`
        SELECT 
          b.id, 
          b.company_id as "companyId", 
          b.name, 
          b.is_default as "isDefault", 
          b.is_active as "isActive", 
          b.is_menu as "isMenu",
          b.created_at as "createdAt", 
          b.updated_at as "updatedAt",
          (
            SELECT json_agg(json_build_object(
              'sizeId', bsp.size_id,
              'price', bsp.price
            ))
            FROM "border_size_prices" bsp
            WHERE bsp.border_id = b.id
          ) as "sizePrices"
        FROM "pizza_borders" b
        WHERE b.company_id = ${companyId}::uuid
      `;
      return query;
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }

  async findOne(id: string) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT 
        b.id, 
        b.company_id as "companyId", 
        b.name, 
        b.is_default as "isDefault", 
        b.is_active as "isActive", 
        b.is_menu as "isMenu",
        b.created_at as "createdAt", 
        b.updated_at as "updatedAt",
        (
          SELECT json_agg(json_build_object(
            'sizeId', bsp.size_id,
            'price', bsp.price
          ))
          FROM "border_size_prices" bsp
          WHERE bsp.border_id = b.id
        ) as "sizePrices"
      FROM "pizza_borders" b
      WHERE b.id = ${id}::uuid
    `;
    return rows[0];
  }

  async update(id: string, updatePizzaBorderDto: UpdatePizzaBorderDto) {
    const { name, isDefault, isActive, isMenu, sizePrices } =
      updatePizzaBorderDto;

    // Build dynamic update query
    const updates: Prisma.Sql[] = [];
    if (name !== undefined) updates.push(Prisma.sql`name = ${name}`);
    if (isDefault !== undefined)
      updates.push(Prisma.sql`is_default = ${isDefault}`);
    if (isActive !== undefined)
      updates.push(Prisma.sql`is_active = ${isActive}`);
    if (isMenu !== undefined) updates.push(Prisma.sql`is_menu = ${isMenu}`);
    updates.push(Prisma.sql`updated_at = NOW()`);

    let border;
    if (updates.length > 1) {
      const rows: any[] = await this.prisma.$queryRaw`
        UPDATE "pizza_borders"
        SET ${Prisma.join(updates, ", ")}
        WHERE id = ${id}::uuid
        RETURNING 
          id, 
          company_id as "companyId", 
          name, 
          is_default as "isDefault", 
          is_active as "isActive", 
          is_menu as "isMenu",
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
      border = rows[0];
    } else {
      border = await this.findOne(id);
    }

    // Update size prices if provided
    if (sizePrices) {
      // First delete existing prices for this border
      await this.prisma.$queryRaw`
        DELETE FROM "border_size_prices"
        WHERE border_id = ${id}::uuid
      `;

      // Then insert new ones
      for (const sp of sizePrices) {
        await this.prisma.$queryRaw`
          INSERT INTO "border_size_prices" (
            id, company_id, border_id, size_id, price, is_menu, is_active, created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            ${border.companyId}::uuid,
            ${id}::uuid,
            ${sp.sizeId}::uuid,
            ${sp.price},
            true,
            true,
            NOW(),
            NOW()
          )
        `;
      }
    }

    return border;
  }

  async remove(id: string) {
    const rows: any[] = await this.prisma.$queryRaw`
      DELETE FROM "pizza_borders"
      WHERE id = ${id}::uuid
      RETURNING id
    `;
    return rows[0];
  }
}
