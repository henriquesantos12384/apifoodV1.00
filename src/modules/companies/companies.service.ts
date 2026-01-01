import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

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

    // Verify if owner exists
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
        name: createCompanyDto.name,
        slug: slug,
        status: createCompanyDto.status || "active",
        createdBy: createCompanyDto.ownerId,
        niches: {
          create: createCompanyDto.nicheIds?.map((nicheId) => ({
            niche: { connect: { id: nicheId } },
          })),
        },
      },
      include: {
        niches: {
          include: {
            niche: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.company.findMany({
      where: {
        status: { not: "inactive" }, // Show active and blocked, hide inactive (deleted)
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        niches: {
          include: {
            niche: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        niches: {
          include: {
            niche: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id); // Check if exists

    const data: any = { ...updateCompanyDto };

    // If ownerId is provided, we map it to createdBy? Or maybe updatedBy?
    // Usually changing owner is a sensitive operation.
    // For now let's assume we can update basic fields.
    // If ownerId is passed in DTO, we might want to ignore it or handle it.
    // The DTO has ownerId. Let's map it to createdBy if we want to change ownership,
    // or maybe we should have a separate logic.
    // For simplicity of CRUD, I'll remove ownerId from update data if it's there,
    // or map it if the user really intends to change it.
    // Let's map it to createdBy for now if provided.

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

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    // Soft delete
    return this.prisma.company.update({
      where: { id },
      data: { status: "inactive" },
    });
  }
}
