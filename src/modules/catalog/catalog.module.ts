import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { HttpModule } from "@nestjs/axios";
import {
  CatalogController,
  CatalogAuthorsController,
} from "./controllers/catalog.controller";
import { CatalogService } from "./services/catalog.service";
import { BookSchema } from "./entities/book.entity";
import { GutendexClient } from "./adapters/gutendex.client";
import { GUTENDEX_CLIENT } from "./interfaces/gutendex-client.interface";

@Module({
  imports: [MikroOrmModule.forFeature([BookSchema]), HttpModule],
  controllers: [CatalogController, CatalogAuthorsController],
  providers: [
    CatalogService,
    { provide: GUTENDEX_CLIENT, useClass: GutendexClient },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
