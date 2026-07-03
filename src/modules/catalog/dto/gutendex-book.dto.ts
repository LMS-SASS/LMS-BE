export interface GutendexAuthorDto {
  name: string;
}

export interface GutendexBookDto {
  id: number;
  title: string;
  authors: GutendexAuthorDto[];
  subjects: string[];
  languages: string[];
}

export interface GutendexResponseDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBookDto[];
}
