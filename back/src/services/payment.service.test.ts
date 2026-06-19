import {
  createPreferenceService,
  processPaymentService,
} from "./payment.service";
import { ProductRepository } from "../repositories/product.repository";
import { OrderRepository } from "../repositories/order.repository";
import { createOrderService } from "./order.service";
import { ClientError } from "../utils/errors";

// Impostor for the product repository: we decide what the DB "returns".
jest.mock("../repositories/product.repository", () => ({
  ProductRepository: {
    findOneBy: jest.fn(),
  },
}));

// Impostor for the order repository (idempotency lookup + save) and the order
// service (the actual order creation, already covered by its own tests).
jest.mock("../repositories/order.repository", () => ({
  OrderRepository: {
    findOneBy: jest.fn(),
    save: jest.fn(),
  },
}));
jest.mock("./order.service", () => ({
  createOrderService: jest.fn(),
}));

// Impostor for the Mercado Pago SDK. `Preference` and `Payment` become fake
// classes whose `create` / `get` methods are jest mocks we control. This way
// the test never hits the real Mercado Pago API.
const mpPreferenceCreate = jest.fn();
const mpPaymentGet = jest.fn();
jest.mock("mercadopago", () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn().mockImplementation(() => ({
    create: mpPreferenceCreate,
  })),
  Payment: jest.fn().mockImplementation(() => ({
    get: mpPaymentGet,
  })),
}));

// Mock envs so we can flip BACKEND_URL per test (it drives the webhook url).
// We mutate the registry object via requireMock — the import namespace exposes
// read-only getters, so assigning to it would throw.
jest.mock("../config/envs", () => ({
  __esModule: true,
  FRONTEND_URL: "http://localhost:3000",
  BACKEND_URL: "",
  MP_ACCESS_TOKEN: "",
  MP_WEBHOOK_SECRET: "",
}));
const mockedEnvs = jest.requireMock("../config/envs") as { BACKEND_URL: string };

const findOneBy = ProductRepository.findOneBy as jest.Mock;
const orderFindOneBy = OrderRepository.findOneBy as jest.Mock;
const orderSave = OrderRepository.save as jest.Mock;
const createOrder = createOrderService as jest.Mock;

describe("createPreferenceService", () => {
  const guitar = {
    id: 1,
    name: "Fender Stratocaster",
    price: 1200,
    image: "https://example.com/strat.jpg",
  };
  const bass = {
    id: 2,
    name: "Fender Jazz Bass",
    price: 900,
    image: "https://example.com/jazz.jpg",
  };

  beforeEach(() => {
    mockedEnvs.BACKEND_URL = "";
    findOneBy.mockReset();
    mpPreferenceCreate.mockReset();
    // Default: Mercado Pago returns a preference with an id and a checkout URL.
    mpPreferenceCreate.mockResolvedValue({
      id: "pref_123",
      init_point: "https://www.mercadopago.com/checkout?pref_id=pref_123",
    });
  });

  it("returns the preference id and init_point from Mercado Pago", async () => {
    findOneBy.mockImplementation(async ({ id }) =>
      id === 1 ? guitar : bass
    );

    const result = await createPreferenceService([1, 2], 42);

    expect(result).toEqual({
      id: "pref_123",
      init_point: "https://www.mercadopago.com/checkout?pref_id=pref_123",
    });
  });

  it("builds one item per product with title and unit_price", async () => {
    findOneBy.mockImplementation(async ({ id }) => (id === 1 ? guitar : bass));

    await createPreferenceService([1, 2], 42);

    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.items).toEqual([
      expect.objectContaining({ title: "Fender Stratocaster", unit_price: 1200, quantity: 1 }),
      expect.objectContaining({ title: "Fender Jazz Bass", unit_price: 900, quantity: 1 }),
    ]);
  });

  it("carries the userId and product ids in metadata", async () => {
    findOneBy.mockImplementation(async ({ id }) => (id === 1 ? guitar : bass));

    await createPreferenceService([1, 2], 42);

    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.metadata).toMatchObject({
      user_id: 42,
      product_ids: [1, 2],
    });
  });

  it("sets the three back_urls (success, pending, failure)", async () => {
    findOneBy.mockResolvedValue(guitar);

    await createPreferenceService([1], 42);

    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.back_urls.success).toContain("/checkout/success");
    expect(body.back_urls.pending).toContain("/checkout/pending");
    expect(body.back_urls.failure).toContain("/checkout/failure");
  });

  it("de-duplicates repeated product ids", async () => {
    findOneBy.mockImplementation(async ({ id }) => (id === 1 ? guitar : bass));

    await createPreferenceService([1, 1, 2], 42);

    // unique ids only -> two DB lookups, two items
    expect(findOneBy).toHaveBeenCalledTimes(2);
    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.items).toHaveLength(2);
  });

  it("sets notification_url to the webhook when BACKEND_URL is public", async () => {
    mockedEnvs.BACKEND_URL = "https://abc.ngrok.io";
    findOneBy.mockResolvedValue(guitar);

    await createPreferenceService([1], 42);

    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.notification_url).toBe("https://abc.ngrok.io/payments/webhook");
  });

  it("omits notification_url when BACKEND_URL is empty (no tunnel)", async () => {
    findOneBy.mockResolvedValue(guitar);

    await createPreferenceService([1], 42);

    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.notification_url).toBeUndefined();
  });

  it("throws a 404 ClientError when a product does not exist", async () => {
    findOneBy.mockResolvedValue(null);

    await expect(createPreferenceService([99], 42)).rejects.toBeInstanceOf(
      ClientError
    );
    await expect(createPreferenceService([99], 42)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mpPreferenceCreate).not.toHaveBeenCalled();
  });
});

describe("processPaymentService", () => {
  beforeEach(() => {
    orderFindOneBy.mockReset();
    orderSave.mockReset();
    createOrder.mockReset();
    mpPaymentGet.mockReset();
  });

  it("is idempotent: returns the existing order without hitting MP", async () => {
    const existing = { id: 7, paymentId: "pay_1" };
    orderFindOneBy.mockResolvedValue(existing);

    const result = await processPaymentService("pay_1");

    expect(result).toBe(existing);
    expect(mpPaymentGet).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("creates the order from the payment metadata when approved", async () => {
    orderFindOneBy.mockResolvedValue(null);
    mpPaymentGet.mockResolvedValue({
      status: "approved",
      metadata: { user_id: 42, product_ids: [1, 2] },
    });
    createOrder.mockResolvedValue({ id: 9 });
    orderSave.mockImplementation(async (o) => o);

    const result = await processPaymentService("pay_2");

    expect(createOrder).toHaveBeenCalledWith({ userId: 42, products: [1, 2] });
    expect(orderSave).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 9, paymentId: "pay_2" });
  });

  it("returns null and creates no order when the payment is not approved", async () => {
    orderFindOneBy.mockResolvedValue(null);
    mpPaymentGet.mockResolvedValue({
      status: "pending",
      metadata: { user_id: 42, product_ids: [1] },
    });

    const result = await processPaymentService("pay_3");

    expect(result).toBeNull();
    expect(createOrder).not.toHaveBeenCalled();
    expect(orderSave).not.toHaveBeenCalled();
  });
});
