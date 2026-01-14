import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCashRegisterDto } from "./dto/create-cash-register.dto";
import { CloseCashRegisterDto } from "./dto/close-cash-register.dto";

@Injectable()
export class CashRegistersService {
  constructor(private prisma: PrismaService) {}

  async open(createCashRegisterDto: CreateCashRegisterDto) {
    const { companyId, openingAmount, openedBy } = createCashRegisterDto;

    // Check if there is already an open register for this company
    const openRegister = await this.prisma.cashRegister.findFirst({
      where: {
        companyId,
        status: "OPEN",
      },
    });

    if (openRegister) {
      throw new BadRequestException(
        "Já existe um caixa aberto para esta empresa."
      );
    }

    return this.prisma.cashRegister.create({
      data: {
        companyId,
        openingAmount,
        openedBy,
        status: "OPEN",
        openedAt: new Date(),
      },
    });
  }

  async close(id: string, closeCashRegisterDto: CloseCashRegisterDto) {
    const { closingAmount, closedBy } = closeCashRegisterDto;

    const register = await this.prisma.cashRegister.findUnique({
      where: { id },
    });

    if (!register) {
      throw new NotFoundException("Caixa não encontrado.");
    }

    if (register.status === "CLOSED") {
      throw new BadRequestException("Este caixa já está fechado.");
    }

    return this.prisma.cashRegister.update({
      where: { id },
      data: {
        status: "CLOSED",
        closingAmount,
        closedBy,
        closedAt: new Date(),
      },
    });
  }

  async findOpen(companyId: string) {
    return this.prisma.cashRegister.findFirst({
      where: {
        companyId,
        status: "OPEN",
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.cashRegister.findMany({
      where: { companyId },
      orderBy: { openedAt: "desc" },
    });
  }

  async findOne(id: string) {
    const register = await this.prisma.cashRegister.findUnique({
      where: { id },
      include: {
        payments: {
          include: {
            order: true,
            user: true,
          },
        },
      },
    });

    if (!register) {
      throw new NotFoundException("Caixa não encontrado.");
    }

    return register;
  }
}
