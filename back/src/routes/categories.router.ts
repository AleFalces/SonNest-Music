import { Router } from "express";
import { getCategories } from "../controllers/category.controller";
import { cacheControl } from "../middlewares/cacheControl.middleware";

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Categories
 *     description: Product categories
 */

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all product categories
 *     responses:
 *       200:
 *         description: Array of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 1 }
 *                   name: { type: string, example: "Basses" }
 */
router.get("/", cacheControl(3600), getCategories);

export default router;
