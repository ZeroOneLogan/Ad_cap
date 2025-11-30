'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationSnapshot } from '@idle-tycoon/sim-core';
import { BalanceHeader } from './BalanceHeader';
import { BusinessList } from './BusinessList';
import { UpgradesPanel } from './UpgradesPanel';
import { ManagersPanel } from './ManagersPanel';
import { PrestigePanel } from './PrestigePanel';
import { TabBar, type TabId } from './TabBar';

interface GameScreenProps {
  snapshot: SimulationSnapshot;
}

export function GameScreen({ snapshot }: GameScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('empire');

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'empire':
        return <BusinessList key="empire" snapshot={snapshot} />;
      case 'upgrades':
        return <UpgradesPanel key="upgrades" snapshot={snapshot} />;
      case 'managers':
        return <ManagersPanel key="managers" snapshot={snapshot} />;
      case 'prestige':
        return <PrestigePanel key="prestige" snapshot={snapshot} />;
      default:
        return null;
    }
  }, [activeTab, snapshot]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-[100dvh]"
    >
      {/* Fixed Header */}
      <BalanceHeader snapshot={snapshot} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 scroll-container hide-scrollbar">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      {/* Fixed Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </motion.div>
  );
}
