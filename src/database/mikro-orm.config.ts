import { defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { SeedManager } from "@mikro-orm/seeder";

export default defineConfig({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME ?? "thoth",
  user: process.env.DB_USER ?? "thoth",
  password: process.env.DB_PASSWORD ?? "thoth",
  entities: ["./dist/**/*.entity.js"],
  entitiesTs: ["./src/**/*.entity.ts"],
  migrations: {
    path: "./dist/database/migrations",
    pathTs: "./src/database/migrations",
  },
  seeder: {
    path: "./dist/database/seeders",
    pathTs: "./src/database/seeders",
  },
  extensions: [Migrator, SeedManager],
  debug: process.env.NODE_ENV === "development",
  filters: {
    tenant: {
      cond: (args: { programId: string }) => ({
        programId: args.programId,
      }),
      default: true,
    },
  },
});
