import { Router } from "express";
import checkLogin from "../middlewares/checkLogin.middleware";
import { validate } from "../middlewares/validate.middleware";
import { addItemSchema } from "../schemas/cart.schema";
import {
  getCart,
  addItem,
  removeItem,
  removeProduct,
  clearCart,
} from "../controllers/cart.controller";

const cartRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Cart
 *     description: Per-user persistent shopping cart
 */

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the authenticated user's cart (created lazily if absent)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
cartRouter.get("/", checkLogin, getCart);

/**
 * @openapi
 * /cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add one unit of a product to the cart (stock-checked)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: integer, example: 3 }
 *     responses:
 *       201:
 *         description: The updated cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Missing token, invalid body or not enough stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
cartRouter.post("/items", checkLogin, validate(addItemSchema), addItem);

/**
 * @openapi
 * /cart/items/{productId}/all:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove a product from the cart entirely
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The updated cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Missing token or invalid product id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
cartRouter.delete("/items/:productId/all", checkLogin, removeProduct);

/**
 * @openapi
 * /cart/items/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove one unit of a product from the cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The updated cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Missing token or invalid product id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
cartRouter.delete("/items/:productId", checkLogin, removeItem);

/**
 * @openapi
 * /cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Empty the cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The now-empty cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
cartRouter.delete("/", checkLogin, clearCart);

export default cartRouter;
