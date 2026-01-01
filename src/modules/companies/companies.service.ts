import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

/**
 * CompaniesService
 *
 * Observações sobre o schema Prisma usadas aqui:
 * - Company tem `nameFantasy` e `cnpj` é obrigatório.
 * - User possui `fullName` e `companyId`.
 * - Relações são conectadas via nested inputs (e.g. `company: { connect: { id } }`).
 */
@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  // Cria uma nova company.
  // Body exemplo: { name, ownerId, slug?, status? }
  // Nota: `name` do DTO é mapeado para `nameFantasy` no schema Prisma.
  async create(createCompanyDto: CreateCompanyDto) {
    const slug =
      createCompanyDto.slug ||
      createCompanyDto.name.toLowerCase().replace(/ /g, "-");

    const existingCompany = await this.prisma.company.findUnique({
      where: { slug },
    });

    if (existingCompany) {
      throw new ConflictException("Company with this slug already exists");
    }

    // Verifica se o owner existe
    const owner = await this.prisma.user.findUnique({
      where: { id: createCompanyDto.ownerId },
    });

    if (!owner) {
      throw new NotFoundException(
        `Owner (User) with ID ${createCompanyDto.ownerId} not found`
      );
    }

    return this.prisma.company.create({
      data: {
        nameFantasy: createCompanyDto.name,
        slug: slug,
        status: createCompanyDto.status || "active",
        // Usa slug como fallback para cnpj em ambiente de teste
        cnpj: slug,
        createdBy: createCompanyDto.ownerId,
      },
    });
  }

  // Lista todas as companies ativas.
  // Retorna informações básicas do `creator` (id, fullName, email).
  // Usado por GET /companies
  findAll() {
    return this.prisma.company.findMany({
      where: {
        status: { not: "inactive" },
      },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  // Busca company por ID e inclui creator + users.
  // GET /companies/:id
  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true },
        },
        users: {
          select: { id: true, fullName: true, email: true, phone: true, isActive: true },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  // Busca company por slug. Inclui creator e users.
  // GET /companies/slug/:slug
  async findBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        creator: { select: { id: true, fullName: true, email: true } },
        users: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!company) throw new NotFoundException(`Company with slug ${slug} not found`);
    return company;
  }

  // Busca company por CNPJ.
  // GET /companies/cnpj/:cnpj
  async findByCnpj(cnpj: string) {
    const company = await this.prisma.company.findUnique({
      where: { cnpj },
      include: { creator: { select: { id: true, fullName: true, email: true } } },
    });

    if (!company) throw new NotFoundException(`Company with cnpj ${cnpj} not found`);
    return company;
  }

  // Lista usuários associados à company (via user.companyId)
  // GET /companies/:id/users
  async findUsers(companyId: string) {
    await this.findOne(companyId);
    return this.prisma.user.findMany({ where: { companyId }, select: { id: true, fullName: true, email: true, phone: true, isActive: true } });
  }

  // Associa/atribui um usuário à company (atualiza user.companyId).
  // POST /companies/:id/users
  async addUser(companyId: string, userId: string) {
    await this.findOne(companyId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return this.prisma.user.update({ where: { id: userId }, data: { company: { connect: { id: companyId } } } });
  }

  // Remove usuário da company: reatribui para company `_system` (necessário porque companyId é obrigatório)
  // DELETE /companies/:id/users/:userId
  async removeUser(companyId: string, userId: string) {
    await this.findOne(companyId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    // Reatribui o usuário para a company `_system` porque `disconnect` não é permitido quando a relação é obrigatória.
    const systemCompany = await this.prisma.company.findUnique({ where: { slug: "_system" } });
    if (!systemCompany) throw new NotFoundException(`System company with slug "_system" not found`);
    return this.prisma.user.update({
      where: { id: userId },
      data: { company: { connect: { id: systemCompany.id } } },
    });
  }

  // Atualiza o campo createdBy (owner) da company
  // PATCH /companies/:id/owner
  async changeOwner(companyId: string, ownerId: string) {
    await this.findOne(companyId);
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException(`User ${ownerId} not found`);
    return this.prisma.company.update({ where: { id: companyId }, data: { createdBy: ownerId } });
  }

  // Reativa a company (desfaz soft-delete)
  // POST /companies/:id/reactivate
  async reactivate(companyId: string) {
    await this.findOne(companyId);
    return this.prisma.company.update({ where: { id: companyId }, data: { status: "active", isActive: true } });
  }

  // Atualiza campos da company. ownerId (se enviado) é mapeado para createdBy.
  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id);

    const data: any = { ...updateCompanyDto };

    if (data.ownerId) {
      data.createdBy = data.ownerId;
      delete data.ownerId;
    }

    if (data.nicheIds) {
      delete data.nicheIds;
    }

    return this.prisma.company.update({
      where: { id },
      data: data,
    });
  }

  // Soft delete — marca a company como inactive
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: { status: "inactive" },
    });
  }
}
