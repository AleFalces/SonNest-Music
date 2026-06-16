import { NextFunction, Request, Response } from "express";
import { checkUserExists } from "../services/user.service";
import { ClientError } from "../utils/errors";

// Field validation is handled by the register Zod schema; this only checks the
// database invariant (email must be unique).
const validateUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  if (await checkUserExists(email))
    return next(new ClientError("User already exists", 400));
  next();
};

export default validateUserExists;
