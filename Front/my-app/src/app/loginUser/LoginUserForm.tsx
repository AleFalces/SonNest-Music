"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";
import { ILoginDTO, ILoginFormErrorsDto } from "@/interfaces/userInterface";
import validatelogin from "@/helpers/ValidationsLoginForm";
import toast from "react-hot-toast";
import Link from "next/link";

const LoginUserForm: React.FC = () => {
  const [formData, setFormData] = useState<ILoginDTO>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ILoginFormErrorsDto>({});
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
      success: "¡Welcome back! 👋",
      error: "Invalid credentials, please try again.",
    });
    router.push("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen  p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-red-800 mb-6 text-center">
          Log In
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-1 text-yellow-700 font-medium"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInput}
              className={`w-full p-2 border-2 rounded-xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-800 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block mb-1 text-yellow-700 font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInput}
              className={`w-full p-2 border-2 rounded-xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-800 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-6 text-sm text-gray-700">
            ¿Don`t have an account?{" "}
            <Link href="/registerUser" className="text-red-800 hover:underline">
              Sign Up
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-800 text-white font-semibold rounded-xl shadow-md hover:bg-red-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={false}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginUserForm;
