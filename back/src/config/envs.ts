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

// Public base URL of THIS backend, used to build Mercado Pago's webhook
// (notification_url). Empty by default: webhooks are only wired when the
// backend is reachable from the internet (a deployed URL or an ngrok tunnel
// in local development). When empty, order creation falls back to the
// browser-driven /payments/confirm flow.
export const BACKEND_URL: string = process.env.BACKEND_URL || "";

// Secret used to validate the signature of incoming Mercado Pago webhooks
// (the "x-signature" header). Configured in the MP panel. When empty, signature
// validation is skipped (handy for local sandbox testing) with a warning.
export const MP_WEBHOOK_SECRET: string = process.env.MP_WEBHOOK_SECRET || "";

// Cloudinary credentials for admin product-image uploads. The upload goes
// through the backend so the API secret never reaches the browser.
export const CLOUDINARY_CLOUD_NAME: string =
  process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY: string = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET: string =
  process.env.CLOUDINARY_API_SECRET || "";
