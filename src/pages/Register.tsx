import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerUser } from "../services/authService";
import { registerSchema, type RegisterFormData } from "../schemas/authSchema";

function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

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
      await registerUser(data.email, data.password);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setServerError("Unable to create your account. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090A] px-4 py-8 text-white">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-xl font-semibold tracking-tight transition hover:text-white/80"
          >
            SaaS Dashboard
          </Link>

          <h1 className="mt-8 text-2xl font-semibold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Get started with your dashboard.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-6 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:ring-1 focus:ring-white/10"
              />

              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:ring-1 focus:ring-white/10"
              />

              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:ring-1 focus:ring-white/10"
              />

              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Firebase Error */}
            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-sm text-red-400"
              >
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-white transition hover:text-white/70"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
