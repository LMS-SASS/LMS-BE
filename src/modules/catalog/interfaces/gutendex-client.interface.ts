import { GutendexResponseDto } from "../dto/gutendex-book.dto";

export const GUTENDEX_CLIENT = Symbol("GUTENDEX_CLIENT");

export interface IGutendexClient {
  fetchBooks(): Promise<GutendexResponseDto>;
}
