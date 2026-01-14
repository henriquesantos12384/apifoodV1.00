import { Module } from "@nestjs/common";
import { DeliveryAreasService } from "./delivery-areas.service";
import { DeliveryAreasController } from "./delivery-areas.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryAreasController],
  providers: [DeliveryAreasService],
})
export class DeliveryAreasModule {}
