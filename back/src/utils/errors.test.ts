import { ClientError } from "./errors";

describe("ClientError", () => {
  it("is an instance of Error", () => {
    expect(new ClientError("oops")).toBeInstanceOf(Error);
  });
  it("defaults to status code 400", () => {
    const err = new ClientError("bad request");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("bad request");
  });
  it("accepts a custom status code", () => {
    expect(new ClientError("unauthorized", 401).statusCode).toBe(401);
  });
});
