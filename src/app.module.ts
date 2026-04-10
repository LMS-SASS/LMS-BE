import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CoreModule } from "./core/core.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import mikroOrmConfig from "./database/mikro-orm.config";

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    CoreModule,
    CatalogModule,
    // Add more modules here as they are built:
    // CirculationModule,
    // PatronModule,
    // InventoryModule,
    // OrganizationModule,
    // DiscoveryModule,
    // ReportingModule,
  ],
})
export class AppModule {}
