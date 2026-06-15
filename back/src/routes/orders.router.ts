import { Router } from "express";
import validateOrderCreate from "../middlewares/orderCreate.middleware";
import { createOrder } from "../controllers/order.controller";
import checkLogin from "../middlewares/checkLogin.middleware";

const ordersRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Order creation
 */

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Missing token, invalid body or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
ordersRouter.post("/", checkLogin, validateOrderCreate, createOrder);

export default ordersRouter;
