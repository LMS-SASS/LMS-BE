import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

export interface TenantContext {
  programId?: string;
  branchId?: string;
  userId?: string;
}

declare module "express" {
  interface Request {
    tenant?: TenantContext;
    requestId?: string;
  }
}

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    // Generate request ID for tracing
    req.requestId =
      (req.headers["x-request-id"] as string) ?? crypto.randomUUID();

    // Extract tenant context from JWT claims (set by auth guard)
    // In Phase 1, this is populated after auth middleware processes the token
    req.tenant = {
      programId: req.headers["x-program-id"] as string,
      branchId: req.headers["x-branch-id"] as string,
    };

    next();
  }
}
