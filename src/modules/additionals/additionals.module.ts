import { Module } from "@nestjs/common";
import { AdditionalsService } from "./additionals.service";
import { AdditionalsController } from "./additionals.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AdditionalsController],
  providers: [AdditionalsService],
})
export class AdditionalsModule {}
