import { UserRepository } from "../repositories/user.repository";
import { Role } from "../entities/User";
import { createCredentialService } from "../services/credential.service";

/**
 * Seeds a single admin user on boot if one doesn't exist yet.
 * Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD (with safe local defaults).
 */
export const preLoadAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || "admin@soundnest.com";

  const existing = await UserRepository.findOneBy({ email });
  if (existing) {
    console.log("Admin user already exists");
    return;
  }

  const user = UserRepository.create({
    name: "Admin",
    email,
    address: "-",
    phone: "-",
    role: Role.ADMIN,
  });
  await UserRepository.save(user);

  const credential = await createCredentialService({
    password: process.env.ADMIN_PASSWORD || "admin1234",
  });
  user.credential = credential;
  await UserRepository.save(user);

  console.log(`Admin user preloaded: ${email}`);
};
