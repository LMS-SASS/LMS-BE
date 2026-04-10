/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { MESSAGES } from "../../core/i18n/messages";
import { BusinessException } from "./business.exception";
import { ApiResponse } from "../application/localized-text.interface";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId =
      (request.headers["x-request-id"] as string) ??
      (request as any).requestId ??
      "unknown";

    let apiResponse: ApiResponse<null>;

    if (exception instanceof BusinessException) {
      const errorCode = exception.errorCode;
      const body = exception.getResponse() as any;
      apiResponse = {
        code: errorCode,
        title: body.title,
        description: body.description,
        requestId,
        data: null,
      };
      response.status(exception.getStatus());
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const validationErrors =
        typeof exceptionResponse === "object" &&
        "message" in exceptionResponse &&
        Array.isArray((exceptionResponse as any).message)
          ? (exceptionResponse as any).message
          : undefined;

      apiResponse = {
        code: status,
        title: MESSAGES[status]?.title ?? { en: "Error", ar: "خطأ" },
        description: MESSAGES[status]?.description ?? {
          en: exception.message,
          ar: exception.message,
        },
        requestId,
        data: null,
      };

      if (validationErrors) {
        apiResponse.errors = validationErrors.map((msg: string) => ({
          field: "unknown",
          message: { en: msg, ar: msg },
        }));
      }

      response.status(status);
    } else {
      this.logger.error("Unhandled exception", exception);
      apiResponse = {
        code: 500,
        title: MESSAGES[500]?.title ?? {
          en: "Internal server error",
          ar: "خطأ في الخادم",
        },
        description: MESSAGES[500]?.description ?? {
          en: "An unexpected error occurred. Please contact support.",
          ar: "حدث خطأ غير متوقع. يرجى التواصل مع الدعم.",
        },
        requestId,
        data: null,
      };
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    response.json(apiResponse);
  }
}
