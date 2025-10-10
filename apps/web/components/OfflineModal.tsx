'use client';

import { useEffect } from 'react';
import { Modal, Button } from '@idle-tycoon/ui-kit';
import { useGameStore } from '@/lib/hooks/useGameStore';
import { formatMoney, formatDuration } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';

export function OfflineModal() {
  const { offlineReport, setOfflineReport } = useGameStore();
  
  const handleClose = () => {
    setOfflineReport(null);
  };
  
  if (!offlineReport) return null;
  
  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Welcome Back!"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">You were away for</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatDuration(offlineReport.duration)}
          </p>
        </div>
        
        <motion.div
          className="bg-success-50 rounded-lg p-6 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-success-800 mb-2">You earned</p>
          <p className="text-3xl font-bold text-success-600">
            {formatMoney(offlineReport.earnings)}
          </p>
        </motion.div>
        
        <Button onClick={handleClose} variant="primary" fullWidth>
          Continue Playing
        </Button>
      </div>
    </Modal>
  );
}