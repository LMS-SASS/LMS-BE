import { HttpException, HttpStatus } from "@nestjs/common";
import { MESSAGES } from "../../core/i18n/messages";

export class BusinessException extends HttpException {
  public readonly errorCode: number;

  constructor(errorCode: number, httpStatus?: HttpStatus) {
    const message = MESSAGES[errorCode];
    const status = httpStatus ?? BusinessException.resolveHttpStatus(errorCode);

    super(
      {
        code: errorCode,
        title: message?.title ?? { en: "Error", ar: "خطأ" },
        description: message?.description ?? {
          en: "An unexpected error occurred.",
          ar: "حدث خطأ غير متوقع.",
        },
      },
      status,
    );

    this.errorCode = errorCode;
  }

  private static resolveHttpStatus(code: number): HttpStatus {
    if (code >= 1000 && code < 2000) return HttpStatus.UNAUTHORIZED;
    if (code >= 2000 && code < 3000) return HttpStatus.FORBIDDEN;
    if (code >= 3000 && code < 4000) return HttpStatus.UNPROCESSABLE_ENTITY;
    if (code >= 4000 && code < 5000) return HttpStatus.NOT_FOUND;
    if (code >= 5000 && code < 7000) return HttpStatus.CONFLICT;
    if (code >= 9000) return HttpStatus.INTERNAL_SERVER_ERROR;
    return HttpStatus.BAD_REQUEST;
  }
}
