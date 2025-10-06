'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { Button, Card } from '@idle-tycoon/ui-kit';
import { formatCurrency } from '@/lib/format';
import { useSimulationStore } from '@/lib/store';
import { BUSINESSES, UPGRADES, type SimulationSnapshot } from '@idle-tycoon/sim-core';

interface UpgradePanelProps {
  snapshot: SimulationSnapshot;
}

export function UpgradePanel({ snapshot }: UpgradePanelProps) {
  const buyUpgrade = useSimulationStore((state) => state.buyUpgrade);

  const available = UPGRADES.filter((upgrade) => {
    const upgradeState = snapshot.upgrades[upgrade.id];
    if (upgradeState?.purchased) return false;
    if (upgrade.targetBusinessId === 'global') return true;
    const business = snapshot.businesses[upgrade.targetBusinessId];
    return business.amount >= upgrade.threshold;
  });

  if (available.length === 0) {
    return (
      <Card className="flex items-center justify-center text-white/60">
        No upgrades ready yet — keep scaling your empire.
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {available.map((upgrade) => {
        const targetName =
          upgrade.targetBusinessId === 'global'
            ? 'All Businesses'
            : BUSINESSES.find((b) => b.id === upgrade.targetBusinessId)?.name ?? 'Unknown';
        const affordable = snapshot.balance.gte(upgrade.cost);
        return (
          <Card key={upgrade.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-white">{upgrade.name}</h4>
                <p className="text-xs uppercase tracking-wide text-brand-200">{targetName}</p>
              </div>
              <span className="text-sm text-white/70">{formatCurrency(upgrade.cost)}</span>
            </div>
            <p className="text-sm text-white/70">{upgrade.description}</p>
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button onClick={() => buyUpgrade(upgrade.id)} disabled={!affordable} tone="secondary">
                    Purchase
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
                    Requires {upgrade.threshold} owned to unlock effect.
                    <Tooltip.Arrow className="fill-slate-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </Card>
        );
      })}
    </div>
  );
}
