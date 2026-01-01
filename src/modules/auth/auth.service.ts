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

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Determine Role
    // Default to 'admin' if not provided (assuming new signup is a store owner)
    const roleName = dto.role || "admin";

    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new ConflictException(`Role '${roleName}' not found`);
    }

    // 4. Create User
    // Note: We are NOT creating a company here anymore.
    // The user is created without a company (companyId is null).
    const user = await this.prisma.user.create({
      data: {
        fullName: dto.name,
        email: dto.email,
        passwordHash: hashedPassword,
        isActive: true,
        roleId: role.id,
      },
    });

    const payload = { sub: user.id, email: user.email, role: role.name };
    return {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: role.name,
      },
      accessToken: this.jwtService.sign(payload),
    };
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
      user: { id: user.id, name: user.fullName, email: user.email },
    };
  }
}
