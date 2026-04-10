import { Injectable, Logger } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Book } from "../entities/book.entity";
import { CreateBookDto } from "../dto/create-book.dto";
import { BusinessException } from "../../../common/presentation/business.exception";
import { PaginatedData } from "../../../common/application/localized-text.interface";
import { PaginationDto } from "../../../common/application/pagination.dto";

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
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
}
