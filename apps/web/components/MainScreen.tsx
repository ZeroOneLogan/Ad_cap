'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { BulkSelector } from './BulkSelector';
import { BusinessList } from './BusinessRow';
import { BalancePanel } from './BalancePanel';
import { ManagerPanel } from './ManagerPanel';
import { PrestigePanel } from './PrestigePanel';
import { UpgradePanel } from './UpgradePanel';
import { OfflineSummary } from './OfflineSummary';
import { useSimulationInit, useSimulationStore } from '@/lib/store';

export default function MainScreen() {
  useSimulationInit();
  const snapshot = useSimulationStore((state) => state.snapshot);
  const ready = useSimulationStore((state) => state.ready);
  const bulk = useSimulationStore((state) => state.bulk);
  const setBulk = useSimulationStore((state) => state.setBulk);

  const shouldReduceMotion = useReducedMotion();

  const content = useMemo(() => {
    if (!snapshot || !ready) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-center text-white/60">
            Initializing simulation core…
          </div>
        </div>
      );
    }
    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col gap-6"
      >
        <BalancePanel snapshot={snapshot} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-white">Idle Tycoon Web</h1>
          <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div>
                  <BulkSelector value={bulk} onChange={setBulk} />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
                  Choose how many units to buy at once.
                  <Tooltip.Arrow className="fill-slate-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-6">
            <BusinessList snapshot={snapshot} bulk={bulk} />
          </div>
          <div className="flex flex-col gap-6">
            <UpgradePanel snapshot={snapshot} />
            <ManagerPanel snapshot={snapshot} />
            <PrestigePanel snapshot={snapshot} />
          </div>
        </div>
      </motion.div>
    );
  }, [bulk, ready, setBulk, shouldReduceMotion, snapshot]);

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-16">
      {content}
      <OfflineSummary />
    </main>
  );
}
