import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import type { Request } from "express";
import { CatalogService } from "../services/catalog.service";
import { CreateBookDto } from "../dto/create-book.dto";
import { PaginationDto } from "../../../common/application/pagination.dto";

@ApiTags("Catalog")
@Controller("api/v1/catalog/books")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @ApiOperation({ summary: "Create a new book in the catalog" })
  async create(@Body() dto: CreateBookDto, @Req() req: Request) {
    return this.catalogService.createBook(
      dto,
      req.tenant!.programId!,
      req.tenant!.branchId!,
    );
  }

  @Post("import")
  @ApiOperation({ summary: "Import books from the Gutendex catalog" })
  async importFromGutendex(@Req() req: Request) {
    return this.catalogService.importFromGutendex(
      req.tenant!.programId!,
      req.tenant!.branchId!,
    );
  }

  @Get()
  @ApiOperation({ summary: "List books with pagination" })
  async findAll(@Query() pagination: PaginationDto) {
    return this.catalogService.findAll(pagination);
  }

  @Get("gutendex")
  @ApiOperation({
    summary: "Fetch books from Gutendex without persisting them",
  })
  async fetchGutendexBooks() {
    return this.catalogService.fetchGutendexBooks();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a book by ID" })
  async findOne(@Param("id") id: string) {
    return this.catalogService.findById(id);
  }
}
