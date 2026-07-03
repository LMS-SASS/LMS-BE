import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { IGutendexClient } from "../interfaces/gutendex-client.interface";
import { GutendexResponseDto } from "../dto/gutendex-book.dto";
import { BusinessException } from "../../../common/presentation/business.exception";

@Injectable()
export class GutendexClient implements IGutendexClient {
  private readonly logger = new Logger(GutendexClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchBooks(): Promise<GutendexResponseDto> {
    const baseUrl = this.configService.get<string>("GUTENDEX_BASE_URL");

    try {
      const response = await firstValueFrom(
        this.httpService.get<GutendexResponseDto>(`${baseUrl}/books/`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch books from Gutendex: ${error}`);
      throw new BusinessException(6002);
    }
  }
}
