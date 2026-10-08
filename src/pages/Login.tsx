import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { loginUser } from "../services/authService";
import { loginSchema, type LoginFormData } from "../schemas/authSchema";
import AuthShell from "@/components/auth/AuthShell";

function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setServerError("");

    try {
      await loginUser(data.email, data.password);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setServerError(
        "Unable to sign in. Please check your email and password.",
      );
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to pick up right where your business left off."
      footer={
        <>
          New to SimplizerPro?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#345bd7] transition hover:text-[#2448bd]"
          >
            Create your account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              className="h-[50px] w-full rounded-xl border border-[#dfe5ee] bg-[#f8fafd] pl-11 pr-4 text-sm text-[#142238] outline-none transition placeholder:text-[#a0aabc] hover:border-[#c8d2e0] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.09]"
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-xs font-medium text-[#c34452]">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-[#34435a]"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-[#8a97aa]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
              className="h-[50px] w-full rounded-xl border border-[#dfe5ee] bg-[#f8fafd] pl-11 pr-12 text-sm text-[#142238] outline-none transition placeholder:text-[#a0aabc] hover:border-[#c8d2e0] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.09]"
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
          {isSubmitting ? "Signing in..." : "Sign in to workspace"}
          {!isSubmitting && (
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;
