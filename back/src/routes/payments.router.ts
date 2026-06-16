import { Router } from "express";
import checkLogin from "../middlewares/checkLogin.middleware";
import { validate } from "../middlewares/validate.middleware";
import { orderSchema } from "../schemas/order.schema";
import { createPreference } from "../controllers/payment.controller";

const paymentsRouter = Router();

paymentsRouter.post(
  "/create-preference",
  checkLogin,
  validate(orderSchema),
  createPreference
);

export default paymentsRouter;
