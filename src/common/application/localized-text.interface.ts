export interface LocalizedText {
  en: string;
  ar: string;
}

export interface ValidationError {
  field: string;
  message: LocalizedText;
}

export interface ApiResponse<T = any> {
  code: number;
  title: LocalizedText;
  description: LocalizedText;
  requestId: string;
  data: T | null;
  errors?: ValidationError[];
}

export interface PaginatedData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
