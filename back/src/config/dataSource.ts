import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "../entities/User";
import { Credential } from "../entities/Credential";
import { Order } from "../entities/Order";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Allow turning schema synchronization on in production (e.g. for a fresh
// Docker/demo database) without changing code. Defaults to false in prod.
const synchronizeInProd = process.env.DB_SYNCHRONIZE === "true";

export const AppDataSource = new DataSource(
  isProduction
    ? {
        type: "postgres",
        url: process.env.DATABASE_URL,
        synchronize: synchronizeInProd,
        logging: false,
        // Managed Postgres (Neon/Supabase/Render external) requires SSL;
        // rejectUnauthorized:false accepts the provider-managed certificate.
        ssl: { rejectUnauthorized: false },
        entities: ["dist/entities/**/*.js"],
        migrations: ["dist/migrations/**/*.js"],
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        logging: true,
        entities: ["src/entities/**/*.ts"],
        migrations: ["src/migrations/**/*.ts"],
      }
);
