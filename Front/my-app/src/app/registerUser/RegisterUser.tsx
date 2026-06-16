"use client";
import { useState } from "react";
import { IRegisterDTO, IRegisterErrors } from "@/interfaces/userInterface";
import validateRegisterForm from "@/helpers/ValidationRegisterForm";
import { registerUserService } from "@/services/userServices";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const RegisterUser: React.FC = () => {
  const [registerData, setRegisterData] = useState<IRegisterDTO>({
    name: "",
    email: "",
    address: "",
    phone: "",
    password: "",
    Cpassword: "",
  });
  const [errors, setErrors] = useState<IRegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
    if (errors[name as keyof IRegisterErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(registerData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    await toast.promise(registerUserService(registerData), {
      loading: "Processing registration…",
      success: "Successfully registered! ✅",
      error: "Error registering your details 😣",
    });
    router.push("/loginUser");
  };

  const textFields: { name: keyof IRegisterDTO; label: string; type: string }[] =
    [
      { name: "name", label: "Name", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "address", label: "Address", type: "text" },
      { name: "email", label: "Email", type: "email" },
    ];

  const passwordFields: { name: keyof IRegisterDTO; label: string }[] = [
    { name: "password", label: "Password" },
    { name: "Cpassword", label: "Confirm Password" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="card w-full max-w-md space-y-4 p-8"
      >
        <h1 className="text-center text-2xl">Create your account</h1>
        <p className="-mt-2 text-center text-sm text-ink-soft">
          Join SoundNest in a minute.
        </p>

        {textFields.map(({ name, label, type }) => (
          <div key={name}>
            <label htmlFor={name} className="label">
              {label}
            </label>
            <input
              id={name}
              type={type}
              name={name}
              value={registerData[name]}
              onChange={handleInput}
              className={`input ${errors[name] ? "border-red-500" : ""}`}
            />
            {errors[name] && (
              <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
            )}
          </div>
        ))}

        {passwordFields.map(({ name, label }) => (
          <div key={name}>
            <label htmlFor={name} className="label">
              {label}
            </label>
            <div className="relative">
              <input
                id={name}
                type={showPassword ? "text" : "password"}
                name={name}
                value={registerData[name]}
                onChange={handleInput}
                className={`input pr-10 ${errors[name] ? "border-red-500" : ""}`}
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
            {errors[name] && (
              <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
            )}
          </div>
        ))}

        <button type="submit" className="btn btn-primary w-full py-3">
          Sign Up
        </button>

        <p className="text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link
            href="/loginUser"
            className="font-semibold text-bordo hover:underline"
          >
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterUser;
