'use client';

import { motion } from 'framer-motion';

export type TabId = 'empire' | 'upgrades' | 'managers' | 'prestige';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'empire', label: 'Empire', icon: '🏢' },
  { id: 'upgrades', label: 'Upgrades', icon: '⚡' },
  { id: 'managers', label: 'Managers', icon: '👔' },
  { id: 'prestige', label: 'Prestige', icon: '✨' },
];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 tab-bar pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive ? 'text-amber-400' : 'text-white/40'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active indicator background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-amber-400/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              
              {/* Icon with animation */}
              <motion.span 
                className="text-xl relative z-10"
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', bounce: 0.3 }}
              >
                {tab.icon}
              </motion.span>
              
              {/* Label */}
              <span className="text-[10px] font-semibold tracking-wide relative z-10">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
