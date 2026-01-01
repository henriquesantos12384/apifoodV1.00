import { Module } from "@nestjs/common";
import { NichesService } from "./niches.service";
import { NichesController } from "./niches.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [NichesController],
  providers: [NichesService],
})
export class NichesModule {}
