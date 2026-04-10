import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CatalogController } from "./controllers/catalog.controller";
import { CatalogService } from "./services/catalog.service";
import { BookSchema } from "./entities/book.entity";

@Module({
  imports: [MikroOrmModule.forFeature([BookSchema])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
