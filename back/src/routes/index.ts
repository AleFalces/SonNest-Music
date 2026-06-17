import { Router } from "express";
import usersRouter from "./users.router";
import ordersRouter from "./orders.router";
import productsRouter from "./products.router";
import categoriesRouter from "./categories.router";
import paymentsRouter from "./payments.router";
import cartRouter from "./cart.router";

const router = Router();

router.use("/users", usersRouter);
router.use("/orders", ordersRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/payments", paymentsRouter);
router.use("/cart", cartRouter);

export default router;
