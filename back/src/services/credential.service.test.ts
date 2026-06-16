import bcrypt from "bcrypt";
import {
  createCredentialService,
  checkPasswordService,
} from "./credential.service";
import { CredentialRepository } from "../repositories/credential.repository";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../repositories/credential.repository", () => ({
  CredentialRepository: {
    create: jest.fn(),
    save: jest.fn(),
  },
}));

const hash = bcrypt.hash as jest.Mock;
const compare = bcrypt.compare as jest.Mock;
const create = CredentialRepository.create as jest.Mock;
const save = CredentialRepository.save as jest.Mock;

describe("createCredentialService", () => {
  beforeEach(() => {
    hash.mockReset();
    create.mockReset();
    save.mockReset();
  });

  it("hashes the password with a cost of 10 before saving", async () => {
    hash.mockResolvedValue("hashed-pw");
    create.mockImplementation((data) => data);
    save.mockImplementation(async (c) => c);

    const credential = await createCredentialService({ password: "plain" });

    expect(hash).toHaveBeenCalledWith("plain", 10);
    expect(create).toHaveBeenCalledWith({ password: "hashed-pw" });
    expect(save).toHaveBeenCalled();
    expect(credential.password).toBe("hashed-pw");
  });
});

describe("checkPasswordService", () => {
  beforeEach(() => compare.mockReset());

  it("returns true when bcrypt confirms the password matches", async () => {
    compare.mockResolvedValue(true);
    await expect(checkPasswordService("plain", "hashed")).resolves.toBe(true);
    expect(compare).toHaveBeenCalledWith("plain", "hashed");
  });

  it("returns false when the password does not match", async () => {
    compare.mockResolvedValue(false);
    await expect(checkPasswordService("wrong", "hashed")).resolves.toBe(false);
  });
});
