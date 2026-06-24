import { NextFunction, Request, Response } from "express";
import { IMPORT_API_KEY } from "../config/envs";
import checkLogin from "./checkLogin.middleware";
import isAdmin from "./isAdmin.middleware";

/**
 * Dual auth for the bulk import: a machine (e.g. n8n) authenticates with a valid
 * "x-api-key", otherwise we fall back to the admin JWT (checkLogin + isAdmin).
 * Tags the request source for auditing without branching the import logic.
 */
const bulkImportAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"];
  if (IMPORT_API_KEY && apiKey === IMPORT_API_KEY) {
    req.body.importSource = "machine";
    return next();
  }

  checkLogin(req, res, (loginErr?: unknown) => {
    if (loginErr) return next(loginErr);
    isAdmin(req, res, (adminErr?: unknown) => {
      if (adminErr) return next(adminErr);
      req.body.importSource = "admin";
      next();
    });
  });
};

export default bulkImportAuth;
