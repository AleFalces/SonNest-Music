import { cacheControl } from "./cacheControl.middleware";

describe("cacheControl middleware", () => {
  it("sets a public max-age Cache-Control header and calls next()", () => {
    const set = jest.fn();
    const res = { set } as any;
    const next = jest.fn();

    cacheControl(3600)({} as any, res, next);

    expect(set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
    expect(next).toHaveBeenCalledWith();
  });
});
