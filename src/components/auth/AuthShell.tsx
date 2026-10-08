import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Boxes,
  ChartNoAxesCombined,
  CircleCheck,
  ShoppingBag,
  UsersRound,
} from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f8] px-3 py-5 text-[#142238] sm:px-6 sm:py-8">
      <div className="grid min-h-[min(780px,calc(100vh-2.5rem))] w-full max-w-[1120px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_32px_100px_-48px_rgba(20,34,56,0.38)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative isolate flex min-h-[280px] flex-col overflow-hidden bg-[#101d35] px-6 py-7 text-white sm:min-h-[340px] sm:px-10 sm:py-9 lg:min-h-0 lg:px-12 lg:py-11">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_8%_5%,rgba(76,123,255,0.32),transparent_42%),radial-gradient(ellipse_at_95%_90%,rgba(131,91,255,0.24),transparent_40%)]" />
          <div className="pointer-events-none absolute -right-32 top-1/4 -z-10 size-80 rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute -right-20 top-[29%] -z-10 size-56 rounded-full border border-white/[0.06]" />

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] shadow-lg shadow-blue-950/20">
              <Boxes className="size-5 text-[#a9c0ff]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight">
                Simplizer<span className="text-[#9eb7ff]">Pro</span>
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Business, made simpler
              </p>
            </div>
          </div>

          <div className="my-auto py-8 lg:py-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#91aaff]/20 bg-[#91aaff]/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#bdcaff]">
              <span className="size-1.5 rounded-full bg-[#a9c0ff] shadow-[0_0_10px_#829fff]" />
              Your business command center
            </div>
            <h1 className="max-w-[470px] text-[34px] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[42px] lg:text-[46px]">
              Make room for your next{" "}
              <span className="bg-gradient-to-r from-[#94afff] via-[#b7a5ff] to-[#87dcff] bg-clip-text text-transparent">
                big move.
              </span>
            </h1>
            <p className="mt-4 max-w-[420px] text-sm leading-6 text-slate-300/75 sm:text-[15px]">
              Bring your products, orders, customers, and insights together in
              one calm, clear workspace.
            </p>

            <div className="mt-8 hidden max-w-[420px] rounded-2xl border border-white/[0.12] bg-[#0a1428]/55 p-4 shadow-2xl shadow-[#090f20]/30 backdrop-blur-sm sm:block">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#829fff]/[0.12] text-[#a9bcff]">
                    <ChartNoAxesCombined className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">
                      Your business, connected
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Everything in one place
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-3 gap-2.5 pt-3">
                {[
                  { label: "Products", icon: Boxes, status: "Organized" },
                  { label: "Orders", icon: ShoppingBag, status: "On track" },
                  { label: "Customers", icon: UsersRound, status: "In sync" },
                ].map(({ label, icon: Icon, status }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-2.5"
                  >
                    <Icon className="size-4 text-[#a9bcff]" />
                    <p className="mt-3 text-[10px] font-medium text-slate-200">
                      {label}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                      <CircleCheck className="size-3 text-[#76d7bc]" />
                      {status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="hidden text-[11px] text-slate-400/80 lg:block">
            A clearer way to run the work behind your business.
          </p>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-9 sm:px-10 sm:py-12 lg:px-12">
          <div className="w-full max-w-[390px]">
            <img
              src="/simplizerpro-logo.png"
              alt="SimplizerPro"
              className="mb-9 h-11 w-auto object-contain object-left"
            />
            <div className="mb-7">
              <h2 className="text-[27px] font-semibold tracking-[-0.04em] text-[#142238] sm:text-[30px]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#738096]">
                {description}
              </p>
            </div>
            {children}
            <div className="mt-7 border-t border-[#e9edf3] pt-5 text-center text-[13px] text-[#738096]">
              {footer}
            </div>
            <p className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-[#a2aebe]">
              Secure workspace · Built for business
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthShell;
