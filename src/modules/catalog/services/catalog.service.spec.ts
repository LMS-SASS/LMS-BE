import { CatalogService } from "./catalog.service";
import { Book } from "../entities/book.entity";
import { GutendexResponseDto } from "../dto/gutendex-book.dto";

describe("CatalogService", () => {
  describe("importFromGutendex", () => {
    it("imports Gutendex results as tenant-scoped books", async () => {
      // Arrange
      const programId = "program-1";
      const branchId = "branch-1";
      const flush = jest.fn().mockResolvedValue(undefined);
      const em = {
        find: jest.fn().mockResolvedValue([]),
        persist: jest.fn().mockReturnValue({ flush }),
      };
      const eventEmitter = { emit: jest.fn() };
      const gutendexResponse: GutendexResponseDto = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 1342,
            title: "Pride and Prejudice",
            authors: [{ name: "Austen, Jane" }],
            subjects: ["Fiction"],
            languages: ["en"],
          },
        ],
      };
      const gutendexClient = {
        fetchBooks: jest.fn().mockResolvedValue(gutendexResponse),
      };
      const service = new CatalogService(
        em as any,
        eventEmitter as any,
        gutendexClient as any,
      );

      // Act
      const summary = await service.importFromGutendex(programId, branchId);

      // Assert
      expect(summary).toEqual({ imported: 1, skipped: 0 });
      const [persistedBooks] = em.persist.mock.calls[0] as [Book[]];
      expect(persistedBooks[0]).toMatchObject({
        title: "Pride and Prejudice",
        isbn: "GUT-1342",
        programId,
        branchId,
      });
    });
  });
});
