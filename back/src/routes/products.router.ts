import { Router } from "express";
import multer from "multer";
import {
  bulkImportProducts,
  createProduct,
  deleteProduct,
  getProducts,
  getProductsById,
  updateProduct,
  uploadProductImage,
} from "../controllers/product.controller";
import checkLogin from "../middlewares/checkLogin.middleware";
import isAdmin from "../middlewares/isAdmin.middleware";
import bulkImportAuth from "../middlewares/bulkImportAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { cacheControl } from "../middlewares/cacheControl.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema";
import { bulkImportSchema } from "../schemas/bulkImport.schema";

const router = Router();

// Keep the upload in memory: the service streams the buffer straight to
// Cloudinary, so we never touch the local disk.
const upload = multer({ storage: multer.memoryStorage() });

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
router.get("/", cacheControl(60), getProducts);

router.post("/", checkLogin, isAdmin, validate(createProductSchema), createProduct);

/**
 * @openapi
 * /products/bulk:
 *   post:
 *     tags: [Products]
 *     summary: Bulk upsert products by sku (admin JWT or x-api-key)
 *     description: >
 *       Upserts products keyed by `sku`: existing skus are updated (stock applied
 *       per `mode`), new skus are created. Returns a per-line summary so a bad row
 *       is reported without aborting the batch. Authenticates with either an admin
 *       JWT (Authorization header) or a machine `x-api-key` (for n8n-style clients).
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [sum, set]
 *                 default: sum
 *                 description: "sum: stock += qty (invoice case); set: overwrite"
 *               importId:
 *                 type: string
 *                 description: Optional import identifier (idempotency is not yet enforced)
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [sku, stock]
 *                   properties:
 *                     sku: { type: string, example: "SN-STR-001" }
 *                     stock: { type: integer, example: 5 }
 *                     name: { type: string }
 *                     description: { type: string }
 *                     price: { type: number }
 *                     image: { type: string }
 *                     categoryId: { type: integer }
 *     responses:
 *       200:
 *         description: Per-line import summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created: { type: integer, example: 2 }
 *                 updated: { type: integer, example: 5 }
 *                 failed: { type: integer, example: 1 }
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sku: { type: string }
 *                       status: { type: string, enum: [created, updated, failed] }
 *                       reason: { type: string }
 *       400:
 *         description: Missing credentials or invalid body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/bulk", bulkImportAuth, validate(bulkImportSchema), bulkImportProducts);

/**
 * @openapi
 * /products/image:
 *   post:
 *     tags: [Products]
 *     summary: Upload a product image to Cloudinary (admin only)
 *     description: >
 *       Accepts a single image file (multipart field `image`) and returns its
 *       hosted Cloudinary URL, which the admin form then submits as the
 *       product's `image`.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The hosted image URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://res.cloudinary.com/demo/image/upload/v1/soundnest/products/abc.jpg"
 *       400:
 *         description: Missing token or no image file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/image",
  checkLogin,
  isAdmin,
  upload.single("image"),
  uploadProductImage
);

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
router.get("/:id", cacheControl(60), getProductsById);

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
router.patch("/:id", checkLogin, isAdmin, validate(updateProductSchema), updateProduct);

router.delete("/:id", checkLogin, isAdmin, deleteProduct);

export default router;
