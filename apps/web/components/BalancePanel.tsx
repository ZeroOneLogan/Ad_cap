'use client';

import { Card, StatPill } from '@idle-tycoon/ui-kit';
import { formatCurrency } from '@/lib/format';
import { type SimulationSnapshot } from '@idle-tycoon/sim-core';

export function BalancePanel({ snapshot }: { snapshot: SimulationSnapshot }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 bg-white/5">
      <div>
        <h2 className="text-3xl font-bold text-white">{'$' + formatCurrency(snapshot.balance)}</h2>
        <p className="text-sm text-white/60">Cash on hand</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <StatPill label="Income / s" value={'$' + formatCurrency(snapshot.incomePerSecond)} />
        <StatPill label="Lifetime" value={'$' + formatCurrency(snapshot.totalEarned)} />
        <StatPill label="Prestige Mult" value={`${snapshot.prestige.multiplier.toFixed(2)}x`} />
        <StatPill label="Angels" value={snapshot.prestige.points.toFixed(0)} />
      </div>
    </Card>
  );
}
