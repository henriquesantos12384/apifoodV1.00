import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePizzaFlavorDto } from "./dto/create-pizza-flavor.dto";
import { UpdatePizzaFlavorDto } from "./dto/update-pizza-flavor.dto";

@Injectable()
export class PizzaFlavorsService {
  constructor(private prisma: PrismaService) {}

  async create(createPizzaFlavorDto: CreatePizzaFlavorDto) {
    const {
      companyId,
      name,
      description,
      type,
      isMenu,
      isActive,
      sizePrices,
      categoryId,
      imageUrl,
    } = createPizzaFlavorDto;

    // 1. Create the flavor
    let rows: any[];
    if (!categoryId || categoryId === "") {
      rows = await this.prisma.$queryRaw`
        INSERT INTO "pizza_flavors" (
          id, company_id, category_id, name, description, type, is_menu, is_active, image_url, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${companyId}::uuid,
          ${null},
          ${name},
          ${description || null},
          ${type || null},
          ${isMenu ?? true},
          ${isActive ?? true},
          ${imageUrl || null},
          NOW(),
          NOW()
        )
        RETURNING 
          id, 
          company_id as "companyId", 
          category_id as "categoryId",
          type, 
          name, 
          description, 
          is_menu as "isMenu", 
          is_active as "isActive", 
          image_url as "imageUrl",
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
    } else {
      rows = await this.prisma.$queryRaw`
        INSERT INTO "pizza_flavors" (
          id, company_id, category_id, name, description, type, is_menu, is_active, image_url, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${companyId}::uuid,
          ${categoryId}::uuid,
          ${name},
          ${description || null},
          ${type || null},
          ${isMenu ?? true},
          ${isActive ?? true},
          ${imageUrl || null},
          NOW(),
          NOW()
        )
        RETURNING 
          id, 
          company_id as "companyId", 
          category_id as "categoryId",
          type, 
          name, 
          description, 
          is_menu as "isMenu", 
          is_active as "isActive", 
          image_url as "imageUrl",
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
    }
    const flavor = rows[0];

    // 2. Create size prices if provided
    if (sizePrices && sizePrices.length > 0) {
      for (const sp of sizePrices) {
        await this.prisma.$queryRaw`
          INSERT INTO "flavor_size_prices" (
            id, company_id, flavor_id, size_id, price, created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            ${companyId}::uuid,
            ${flavor.id}::uuid,
            ${sp.sizeId}::uuid,
            ${sp.price},
            NOW(),
            NOW()
          )
        `;
      }
    }

    return flavor;
  }

