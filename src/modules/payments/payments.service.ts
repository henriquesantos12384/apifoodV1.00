import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { CashRegistersService } from "../cash-registers/cash-registers.service";

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private cashRegistersService: CashRegistersService
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { companyId, orderId, method, amount, receivedBy } = createPaymentDto;

    // 1. Validate Order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException("Pedido não encontrado.");

    // 2. Validate Cash Register (Must be OPEN)
    const openRegister = await this.cashRegistersService.findOpen(companyId);
    if (!openRegister) {
      throw new BadRequestException(
        "Não há caixa aberto para registrar pagamentos."
      );
    }

    // 3. Create Payment
    const payment = await this.prisma.payment.create({
      data: {
        companyId,
        orderId,
        cashRegisterId: openRegister.id,
        method,
        amount,
        receivedBy,
      },
    });

    return payment;
  }

  async findByOrder(orderId: string) {
    return this.prisma.payment.findMany({
      where: { orderId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }
}
