'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import {
  BulkAmount,
  BUSINESSES,
  calculateBusinessRevenue,
  calculatePurchaseCost,
  getBusinessDefinition,
  getMaxAffordableQuantity,
  type SimulationSnapshot
} from '@idle-tycoon/sim-core';
import { Button, Card } from '@idle-tycoon/ui-kit';
import { formatCurrency, formatDuration } from '@/lib/format';
import { useSimulationStore } from '@/lib/store';

interface BusinessRowProps {
  snapshot: SimulationSnapshot;
  businessId: string;
  bulk: BulkAmount;
}

export function BusinessRow({ snapshot, businessId, bulk }: BusinessRowProps) {
  const trigger = useSimulationStore((state) => state.trigger);
  const buy = useSimulationStore((state) => state.buyBusiness);
  const businessState = snapshot.businesses[businessId];
  const definition = getBusinessDefinition(businessId);
  const quantity = bulk === 'max' ? getMaxAffordableQuantity(snapshot, businessId) : bulk;
  const cost = calculatePurchaseCost(businessId, businessState.amount, quantity);
  const affordable = snapshot.balance.gte(cost) && quantity > 0;
  const revenue = calculateBusinessRevenue(snapshot, businessState);

  return (
    <Card className="flex flex-col gap-4 bg-gradient-to-br from-white/10 to-white/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{definition.name}</h3>
          <p className="text-sm text-white/60">{definition.description}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-brand-200">{businessState.amount}</p>
          <p className="text-xs uppercase tracking-wide text-white/50">Owned</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
        <span>Cycle: {formatDuration(definition.durationMs)}</span>
        <span>Yield: {formatCurrency(revenue)} / cycle</span>
        <span>Automation: {businessState.isAutomated ? 'On' : 'Manual'}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <Tooltip.Provider delayDuration={150}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button
                tone="secondary"
                onClick={() => trigger(businessId)}
                disabled={!businessState.unlocked}
              >
                Launch Production
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
                Kick off a run manually if automation is not unlocked.
                <Tooltip.Arrow className="fill-slate-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
        <Button onClick={() => buy(businessId)} disabled={!affordable}>
          Buy x{quantity} — {formatCurrency(cost)}
        </Button>
      </div>
    </Card>
  );
}

export function BusinessList({ snapshot, bulk }: { snapshot: SimulationSnapshot; bulk: BulkAmount }) {
  return (
    <div className="grid gap-4">
      {BUSINESSES.map((business) => (
        <BusinessRow key={business.id} snapshot={snapshot} businessId={business.id} bulk={bulk} />
      ))}
    </div>
  );
}
