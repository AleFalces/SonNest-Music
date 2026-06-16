import isAdmin from "./isAdmin.middleware";
import { ClientError } from "../utils/errors";
import { Role } from "../entities/User";
import { UserRepository } from "../repositories/user.repository";

jest.mock("../repositories/user.repository", () => ({
  UserRepository: { findOneBy: jest.fn() },
}));

const findOneBy = UserRepository.findOneBy as jest.Mock;

describe("isAdmin middleware", () => {
  beforeEach(() => findOneBy.mockReset());

  it("calls next() with no error for an admin user", async () => {
    findOneBy.mockResolvedValue({ id: 1, role: Role.ADMIN });
    const next = jest.fn();
    await isAdmin({ body: { userId: 1 } } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a non-admin user with a 403 ClientError", async () => {
    findOneBy.mockResolvedValue({ id: 2, role: Role.USER });
    const next = jest.fn();
    await isAdmin({ body: { userId: 2 } } as any, {} as any, next);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ClientError);
    expect(error.statusCode).toBe(403);
  });

  it("rejects when the user does not exist", async () => {
    findOneBy.mockResolvedValue(null);
    const next = jest.fn();
    await isAdmin({ body: { userId: 99 } } as any, {} as any, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(ClientError);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});
