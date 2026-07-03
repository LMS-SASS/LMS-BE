import { of, throwError } from "rxjs";
import { AxiosResponse } from "axios";
import { GutendexClient } from "./gutendex.client";
import { GutendexResponseDto } from "../dto/gutendex-book.dto";
import { BusinessException } from "../../../common/presentation/business.exception";

describe("GutendexClient", () => {
  let client: GutendexClient;
  let httpService: { get: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(() => {
    httpService = { get: jest.fn() };
    configService = { get: jest.fn().mockReturnValue("https://gutendex.com") };
    client = new GutendexClient(httpService as any, configService as any);
  });

  describe("fetchBooks", () => {
    it("returns the parsed response body on a successful request", async () => {
      const responseBody: GutendexResponseDto = {
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
      httpService.get.mockReturnValue(
        of({ data: responseBody } as AxiosResponse<GutendexResponseDto>),
      );

      const result = await client.fetchBooks();

      expect(result).toEqual(responseBody);
    });

    it("requests the books endpoint under the configured base URL", async () => {
      httpService.get.mockReturnValue(
        of({
          data: { count: 0, next: null, previous: null, results: [] },
        } as AxiosResponse<GutendexResponseDto>),
      );

      await client.fetchBooks();

      expect(httpService.get).toHaveBeenCalledWith(
        "https://gutendex.com/books/",
      );
    });

    it("throws a BusinessException when the request fails", async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error("network error")),
      );

      await expect(client.fetchBooks()).rejects.toBeInstanceOf(
        BusinessException,
      );
    });

    it("uses catalog error code 6002 when the request fails", async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error("network error")),
      );

      await expect(client.fetchBooks()).rejects.toMatchObject({
        errorCode: 6002,
      });
    });
  });
});
