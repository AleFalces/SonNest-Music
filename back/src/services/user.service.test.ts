import jwt from "jsonwebtoken";
import { registerUserService, loginUserService } from "./user.service";
import { UserRepository } from "../repositories/user.repository";
import {
  createCredentialService,
  checkPasswordService,
} from "./credential.service";
import { ClientError } from "../utils/errors";

jest.mock("../repositories/user.repository", () => ({
  UserRepository: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
}));
jest.mock("./credential.service", () => ({
  createCredentialService: jest.fn(),
  checkPasswordService: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));
jest.mock("../config/envs", () => ({ JWT_SECRET: "test-secret" }));

const create = UserRepository.create as jest.Mock;
const save = UserRepository.save as jest.Mock;
const findOne = UserRepository.findOne as jest.Mock;
const createCredential = createCredentialService as jest.Mock;
const checkPassword = checkPasswordService as jest.Mock;
const sign = jwt.sign as jest.Mock;

const registerDto = {
  name: "Jane",
  email: "jane@example.com",
  password: "Str0ngPass!",
  address: "123 Music St",
  phone: "+1 555 0100",
};

describe("registerUserService", () => {
  beforeEach(() => {
    create.mockReset();
    save.mockReset();
    createCredential.mockReset();
  });

  it("creates the user, attaches a hashed credential and saves twice", async () => {
    const user: any = { id: 1, email: registerDto.email };
    create.mockReturnValue(user);
    save.mockImplementation(async (u) => u);
    const credential = { id: 9, password: "hashed" };
    createCredential.mockResolvedValue(credential);

    const result = await registerUserService(registerDto as any);

    expect(create).toHaveBeenCalledWith(registerDto);
    expect(createCredential).toHaveBeenCalledWith({ password: registerDto.password });
    expect(result.credential).toBe(credential);
    expect(save).toHaveBeenCalledTimes(2);
  });
});

describe("loginUserService", () => {
  beforeEach(() => {
    findOne.mockReset();
    checkPassword.mockReset();
    sign.mockReset();
  });

  it("returns a token and a password-less user on valid credentials", async () => {
    findOne.mockResolvedValue({
      id: 1,
      email: registerDto.email,
      credential: { id: 9, password: "hashed" },
    });
    checkPassword.mockResolvedValue(true);
    sign.mockReturnValue("signed-token");

    const result = await loginUserService({
      email: registerDto.email,
      password: registerDto.password,
    } as any);

    expect(checkPassword).toHaveBeenCalledWith(registerDto.password, "hashed");
    expect(sign).toHaveBeenCalledWith({ userId: 1 }, "test-secret");
    expect(result.token).toBe("signed-token");
    expect((result.user.credential as any).password).toBeUndefined();
  });

  it("throws when the user is not found", async () => {
    findOne.mockResolvedValue(null);
    await expect(
      loginUserService({ email: "nope@x.com", password: "x" } as any)
    ).rejects.toThrow("User not found");
  });

  it("throws a ClientError when the password is invalid", async () => {
    findOne.mockResolvedValue({
      id: 1,
      email: registerDto.email,
      credential: { id: 9, password: "hashed" },
    });
    checkPassword.mockResolvedValue(false);

    await expect(
      loginUserService({ email: registerDto.email, password: "wrong" } as any)
    ).rejects.toBeInstanceOf(ClientError);
  });
});
