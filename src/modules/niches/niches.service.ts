import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateNicheDto } from "./dto/create-niche.dto";
import { UpdateNicheDto } from "./dto/update-niche.dto";

@Injectable()
export class NichesService {
  constructor(private prisma: PrismaService) {}

  async create(createNicheDto: CreateNicheDto) {
    const slug =
      createNicheDto.slug ||
      createNicheDto.name.toLowerCase().replace(/ /g, "-");

    const existingNiche = await this.prisma.niche.findFirst({
      where: { slug },
    });

    if (existingNiche) {
      throw new ConflictException("Niche with this slug already exists");
    }

    return this.prisma.niche.create({
      data: {
        name: createNicheDto.name,
        slug: slug,
        status: createNicheDto.status || "active",
      },
    });
  }

  findAll() {
    return this.prisma.niche.findMany({
      where: {
        status: "active", // By default, maybe only show active ones? Or all?
        // Let's show all for now, or maybe filter in controller.
        // Usually "soft delete" means we filter out inactive by default unless requested.
        // But for a master admin view, maybe we want to see all.
        // Let's return all for now, user can filter on frontend or we can add query params later.
      },
    });
  }

  async findOne(id: string) {
    const niche = await this.prisma.niche.findUnique({
      where: { id },
    });

    if (!niche) {
      throw new NotFoundException(`Niche with ID ${id} not found`);
    }

    return niche;
  }

  async update(id: string, updateNicheDto: UpdateNicheDto) {
    await this.findOne(id); // Check if exists

    // If updating name but not slug, should we update slug?
    // Usually better to keep slug stable unless explicitly changed.

    return this.prisma.niche.update({
      where: { id },
      data: updateNicheDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    // Soft delete: change status to 'inactive'
    return this.prisma.niche.update({
      where: { id },
      data: { status: "inactive" },
    });
  }
}
