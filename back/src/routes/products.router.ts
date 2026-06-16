import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductsById,
  updateProduct,
} from "../controllers/product.controller";
import checkLogin from "../middlewares/checkLogin.middleware";
import isAdmin from "../middlewares/isAdmin.middleware";

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
 *     summary: List products (paginated, searchable, filterable by category)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 9 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive match on the product name
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Category name (or "all")
 *     responses:
 *       200:
 *         description: Paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 page: { type: integer, example: 1 }
 *                 limit: { type: integer, example: 9 }
 *                 total: { type: integer, example: 21 }
 *                 totalPages: { type: integer, example: 3 }
 */
router.get("/", getProducts);

router.post("/", checkLogin, isAdmin, createProduct);

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

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Update a product's stock or price (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock: { type: integer, example: 25 }
 *               price: { type: number, example: 999 }
 *     responses:
 *       200:
 *         description: The updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Missing token or invalid body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
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
router.patch("/:id", checkLogin, isAdmin, updateProduct);

router.delete("/:id", checkLogin, isAdmin, deleteProduct);

export default router;
