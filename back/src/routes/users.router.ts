import { Request, Response, Router } from "express";
import validateUserExists from "../middlewares/userRegister.middleware";
import validateUserDoesExist from "../middlewares/userLogin.middleware";
import { login, registerUser } from "../controllers/user.controller";
import checkLogin from "../middlewares/checkLogin.middleware";
import { OrderRepository } from "../repositories/order.repository";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../schemas/user.schema";

const usersRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: Authentication and user orders
 */

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
usersRouter.post(
  "/register",
  validate(registerSchema),
  validateUserExists,
  registerUser
);

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Authenticate a user and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Login succeeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
usersRouter.post(
  "/login",
  validate(loginSchema),
  validateUserDoesExist,
  login
);

/**
 * @openapi
 * /users/orders:
 *   post:
 *     tags: [Users]
 *     summary: List the authenticated user's orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of the user's orders
 *       400:
 *         description: Token is required / invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
usersRouter.post("/orders", checkLogin, async (req: Request, res: Response) => {
  const { userId } = req.body;
  const orders = await OrderRepository.find({
    relations: ["products"],
    where: { user: { id: userId } },
  });

  res.send(orders);
});

export default usersRouter;
