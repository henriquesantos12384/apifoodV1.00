import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CompaniesModule } from "./modules/companies/companies.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ProductsModule } from "./modules/products/products.module";
import { AdditionalsModule } from "./modules/additionals/additionals.module";
import { PizzaSizesModule } from "./modules/pizza-sizes/pizza-sizes.module";
import { PizzaFlavorsModule } from "./modules/pizza-flavors/pizza-flavors.module";
import { PizzaBordersModule } from "./modules/pizza-borders/pizza-borders.module";
import { PromotionsModule } from "./modules/promotions/promotions.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { SupabaseModule } from "./common/supabase/supabase.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    ProductsModule,
    AdditionalsModule,
    PizzaSizesModule,
    PizzaFlavorsModule,
    PizzaBordersModule,
    PromotionsModule,
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
