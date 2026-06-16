import dotenv from "dotenv";
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 8080;
export const DB_NAME: string = process.env.DB_NAME || "proyecto_m4_front";
export const DB_USER: string = process.env.DB_USER || "postgres";
export const DB_PASSWORD: string = process.env.DB_PASSWORD || "admin";
export const DB_HOST: string = process.env.DB_HOST || "localhost";
export const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
export const JWT_SECRET: string = process.env.JWT_SECRET || "secret";

// Mercado Pago access token (use the TEST token, starts with "TEST-").
// No default on purpose: a payment secret must come from the environment.
export const MP_ACCESS_TOKEN: string = process.env.MP_ACCESS_TOKEN || "";

// Public base URL of the frontend, used to build Mercado Pago's return URLs
// (success / pending / failure). Defaults to the local Next.js dev server.
export const FRONTEND_URL: string =
  process.env.FRONTEND_URL || "http://localhost:3000";
