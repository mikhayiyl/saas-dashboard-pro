import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { registerUser } from "../services/authService";
import { registerSchema, type RegisterFormData } from "../schemas/authSchema";
import AuthShell from "@/components/auth/AuthShell";

function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setServerError("");

    try {
      await registerUser(data.name, data.email, data.password);

      navigate("/dashboard");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    }
  };

  const inputClassName =
    "h-[48px] w-full rounded-xl border border-[#dfe5ee] bg-[#f8fafd] pl-11 pr-4 text-sm text-[#142238] outline-none transition placeholder:text-[#a0aabc] hover:border-[#c8d2e0] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.09]";

  return (
    <AuthShell
      title="Build your workspace"
      description="Create your account and bring the moving parts of your business together."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#345bd7] transition hover:text-[#2448bd]"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-[13px] font-semibold text-[#34435a]"
          >
            Your name
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-[#8a97aa]" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name")}
              className={inputClassName}
            />
          </div>
          {errors.name && (
            <p id="name-error" className="mt-1.5 text-xs font-medium text-[#c34452]">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-[13px] font-semibold text-[#34435a]"
          >
            Work email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-[#8a97aa]" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
              className={inputClassName}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-xs font-medium text-[#c34452]">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-[13px] font-semibold text-[#34435a]"
          >
            Create password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-[#8a97aa]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
              className={`${inputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8794a8] transition hover:text-[#34435a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5476e8]"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-xs font-medium text-[#c34452]">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-[13px] font-semibold text-[#34435a]"
          >
            Confirm password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-[#8a97aa]" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter your password again"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
              {...register("confirmPassword")}
              className={`${inputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={
                showConfirmPassword ? "Hide confirmation" : "Show confirmation"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8794a8] transition hover:text-[#34435a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5476e8]"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p
              id="confirm-password-error"
              className="mt-1.5 text-xs font-medium text-[#c34452]"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-[#f1c8cc] bg-[#fff5f5] px-3.5 py-3 text-sm text-[#a83240]"
          >
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#345bd7] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_-8px_rgba(52,91,215,0.72)] transition hover:bg-[#294fc9] hover:shadow-[0_10px_22px_-8px_rgba(52,91,215,0.8)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5476e8]/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create your workspace"}
          {!isSubmitting && (
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;
