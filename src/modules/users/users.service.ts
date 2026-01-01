import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

/**
 * UsersService
 *
 * Responsável pelo CRUD de usuários.
 * - User possui `fullName`, `email` (único), `passwordHash`.
 * - Pode ter `roleId` e `companyId` opcionais.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Cria um novo usuário.
  // Verifica se e-mail já existe e faz hash da senha.
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("E-mail já está em uso");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createData: any = {
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      isActive: true,
    };

    if (createUserDto.roleId) {
      createData.roleId = createUserDto.roleId;
    }

    if (createUserDto.companyId) {
      createData.companyId = createUserDto.companyId;
    }

    return this.prisma.user.create({
      data: createData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: { select: { name: true } },
        company: { select: { nameFantasy: true } },
        isActive: true,
        createdAt: true,
      },
    });
  }

  // Lista todos os usuários.
  // Inclui nome da role e nome fantasia da company.
  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: { select: { name: true } },
        company: { select: { nameFantasy: true } },
        isActive: true,
        createdAt: true,
      },
    });
  }

  // Busca usuário por ID.
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: { select: { name: true } },
        company: { select: { nameFantasy: true } },
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  // Atualiza usuário.
  // Se senha for enviada, faz novo hash.
  // Se e-mail for alterado, verifica unicidade.
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const data: any = { ...updateUserDto };

    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictException("E-mail já está em uso");
      }
    }

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.companyId !== undefined) updateData.companyId = data.companyId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: { select: { name: true } },
        company: { select: { nameFantasy: true } },
        isActive: true,
        updatedAt: true,
      },
    });
  }

  // Remove usuário (Hard Delete).
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
