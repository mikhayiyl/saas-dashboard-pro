import { AlertTriangle, ArrowUpRight, Sparkles } from "lucide-react";

type Insight = {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
};

const insights: Insight[] = [
  {
    type: "positive",
    title: "Revenue is growing",
    description: "Revenue increased by 12.5% compared with last month.",
  },
  {
    type: "warning",
    title: "Keyboard stock is low",
    description: "Only 8 units remain. Consider restocking soon.",
  },
  {
    type: "info",
    title: "Strong product demand",
    description: "Laptop and Monitor sales are driving this month's revenue.",
  },
];

const insightIcons = {
  positive: ArrowUpRight,
  warning: AlertTriangle,
  info: Sparkles,
};

function AIInsights() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-white/70" />

          <h2 className="font-semibold">AI Insights</h2>
        </div>

        <p className="mt-1 text-sm text-white/40">
          Highlights from your business data
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = insightIcons[insight.type];

          return (
            <div
              key={insight.title}
              className="rounded-lg border border-white/5 bg-white/2 p-4"
            >
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="size-4 text-white/60" />
                </div>

                <div>
                  <p className="text-sm font-medium">{insight.title}</p>

                  <p className="mt-1 text-sm leading-5 text-white/40">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIInsights;