  async findAll(companyId: string, type?: string) {
    console.log("findAll called with:", { companyId, type });

    if (!companyId) {
      throw new Error("Company ID is required");
    }

    try {
      let query;
      if (type) {
        console.log("Executing query with type filter");
        query = await this.prisma.$queryRaw`
          SELECT 
            f.id, 
            f.company_id as "companyId", 
            f.category_id as "categoryId",
            f.type, 
            f.name, 
            f.description, 
            f.is_menu as "isMenu", 
            f.is_active as "isActive", 
            f.image_url as "imageUrl",
            f.created_at as "createdAt", 
            f.updated_at as "updatedAt",
            (
              SELECT json_agg(json_build_object(
                'sizeId', fsp.size_id,
                'price', fsp.price
              ))
              FROM "flavor_size_prices" fsp
              WHERE fsp.flavor_id = f.id
            ) as "sizePrices"
          FROM "pizza_flavors" f
          WHERE f.company_id = ${companyId}::uuid
          AND f.type = ${type}
        `;
      } else {
        console.log("Executing query without type filter");
        query = await this.prisma.$queryRaw`
          SELECT 
            f.id, 
            f.company_id as "companyId", 
            f.category_id as "categoryId",
            f.type, 
            f.name, 
            f.description, 
            f.is_menu as "isMenu", 
            f.is_active as "isActive", 
            f.image_url as "imageUrl",
            f.created_at as "createdAt", 
            f.updated_at as "updatedAt",
            (
              SELECT json_agg(json_build_object(
                'sizeId', fsp.size_id,
                'price', fsp.price
              ))
              FROM "flavor_size_prices" fsp
              WHERE fsp.flavor_id = f.id
            ) as "sizePrices"
          FROM "pizza_flavors" f
          WHERE f.company_id = ${companyId}::uuid
        `;
      }
      return query;
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }

  async findOne(id: string) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT 
        f.id, 
        f.company_id as "companyId", 
        f.category_id as "categoryId",
        f.type, 
        f.name, 
        f.description, 
        f.is_menu as "isMenu", 
        f.is_active as "isActive", 
        f.image_url as "imageUrl",
        f.created_at as "createdAt", 
        f.updated_at as "updatedAt",
        (
          SELECT json_agg(json_build_object(
            'sizeId', fsp.size_id,
            'price', fsp.price
          ))
          FROM "flavor_size_prices" fsp
          WHERE fsp.flavor_id = f.id
        ) as "sizePrices"
      FROM "pizza_flavors" f
      WHERE f.id = ${id}::uuid
    `;
    return rows[0];
  }

  async update(id: string, updatePizzaFlavorDto: UpdatePizzaFlavorDto) {
    const {
      name,
      description,
      type,
      isMenu,
      isActive,
      sizePrices,
      categoryId,
      imageUrl,
    } = updatePizzaFlavorDto;

    // Build dynamic update query
    const updates: Prisma.Sql[] = [];
    if (name !== undefined) updates.push(Prisma.sql`name = ${name}`);
    if (description !== undefined)
      updates.push(Prisma.sql`description = ${description}`);
    if (type !== undefined) updates.push(Prisma.sql`type = ${type}`);
    if (isMenu !== undefined) updates.push(Prisma.sql`is_menu = ${isMenu}`);
    if (isActive !== undefined)
      updates.push(Prisma.sql`is_active = ${isActive}`);
    if (categoryId !== undefined) {
      if (categoryId === null || categoryId === "") {
        updates.push(Prisma.sql`category_id = null`);
      } else {
        updates.push(Prisma.sql`category_id = ${categoryId}::uuid`);
      }
    }
    if (imageUrl !== undefined)
      updates.push(Prisma.sql`image_url = ${imageUrl}`);
    updates.push(Prisma.sql`updated_at = NOW()`);

    let flavor;
    if (updates.length > 1) {
      // > 1 because updated_at is always there
      const rows: any[] = await this.prisma.$queryRaw`
        UPDATE "pizza_flavors"
        SET ${Prisma.join(updates, ", ")}
        WHERE id = ${id}::uuid
        RETURNING 
          id, 
          company_id as "companyId", 
          type, 
          name, 
          description, 
          is_menu as "isMenu", 
          is_active as "isActive", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
      flavor = rows[0];
    } else {
      flavor = await this.findOne(id);
    }

    // Update size prices if provided
    if (sizePrices) {
      // First delete existing prices for this flavor
      await this.prisma.$queryRaw`
        DELETE FROM "flavor_size_prices"
        WHERE flavor_id = ${id}::uuid
      `;

      // Then insert new ones
      for (const sp of sizePrices) {
        await this.prisma.$queryRaw`
          INSERT INTO "flavor_size_prices" (
            id, company_id, flavor_id, size_id, price, created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            ${flavor.companyId}::uuid,
            ${id}::uuid,
            ${sp.sizeId}::uuid,
            ${sp.price},
            NOW(),
            NOW()
          )
        `;
      }
    }

    return flavor;
  }

  async remove(id: string) {
    const rows: any[] = await this.prisma.$queryRaw`
      DELETE FROM "pizza_flavors"
      WHERE id = ${id}::uuid
      RETURNING id
    `;
    return rows[0];
  }
}
