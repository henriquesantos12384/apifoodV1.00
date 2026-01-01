import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Company } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signup(dto: SignupDto) {
    // 1. Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    // 2. Check if company slug exists (if provided)
    let slug: string | null = null;
    if (dto.companyName) {
      slug =
        dto.companySlug || dto.companyName.toLowerCase().replace(/ /g, "-");
      const existingCompany = await this.prisma.company.findUnique({
        where: { slug },
      });

      if (existingCompany) {
        throw new ConflictException("Company slug already in use");
      }
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 4. Transaction to create User, and optionally Company
    return this.prisma.$transaction(async (tx) => {
      // Lógica para MASTER do SaaS (Você)
      if (dto.role === "master") {
        const user = await tx.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            passwordHash: hashedPassword,
            status: "active",
            role: "master", // Global Role
          },
        });

        // Master não cria empresa no cadastro e não entra em company_users
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          company: null,
          accessToken: this.jwtService.sign(payload),
        };
      }

      // Lógica para Clientes (Donos de Pizzaria/Hamburgueria)
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash: hashedPassword,
          status: "active",
          role: "user", // Global Role comum
        },
      });

      let company: Company | null = null;

      if (dto.companyName && slug) {
        // Create Company
        company = await tx.company.create({
          data: {
            name: dto.companyName,
            slug: slug,
            status: "active",
            createdBy: user.id,
          },
        });

        // O dono da pizzaria recebe o cargo de 'admin' (Tenant Admin), não 'master'
        const adminRole = await tx.role.findFirst({
          where: { name: "admin" },
        });

        if (!adminRole) {
          throw new Error("Admin role not found. Please seed roles.");
        }

        // Link User to Company as Admin
        await tx.companyUser.create({
          data: {
            companyId: company.id,
            userId: user.id,
            roleId: adminRole.id,
            status: "active",
          },
        });
      }

      // Generate Token
      const payload = { sub: user.id, email: user.email, role: user.role };
      const token = this.jwtService.sign(payload);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        company: company
          ? { id: company.id, name: company.name, slug: company.slug }
          : null,
        accessToken: token,
      };
    });
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
