import { Router } from "express";
import checkLogin from "../middlewares/checkLogin.middleware";
import { validate } from "../middlewares/validate.middleware";
import { orderSchema } from "../schemas/order.schema";
import {
  createPreference,
  confirmPayment,
  paymentWebhook,
} from "../controllers/payment.controller";

const paymentsRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Payments
 *     description: Mercado Pago Checkout Pro integration (test mode)
 */

/**
 * @openapi
 * /payments/create-preference:
 *   post:
 *     tags: [Payments]
 *     summary: Create a Mercado Pago Checkout Pro preference for the cart
 *     description: >
 *       Builds a Checkout Pro preference from the product ids in the body and
 *       returns its `id` and `init_point` (the URL to redirect the buyer to).
 *       The order is NOT created here — it is created on confirmation
 *       (see `GET /payments/confirm`).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       200:
 *         description: The created preference
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1234567890-abc12345-de67-89fg-hijk-lmnopqrstuvw"
 *                 init_point:
 *                   type: string
 *                   example: "https://www.mercadopago.com/checkout/v1/redirect?pref_id=..."
 *       400:
 *         description: Missing token or invalid body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
paymentsRouter.post(
  "/create-preference",
  checkLogin,
  validate(orderSchema),
  createPreference
);

/**
 * @openapi
 * /payments/confirm:
 *   get:
 *     tags: [Payments]
 *     summary: Confirm a Mercado Pago payment and create the order
 *     description: >
 *       Verifies the payment status against Mercado Pago. When the payment is
 *       `approved`, it creates the order from the preference metadata
 *       (user id + product ids). Idempotent — calling it again for an
 *       already-confirmed payment returns the existing order instead of
 *       duplicating it (guarded by the nullable `Order.paymentId`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: payment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Mercado Pago payment id from the return URL
 *     responses:
 *       200:
 *         description: The created (or already existing) order
 *       400:
 *         description: Missing token or payment not approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
paymentsRouter.get("/confirm", checkLogin, confirmPayment);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Mercado Pago webhook (server-to-server)
 *     description: >
 *       Public endpoint Mercado Pago calls when a payment changes state. No JWT:
 *       authenticity is checked via the `x-signature` header (when
 *       `MP_WEBHOOK_SECRET` is set). On an approved payment it creates the order
 *       idempotently. Always returns 200 so MP stops retrying.
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, example: payment }
 *       - in: query
 *         name: data.id
 *         schema: { type: string, example: "123456789" }
 *     responses:
 *       200:
 *         description: Notification acknowledged
 *       401:
 *         description: Invalid signature
 */
paymentsRouter.post("/webhook", paymentWebhook);

export default paymentsRouter;
