'use client';

import { useEffect, useState } from 'react';
import { Card } from '@idle-tycoon/ui-kit';
import { formatCurrency, formatDuration } from '@/lib/format';
import { useSimulationStore } from '@/lib/store';

export function OfflineSummary() {
  const report = useSimulationStore((state) => state.offlineReport);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!report) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, [report]);

  if (!report || !visible) return null;

  return (
    <Card className="fixed bottom-6 right-6 max-w-sm bg-slate-900/90 text-white shadow-xl shadow-brand-500/30">
      <h4 className="text-base font-semibold">Welcome back!</h4>
      <p className="text-sm text-white/70">
        Your managers worked for {formatDuration(report.effectiveMs)} and earned {'$' + formatCurrency(report.earnings)} while you
        were away.
      </p>
    </Card>
  );
}
