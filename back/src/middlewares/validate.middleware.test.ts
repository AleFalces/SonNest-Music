import { validate } from "./validate.middleware";
import { registerSchema, loginSchema } from "../schemas/user.schema";
import { orderSchema } from "../schemas/order.schema";
import { ClientError } from "../utils/errors";

const validRegister = {
  name: "Jane",
  email: "jane@example.com",
  password: "secret12",
  address: "123 Music St",
  phone: "+1 555 0100",
};

const run = (schema: any, body: any) => {
  const req = { body } as any;
  const next = jest.fn();
  validate(schema)(req, {} as any, next);
  return { req, next };
};

describe("validate middleware", () => {
  it("calls next() with no error for a valid body", () => {
    const { next } = run(registerSchema, validRegister);
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards a 400 ClientError when a field is missing", () => {
    const { email, ...incomplete } = validRegister;
    const { next } = run(registerSchema, incomplete);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ClientError);
    expect(error.statusCode).toBe(400);
  });

  it("rejects an invalid email", () => {
    const { next } = run(loginSchema, { email: "not-an-email", password: "x" });
    expect(next.mock.calls[0][0]).toBeInstanceOf(ClientError);
  });

  it("rejects an order with no products", () => {
    const { next } = run(orderSchema, { products: [] });
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it("preserves extra body fields (e.g. userId) on success", () => {
    const { req, next } = run(orderSchema, { products: [1, 2], userId: 7 });
    expect(next).toHaveBeenCalledWith();
    expect(req.body.userId).toBe(7);
    expect(req.body.products).toEqual([1, 2]);
  });
});
