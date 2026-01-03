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
      throw new ConflictException("E-mail já está em uso");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Determine Role
    let roleId = dto.roleId;
    let roleName = "";

    if (!roleId) {
      // Default to 'admin' if not provided (assuming new signup is a store owner)
      const nameToFind = dto.role || "admin";
      const role = await this.prisma.role.findUnique({
        where: { name: nameToFind },
      });

      if (!role) {
        throw new ConflictException(`Perfil '${nameToFind}' não encontrado`);
      }
      roleId = role.id;
      roleName = role.name;
    } else {
      // Verify if roleId exists
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        throw new ConflictException(`ID do Perfil '${roleId}' não encontrado`);
      }
      roleName = role.name;
    }

    // 4. Create User
    // Note: We are NOT creating a company here anymore.
    // The user is created without a company (companyId is null).
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash: hashedPassword,
        isActive: true,
        roleId: roleId,
        companyId: undefined,
      } as any,
    });

    const payload = { sub: user.id, email: user.email, role: roleName };
    return {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: roleName,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        role: true,
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload = { sub: user.id, email: user.email, role: user.role?.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role?.name,
        companySlug: user.company?.slug,
      },
    };
  }
}
