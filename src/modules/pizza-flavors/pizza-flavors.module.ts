import { Module } from "@nestjs/common";
import { PizzaFlavorsService } from "./pizza-flavors.service";
import { PizzaFlavorsController } from "./pizza-flavors.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PizzaFlavorsController],
  providers: [PizzaFlavorsService],
})
export class PizzaFlavorsModule {}
