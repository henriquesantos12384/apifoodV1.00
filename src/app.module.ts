import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { NichesModule } from "./modules/niches/niches.module";
import { CompaniesModule } from "./modules/companies/companies.module";

@Module({
  imports: [PrismaModule, AuthModule, NichesModule, CompaniesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
