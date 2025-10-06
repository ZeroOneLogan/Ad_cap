'use client';

import { Button, Card } from '@idle-tycoon/ui-kit';
import { formatCurrency } from '@/lib/format';
import { useSimulationStore } from '@/lib/store';
import { BUSINESSES, MANAGERS, type SimulationSnapshot } from '@idle-tycoon/sim-core';

export function ManagerPanel({ snapshot }: { snapshot: SimulationSnapshot }) {
  const hireManager = useSimulationStore((state) => state.hireManager);

  return (
    <div className="grid gap-3">
      {MANAGERS.map((manager) => {
        const state = snapshot.managers[manager.id];
        const business = BUSINESSES.find((b) => b.id === manager.businessId);
        const businessState = snapshot.businesses[manager.businessId];
        const canHire = snapshot.balance.gte(manager.cost);
        const unlocked = businessState.unlocked;
        return (
          <Card key={manager.id} className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold text-white">{manager.name}</h4>
              <p className="text-sm text-white/60">{manager.description}</p>
              <p className="text-xs uppercase tracking-wide text-brand-200">
                Automates {business?.name ?? manager.businessId}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-white/70">{formatCurrency(manager.cost)}</span>
              <Button
                tone={state?.hired ? 'ghost' : 'primary'}
                disabled={state?.hired || !canHire || !unlocked}
                onClick={() => hireManager(manager.id)}
              >
                {state?.hired ? 'Hired' : 'Hire'}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
