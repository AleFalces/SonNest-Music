import { Router } from "express";
import checkLogin from "../middlewares/checkLogin.middleware";
import { validate } from "../middlewares/validate.middleware";
import { orderSchema } from "../schemas/order.schema";
import {
  createPreference,
  confirmPayment,
} from "../controllers/payment.controller";

const paymentsRouter = Router();

paymentsRouter.post(
  "/create-preference",
  checkLogin,
  validate(orderSchema),
  createPreference
);

paymentsRouter.get("/confirm", checkLogin, confirmPayment);

export default paymentsRouter;
