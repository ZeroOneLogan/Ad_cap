'use client';

import { Button } from '@idle-tycoon/ui-kit';
import { BulkAmount } from '@idle-tycoon/sim-core';

const options: BulkAmount[] = [1, 10, 'max'];

interface BulkSelectorProps {
  value: BulkAmount;
  onChange: (value: BulkAmount) => void;
}

export function BulkSelector({ value, onChange }: BulkSelectorProps) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <Button
          key={option}
          tone={value === option ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
        >
          x{option === 'max' ? 'MAX' : option}
        </Button>
      ))}
    </div>
  );
}
