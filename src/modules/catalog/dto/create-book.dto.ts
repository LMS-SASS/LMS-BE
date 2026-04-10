import {
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBookDto {
  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  title!: string;

  @ApiProperty({ maxLength: 20 })
  @IsString()
  @MaxLength(20)
  isbn!: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  author!: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  subject!: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  publisher!: string;

  @ApiProperty()
  @IsNumber()
  @Min(1000)
  @Max(2100)
  publicationYear!: number;

  @ApiPropertyOptional({ default: "ar", maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string = "ar";

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @MaxLength(50)
  callNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
