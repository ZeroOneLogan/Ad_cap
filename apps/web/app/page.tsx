'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSimulationInit, useSimulationStore } from '../lib/store';
import { GameScreen } from '../components/game/GameScreen';
import { LoadingScreen } from '../components/game/LoadingScreen';
import { OfflineRewardModal } from '../components/game/OfflineRewardModal';
import type { SimulationSnapshot, OfflineReport } from '@idle-tycoon/sim-core';

export default function HomePage() {
  useSimulationInit();
  
  const ready = useSimulationStore((state: { ready: boolean }) => state.ready);
  const snapshot = useSimulationStore((state: { snapshot: SimulationSnapshot | null }) => state.snapshot);
  const offlineReport = useSimulationStore((state: { offlineReport: OfflineReport | null }) => state.offlineReport);
  
  // Prevent iOS overscroll
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {!ready || !snapshot ? (
          <LoadingScreen key="loading" />
        ) : (
          <GameScreen key="game" snapshot={snapshot} />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {offlineReport && offlineReport.earnings.gt(0) && (
          <OfflineRewardModal key="offline-modal" report={offlineReport} />
        )}
      </AnimatePresence>
    </>
  );
}
