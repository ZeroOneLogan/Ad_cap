'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/hooks/useGameStore';
import { usePersistedState } from '@/lib/hooks/usePersistedState';
import { SaveSerializer, type SaveData } from '@idle-tycoon/sim-core';

interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const { initWorker, destroyWorker, sendWorkerMessage, setOfflineReport } = useGameStore();
  const [saveData, setSaveData, isLoadingSave] = usePersistedState<SaveData | null>(
    'gameSave',
    null
  );
  
  // Initialize game
  useEffect(() => {
    if (isLoadingSave) return;
    
    initWorker();
    
    // Load saved game or start new
    if (saveData) {
      sendWorkerMessage('init', { state: saveData.state });
      
      // Calculate offline time
      const offlineTime = Date.now() - saveData.timestamp;
      if (offlineTime > 10000) { // More than 10 seconds
        setOfflineReport({
          earnings: '0', // Will be calculated by worker
          duration: offlineTime / 1000,
        });
      }
    } else {
      const newState = SaveSerializer.createNewGame();
      sendWorkerMessage('init', { state: newState });
    }
    
    // Start simulation
    sendWorkerMessage('start');
    
    // Set up auto-save
    const saveInterval = setInterval(() => {
      sendWorkerMessage('save');
    }, 30000); // Save every 30 seconds
    
    // Handle save response
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'saved') {
        setSaveData(event.data.payload);
      }
    };
    
    const worker = (window as any).__gameWorker;
    if (worker) {
      worker.addEventListener('message', handleMessage);
    }
    
    return () => {
      clearInterval(saveInterval);
      if (worker) {
        worker.removeEventListener('message', handleMessage);
      }
      destroyWorker();
    };
  }, [isLoadingSave, saveData]);
  
  // Handle page visibility for accurate offline calculation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Save when page becomes hidden
        sendWorkerMessage('save');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sendWorkerMessage]);
  
  return <>{children}</>;
}