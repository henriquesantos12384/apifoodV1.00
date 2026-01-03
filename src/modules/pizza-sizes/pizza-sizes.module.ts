import { Module } from "@nestjs/common";
import { PizzaSizesService } from "./pizza-sizes.service";
import { PizzaSizesController } from "./pizza-sizes.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PizzaSizesController],
  providers: [PizzaSizesService],
})
export class PizzaSizesModule {}
