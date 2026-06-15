import type { Metadata } from 'next';
import { runAuditEngine } from '@/lib/audit';
import type {
  AuditInput,
  FinalAuditResult,
  ToolId,
  UseCase,
} from '@/lib/audit/types';
import { auditRepository } from '@/lib/repositories/audit';
import { getTool, USE_CASES } from '@/components/audit/catalog';
import { ProgressSteps } from '@/components/audit/ProgressSteps';
import { SavingsHero } from '@/components/results/SavingsHero';
import { ToolResultCard } from '@/components/results/ToolResultCard';
import { ShareSection } from '@/components/results/ShareSection';
import { AISummaryCard } from '@/components/results/AISummaryCard';
import { ResultsAtmosphere } from '@/components/results/ResultsAtmosphere';
import { ResultsEmptyState } from '@/components/results/ResultsEmptyState';
import { SectionReveal } from '@/components/ui/SectionReveal';

// Slug lookups are per-request and hit the database — never prerender.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your Audit Results',
  description:
    'See where your team is overspending on AI tools and how much you could save.',
};

interface StoredTool {
  toolId: string;
  plan: string;
  seats: number;
  monthlySpend: number;
}

interface StoredAuditData {
  tools: StoredTool[];
  teamSize: number;
  useCase: string;
  aiSummary?: string | undefined;
}

function isStoredTool(value: unknown): value is StoredTool {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.toolId === 'string' &&
    typeof t.plan === 'string' &&
    typeof t.seats === 'number' &&
    typeof t.monthlySpend === 'number'
  );
}

/** Validate the persisted jsonb payload before trusting it. */
function parseStoredAuditData(data: unknown): StoredAuditData | null {
  if (typeof data !== 'object' || data === null) return null;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.tools) || !d.tools.every(isStoredTool)) return null;
  if (typeof d.teamSize !== 'number' || typeof d.useCase !== 'string') return null;
  return {
    tools: d.tools as StoredTool[],
    teamSize: d.teamSize,
    useCase: d.useCase,
    aiSummary: typeof d.aiSummary === 'string' ? d.aiSummary : undefined,
  };
}

async function fetchAudit(slug: string) {
  try {
    return (await auditRepository.getAuditBySlug(slug)) ?? null;
  } catch {
    // DB unreachable / misconfigured → treated as "not found" (no raw 500).
    return null;
  }
}

function buildFallbackSummary(
  data: StoredAuditData,
  monthly: number,
  useCaseLabel: string
): string {
  const people = `${data.teamSize} ${data.teamSize === 1 ? 'person' : 'people'}`;
  const tools = `${data.tools.length} AI ${data.tools.length === 1 ? 'tool' : 'tools'}`;
  if (monthly > 0) {
    return `Your team of ${people} is spending across ${tools} for ${useCaseLabel.toLowerCase()} work. The recommendations above right-size your plans to your actual usage and surface meaningful monthly savings. Start with the highest-impact change, then re-run this audit as your team or stack evolves.`;
  }
  return `Your team of ${people} is running a lean, well-matched AI stack of ${tools} for ${useCaseLabel.toLowerCase()} work. We didn't find meaningful overspend — your current plans fit your team size and usage. Re-run this audit whenever your headcount or tools change.`;
}

export default async function ResultsPage({
  params,
}: {
  params: { slug: string };
}) {
  const audit = await fetchAudit(params.slug);
  if (!audit) return <ResultsEmptyState />;

  const data = parseStoredAuditData(audit.auditData);
  if (!data || data.tools.length === 0) return <ResultsEmptyState />;

  // Re-run the deterministic engine from the stored input — identical output,
  // and the per-tool findings aren't persisted separately.
  const engineInput: AuditInput = {
    tools: data.tools.map((t) => ({
      toolId: t.toolId as ToolId,
      plan: t.plan,
      seats: t.seats,
      monthlySpend: t.monthlySpend,
    })),
    global: { teamSize: data.teamSize, useCase: data.useCase as UseCase },
  };

  let engine: FinalAuditResult | null = null;
  try {
    engine = runAuditEngine(engineInput);
  } catch {
    engine = null;
  }
  if (!engine) return <ResultsEmptyState />;

  const monthly = Number(engine.totalSavingsMonthly) || 0;
  const annual = Number(engine.totalSavingsAnnually) || 0;
  // Total current spend isn't a stored/engine field — derive it (presentation
  // only) by summing each tool's current monthly spend.
  const monthlySpend = engine.toolResults.reduce(
    (sum, t) => sum + (Number(t.savings.currentMonthlySpend) || 0),
    0
  );
  const annualSpend = monthlySpend * 12;
  const useCaseLabel =
    USE_CASES.find((u) => u.value === data.useCase)?.label ?? 'Mixed';
  const summary =
    data.aiSummary && data.aiSummary.trim() !== ''
      ? data.aiSummary.trim()
      : buildFallbackSummary(data, monthly, useCaseLabel);

  return (
    <section className="relative isolate -mt-16 min-h-screen overflow-hidden bg-cream bg-[radial-gradient(125%_125%_at_50%_6%,#FFFDF8_0%,#FAF7F0_46%,#F3EEE4_100%)] px-6 pb-24 pt-24">
      <ResultsAtmosphere />

      <div className="relative z-10 mx-auto w-full max-w-[840px]">
        <div className="flex justify-center">
          <ProgressSteps current={2} />
        </div>

        <div className="mt-10 space-y-6">
          <SavingsHero
            monthlySpend={monthlySpend}
            annualSpend={annualSpend}
            savingsMonthly={monthly}
            savingsAnnual={annual}
            toolCount={engine.toolResults.length}
            useCaseLabel={useCaseLabel}
            teamSize={data.teamSize}
          />

          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-bottle">
              Per-tool breakdown
            </h2>
            {engine.toolResults.map((finding, i) => (
              <SectionReveal key={`${finding.toolId}-${i}`} delay={i * 0.06}>
                <ToolResultCard finding={finding} />
              </SectionReveal>
            ))}
          </div>

          <AISummaryCard summary={summary} />

          <ShareSection slug={audit.publicSlug} />
        </div>
      </div>
    </section>
  );
}
