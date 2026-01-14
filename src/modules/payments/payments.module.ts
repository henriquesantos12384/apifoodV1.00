import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { CashRegistersModule } from "../cash-registers/cash-registers.module";

@Module({
  imports: [PrismaModule, CashRegistersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
