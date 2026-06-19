import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Lightweight liveness probe (no DB) for uptime monitors and the keep-alive
// ping that prevents the free host from sleeping (cold starts).
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use(router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).send({
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  });
});

export default app;
