"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";
import { ILoginDTO, ILoginFormErrorsDto } from "@/interfaces/userInterface";
import validatelogin from "@/helpers/ValidationsLoginForm";
import toast from "react-hot-toast";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const LoginUserForm: React.FC = () => {
  const [formData, setFormData] = useState<ILoginDTO>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ILoginFormErrorsDto>({});
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useLogin();
  const router = useRouter();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof ILoginFormErrorsDto]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validatelogin(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    await toast.promise(loginUser(formData), {
      loading: "Verifying credentials…",
      success: "Welcome back! 👋",
      error: "Invalid credentials, please try again.",
    });
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-1 text-center text-2xl">Log In</h1>
        <p className="mb-6 text-center text-sm text-ink-soft">
          Welcome back to SoundNest.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInput}
              className={`input ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInput}
                className={`input pr-10 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-bordo"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <p className="text-sm text-ink-soft">
            Don&apos;t have an account?{" "}
            <Link href="/registerUser" className="font-semibold text-bordo hover:underline">
              Sign Up
            </Link>
          </p>

          <button type="submit" className="btn btn-primary w-full py-3">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginUserForm;
