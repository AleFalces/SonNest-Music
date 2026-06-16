import { confirmPaymentService } from "./payment.service";
import { createOrderService } from "./order.service";
import { OrderRepository } from "../repositories/order.repository";

// Fake Mercado Pago Payment.get so the test never hits the real API.
const mpPaymentGet = jest.fn();
jest.mock("mercadopago", () => ({
  MercadoPagoConfig: jest.fn(),
  Payment: jest.fn().mockImplementation(() => ({ get: mpPaymentGet })),
}));

jest.mock("./order.service", () => ({ createOrderService: jest.fn() }));

jest.mock("../repositories/order.repository", () => ({
  OrderRepository: { findOneBy: jest.fn(), save: jest.fn() },
}));

const paymentGet = mpPaymentGet;
const orderFindOneBy = OrderRepository.findOneBy as jest.Mock;
const orderSave = OrderRepository.save as jest.Mock;
const createOrder = createOrderService as jest.Mock;

describe("confirmPaymentService", () => {
  beforeEach(() => {
    paymentGet.mockReset();
    orderFindOneBy.mockReset();
    orderSave.mockReset();
    createOrder.mockReset();
  });

  it("creates an order when the payment is approved", async () => {
    orderFindOneBy.mockResolvedValue(null); // no order exists yet
    paymentGet.mockResolvedValue({
      status: "approved",
      metadata: { user_id: 42, product_ids: [1, 2] },
    });
    createOrder.mockResolvedValue({ id: 7, status: "approved" });
    orderSave.mockImplementation(async (o) => o);

    const order = await confirmPaymentService("pay_123");

    expect(createOrder).toHaveBeenCalledWith({ userId: 42, products: [1, 2] });
    expect(order.paymentId).toBe("pay_123");
  });

  it("does not create an order when the payment is not approved", async () => {
    orderFindOneBy.mockResolvedValue(null);
    paymentGet.mockResolvedValue({ status: "rejected", metadata: {} });

    await expect(confirmPaymentService("pay_rej")).rejects.toMatchObject({
      statusCode: 402,
    });
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("is idempotent: returns the existing order without creating a new one", async () => {
    const existingOrder = { id: 7, paymentId: "pay_123", status: "approved" };
    orderFindOneBy.mockResolvedValue(existingOrder);

    const order = await confirmPaymentService("pay_123");

    expect(order).toBe(existingOrder);
    expect(paymentGet).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
  });
});
