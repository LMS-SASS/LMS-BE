/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { MESSAGES } from "../../core/i18n/messages";
import { ApiResponse } from "../application/localized-text.interface";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers["x-request-id"] ?? request.requestId;
    const statusCode = context.switchToHttp().getResponse().statusCode;
    const code = statusCode === 201 ? 201 : 200;

    return next.handle().pipe(
      map((data) => ({
        code,
        title: MESSAGES[code]?.title ?? { en: "Success", ar: "نجاح" },
        description: MESSAGES[code]?.description ?? {
          en: "The request was successfully processed.",
          ar: "تم معالجة الطلب بنجاح",
        },
        requestId: requestId ?? "unknown",
        data: data ?? null,
      })),
    );
  }
}
