import crypto from "crypto";
import { verifyMpWebhookSignature } from "./mpWebhookSignature";

const secret = "test-secret";
const dataId = "123456";
const requestId = "req-abc";
const ts = "1700000000";

// Re-create MP's signed manifest so the test is self-contained.
const sign = (id: string) =>
  crypto
    .createHmac("sha256", secret)
    .update(`id:${id};request-id:${requestId};ts:${ts};`)
    .digest("hex");

describe("verifyMpWebhookSignature", () => {
  it("accepts a correctly signed request", () => {
    const v1 = sign(dataId);
    expect(
      verifyMpWebhookSignature({
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId,
        secret,
      })
    ).toBe(true);
  });

  it("rejects a tampered signature", () => {
    expect(
      verifyMpWebhookSignature({
        xSignature: `ts=${ts},v1=deadbeef`,
        xRequestId: requestId,
        dataId,
        secret,
      })
    ).toBe(false);
  });

  it("rejects a missing or malformed x-signature header", () => {
    expect(
      verifyMpWebhookSignature({
        xSignature: undefined,
        xRequestId: requestId,
        dataId,
        secret,
      })
    ).toBe(false);
  });
});
