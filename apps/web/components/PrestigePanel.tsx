'use client';

import { Button, Card } from '@idle-tycoon/ui-kit';
import { formatCurrency } from '@/lib/format';
import { useSimulationStore } from '@/lib/store';
import { calculatePrestigePoints, type SimulationSnapshot } from '@idle-tycoon/sim-core';

export function PrestigePanel({ snapshot }: { snapshot: SimulationSnapshot }) {
  const prestige = useSimulationStore((state) => state.prestige);
  const potential = calculatePrestigePoints(snapshot.totalEarned);
  const canPrestige = potential.gt(0);

  return (
    <Card className="flex flex-col gap-3 bg-gradient-to-br from-brand-500/40 to-brand-400/20">
      <div>
        <h3 className="text-lg font-semibold text-white">Prestige</h3>
        <p className="text-sm text-white/70">
          Reset for angels and a permanent multiplier. Earn more by growing total lifetime revenue.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-white">
        <div>
          <p className="text-2xl font-bold">{potential.toFixed(0)}</p>
          <p className="text-xs uppercase tracking-wide text-white/70">Angels ready</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{'$' + formatCurrency(snapshot.totalEarned)}</p>
          <p className="text-xs uppercase tracking-wide text-white/70">Lifetime earnings</p>
        </div>
      </div>
      <Button tone="secondary" onClick={() => prestige()} disabled={!canPrestige}>
        Prestige &amp; Ascend
      </Button>
      <p className="text-xs text-white/60">Prestige resets businesses, managers, and upgrades while boosting all profits.</p>
    </Card>
  );
}
