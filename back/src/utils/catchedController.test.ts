import { catchedController } from "./catchedController";

describe("catchedController", () => {
  it("calls the wrapped controller with req and res", async () => {
    const controller = jest.fn().mockResolvedValue(undefined);
    const handler = catchedController(controller);
    const req = {} as any, res = {} as any, next = jest.fn();
    await handler(req, res, next);
    expect(controller).toHaveBeenCalledWith(req, res);
    expect(next).not.toHaveBeenCalled();
  });
  it("forwards thrown errors to next()", async () => {
    const error = new Error("boom");
    const handler = catchedController(jest.fn().mockRejectedValue(error));
    const next = jest.fn();
    await handler({} as any, {} as any, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
