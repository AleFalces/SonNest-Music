import { Request, Response, NextFunction } from "express";
import { checkUserExists } from "../services/user.service";
import { ClientError } from "../utils/errors";

// Field validation is handled by the login Zod schema; this only checks that
// the account exists before attempting to authenticate.
const validateUserDoesExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  if (!(await checkUserExists(email)))
    return next(new ClientError("User does not exist", 400));
  next();
};

export default validateUserDoesExist;
