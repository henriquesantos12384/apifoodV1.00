import { Module } from "@nestjs/common";
import { CashRegistersService } from "./cash-registers.service";
import { CashRegistersController } from "./cash-registers.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [CashRegistersController],
  providers: [CashRegistersService],
  exports: [CashRegistersService],
})
export class CashRegistersModule {}
