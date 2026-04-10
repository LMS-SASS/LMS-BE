import { EntitySchema } from "@mikro-orm/core";
import { TenantEntity } from "../../../common/domain/base.entity";

export class Book extends TenantEntity {
  title!: string;
  isbn!: string;
  author!: string;
  subject!: string;
  publisher!: string;
  publicationYear!: number;
  language!: string;
  callNumber!: string;
  description?: string;
}

export const BookSchema = new EntitySchema<Book>({
  class: Book,
  tableName: "books",
  properties: {
    id: { type: "uuid", primary: true, defaultRaw: "gen_random_uuid()" },
    programId: { type: "uuid", index: true },
    branchId: { type: "uuid", index: true },
    title: { type: "string", length: 500 },
    isbn: { type: "string", length: 20 },
    author: { type: "string", length: 255 },
    subject: { type: "string", length: 255 },
    publisher: { type: "string", length: 255 },
    publicationYear: { type: "number" },
    language: { type: "string", length: 10, default: "ar" },
    callNumber: { type: "string", length: 50 },
    description: { type: "string", nullable: true },
    createdAt: { type: "Date", onCreate: () => new Date() },
    updatedAt: {
      type: "Date",
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
    },
  },
  indexes: [
    { properties: ["programId", "isbn"] },
    { properties: ["programId", "title"] },
  ],
});
