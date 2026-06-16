import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ClientError } from "../utils/errors";

/**
 * Validates `req.body` against a Zod schema. On failure it forwards a 400
 * ClientError with the combined issue messages. On success it merges the parsed
 * (typed/clean) values back, preserving fields added by earlier middleware
 * (e.g. `userId` set by checkLogin).
 */
export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(", ");
      return next(new ClientError(message, 400));
    }
    req.body = { ...req.body, ...(result.data as Record<string, unknown>) };
    next();
  };
