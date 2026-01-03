import { Module } from "@nestjs/common";
import { PizzaBordersService } from "./pizza-borders.service";
import { PizzaBordersController } from "./pizza-borders.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PizzaBordersController],
  providers: [PizzaBordersService],
})
export class PizzaBordersModule {}
