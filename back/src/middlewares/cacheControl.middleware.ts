import { Request, Response, NextFunction } from "express";

// Sets a public Cache-Control header so browsers (and any intermediary cache)
// can reuse a GET response for `seconds` before refetching. Use a long TTL on
// near-static data (categories) and a short one where freshness matters (products).
export const cacheControl =
  (seconds: number) =>
  (_req: Request, res: Response, next: NextFunction): void => {
    res.set("Cache-Control", `public, max-age=${seconds}`);
    next();
  };
