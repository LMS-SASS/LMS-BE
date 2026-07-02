import { Inject, Injectable, Logger } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Book } from "../entities/book.entity";
import { CreateBookDto } from "../dto/create-book.dto";
import { BusinessException } from "../../../common/presentation/business.exception";
import { PaginatedData } from "../../../common/application/localized-text.interface";
import { PaginationDto } from "../../../common/application/pagination.dto";
import { GUTENDEX_CLIENT } from "../interfaces/gutendex-client.interface";
import type { IGutendexClient } from "../interfaces/gutendex-client.interface";
import { GutendexBookDto } from "../dto/gutendex-book.dto";

// Gutendex has no publication year field; 0 is a sentinel meaning "unknown"
// rather than defaulting to the import date, which would misrepresent the data.
const UNKNOWN_PUBLICATION_YEAR = 0;

export interface ImportSummary {
  imported: number;
  skipped: number;
}

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
    @Inject(GUTENDEX_CLIENT)
    private readonly gutendexClient: IGutendexClient,
  ) {}

  async createBook(
    dto: CreateBookDto,
    programId: string,
    branchId: string,
  ): Promise<Book> {
    // Check for duplicate ISBN within program
    const existing = await this.em.findOne(Book, {
      isbn: dto.isbn,
      programId,
    });
    if (existing) {
      throw new BusinessException(6001);
    }

    const book = new Book();
    Object.assign(book, {
      ...dto,
      programId,
      branchId,
    });

    await this.em.persist(book).flush();

    this.eventEmitter.emit("book.created", {
      bookId: book.id,
      programId,
      branchId,
    });

    this.logger.log(`Book created: ${book.id} (${book.title})`);
    return book;
  }

  async findById(id: string): Promise<Book> {
    const book = await this.em.findOne(Book, { id });
    if (!book) {
      throw new BusinessException(4001);
    }
    return book;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedData<Book>> {
    const { page, size } = pagination;
    const offset = (page - 1) * size;

    const [items, totalElements] = await this.em.findAndCount(
      Book,
      {},
      {
        limit: size,
        offset,
        orderBy: { createdAt: "DESC" },
      },
    );

    const totalPages = Math.ceil(totalElements / size);

    return {
      content: items,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page >= totalPages,
      empty: items.length === 0,
    };
  }

  // POC: persistence-free passthrough — fetches Gutendex results without
  // touching the database, so it works even when no Postgres is available.
  async fetchGutendexBooks(): Promise<GutendexBookDto[]> {
    return (await this.gutendexClient.fetchBooks()).results;
  }

  async importFromGutendex(
    programId: string,
    branchId: string,
  ): Promise<ImportSummary> {
    const { results } = await this.gutendexClient.fetchBooks();
    const existingIsbns = await this.findExistingIsbns(programId, results);

    let skipped = 0;
    const importedBooks: Book[] = [];

    for (const result of results) {
      const isbn = this.toIsbn(result.id);
      if (existingIsbns.has(isbn)) {
        skipped++;
        continue;
      }

      importedBooks.push(this.mapToBook(result, programId, branchId));
      existingIsbns.add(isbn);
    }

    await this.em.persist(importedBooks).flush();

    for (const book of importedBooks) {
      this.eventEmitter.emit("book.created", {
        bookId: book.id,
        programId,
        branchId,
      });
    }

    this.logger.log(
      `Gutendex import complete: ${importedBooks.length} imported, ${skipped} skipped`,
    );

    return { imported: importedBooks.length, skipped };
  }

  private async findExistingIsbns(
    programId: string,
    results: GutendexBookDto[],
  ): Promise<Set<string>> {
    const candidateIsbns = results.map((result) => this.toIsbn(result.id));
    const existing = await this.em.find(Book, {
      isbn: { $in: candidateIsbns },
      programId,
    });
    return new Set(existing.map((book) => book.isbn));
  }

  private mapToBook(
    result: GutendexBookDto,
    programId: string,
    branchId: string,
  ): Book {
    const isbn = this.toIsbn(result.id);
    const book = new Book();
    Object.assign(book, {
      title: result.title,
      isbn,
      author: result.authors[0]?.name ?? "Unknown",
      subject: result.subjects[0] ?? "General",
      publisher: "Project Gutenberg",
      publicationYear: UNKNOWN_PUBLICATION_YEAR,
      language: result.languages[0] ?? "en",
      callNumber: isbn,
      programId,
      branchId,
    });
    return book;
  }

  private toIsbn(gutendexId: number): string {
    return `GUT-${gutendexId}`;
  }
}
