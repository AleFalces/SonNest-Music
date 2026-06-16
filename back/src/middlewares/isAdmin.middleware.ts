import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { ClientError } from "../utils/errors";
import { Role } from "../entities/User";

/**
 * Must run after `checkLogin` (which puts `userId` on the request body).
 * Loads the user and only lets admins through.
 */
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const user = await UserRepository.findOneBy({ id: userId });
    if (!user || user.role !== Role.ADMIN) {
      return next(new ClientError("Admin access required", 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default isAdmin;
