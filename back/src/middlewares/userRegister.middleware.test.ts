import validateUserRegister from "./userRegister.middleware";
import { ClientError } from "../utils/errors";

const [validateRequiredFields] = validateUserRegister;

describe("validateUserRegister (required fields)", () => {
  const validBody = {
    email: "jane@example.com", password: "secret", name: "Jane",
    address: "123 Music St", phone: "+1 555 0100",
  };
  it("calls next() with no error when all fields are present", () => {
    const next = jest.fn();
    validateRequiredFields({ body: validBody } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });
  it("calls next() with a ClientError when a field is missing", () => {
    const next = jest.fn();
    const { email, ...incomplete } = validBody;
    validateRequiredFields({ body: incomplete } as any, {} as any, next);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ClientError);
    expect(error.message).toBe("Missing fields");
  });
});
