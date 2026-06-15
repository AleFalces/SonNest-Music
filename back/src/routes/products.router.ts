import { Router } from "express";
import {
  getProducts,
  getProductsById,
} from "../controllers/product.controller";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Product catalog
 */

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List all products
 *     responses:
 *       200:
 *         description: Array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", getProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a single product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product id
 *     responses:
 *       200:
 *         description: The requested product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getProductsById);

export default router;
