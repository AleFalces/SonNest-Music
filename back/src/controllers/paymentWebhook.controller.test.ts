import { paymentWebhook } from "./payment.controller";
import { processPaymentService } from "../services/payment.service";
import { verifyMpWebhookSignature } from "../utils/mpWebhookSignature";

jest.mock("../services/payment.service");
jest.mock("../utils/mpWebhookSignature");
jest.mock("../config/envs", () => ({ MP_WEBHOOK_SECRET: "a-secret" }));

const process = processPaymentService as jest.Mock;
const verify = verifyMpWebhookSignature as jest.Mock;

// Minimal Express res double capturing the status code.
const mockRes = () => {
  const res: any = {};
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

const paymentReq = (overrides: any = {}) => ({
  query: { type: "payment", "data.id": "pay_1" },
  body: {},
  headers: { "x-signature": "ts=1,v1=abc", "x-request-id": "req_1" },
  ...overrides,
});

describe("paymentWebhook", () => {
  beforeEach(() => {
    process.mockReset();
    verify.mockReset();
  });

  it("processes the payment and acks 200 when the signature is valid", async () => {
    verify.mockReturnValue(true);
    process.mockResolvedValue({ id: 5 });
    const res = mockRes();

    await paymentWebhook(paymentReq(), res, jest.fn());

    expect(process).toHaveBeenCalledWith("pay_1");
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it("rejects with 401 and does not process when the signature is invalid", async () => {
    verify.mockReturnValue(false);
    const res = mockRes();

    await paymentWebhook(paymentReq(), res, jest.fn());

    expect(process).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it("acks 200 and ignores events that are not payments", async () => {
    const res = mockRes();

    await paymentWebhook(
      paymentReq({ query: { type: "merchant_order", "data.id": "x" } }),
      res,
      jest.fn()
    );

    expect(process).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });
});
