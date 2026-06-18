import crypto from "crypto";

interface MpSignatureParts {
  xSignature: string | undefined; // "ts=<ts>,v1=<hash>"
  xRequestId: string | undefined;
  dataId: string;
  secret: string;
}

// Validates a Mercado Pago webhook's x-signature so the public endpoint can't be
// tricked into creating orders from forged payment notifications.
export const verifyMpWebhookSignature = ({
  xSignature,
  xRequestId,
  dataId,
  secret,
}: MpSignatureParts): boolean => {
  if (!xSignature) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((kv) => kv.split("=").map((s) => s.trim()))
  );
  if (!parts.ts || !parts.v1) return false;

  // MP signs the lowercased id in a fixed manifest template.
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${parts.ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
