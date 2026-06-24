import bulkImportAuth from "./bulkImportAuth.middleware";

jest.mock("../config/envs", () => ({
  IMPORT_API_KEY: "secret-key",
  JWT_SECRET: "secret",
}));

describe("bulkImportAuth", () => {
  it("passes a request with a valid x-api-key and tags it as 'machine'", async () => {
    const req = { headers: { "x-api-key": "secret-key" }, body: {} } as any;
    const next = jest.fn();

    await bulkImportAuth(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.importSource).toBe("machine");
  });

  it("rejects a request with neither api-key nor token", async () => {
    const req = { headers: {}, body: {} } as any;
    const next = jest.fn();

    await bulkImportAuth(req, {} as any, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Token is required");
    expect(req.body.importSource).toBeUndefined();
  });
});
