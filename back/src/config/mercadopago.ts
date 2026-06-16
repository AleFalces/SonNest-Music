import { MercadoPagoConfig } from "mercadopago";
import { MP_ACCESS_TOKEN } from "./envs";

// Single shared Mercado Pago client, configured once with our (test) access
// token. The payment service reuses this to create checkout preferences and to
// read payment status. Same idea as the AppDataSource singleton for the DB.
export const mpClient = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
});
