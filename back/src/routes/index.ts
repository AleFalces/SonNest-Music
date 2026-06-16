import { Router } from "express";
import usersRouter from "./users.router";
import ordersRouter from "./orders.router";
import productsRouter from "./products.router";
import categoriesRouter from "./categories.router";
import paymentsRouter from "./payments.router";

const router = Router();

router.use("/users", usersRouter);
router.use("/orders", ordersRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/payments", paymentsRouter);

export default router;
