#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';
import { BUSINESSES, UPGRADES, MANAGERS, PRESTIGE_CONFIG } from '../packages/sim-core/src/economy/constants';
import {
  calculateBusinessCost,
  calculateBusinessIncome,
  calculateBusinessTime,
  calculatePrestigeGain,
  formatBigNumber,
} from '../packages/sim-core/src/economy/formulas';
import Big from 'big.js';

interface BalanceRow {
  businessId: string;
  level: number;
  cost: string;
  income: string;
  incomePerSecond: string;
  roi: string;
  timeToAfford: string;
  withManager: boolean;
  withUpgrades: string;
}

function generateBalanceData(): BalanceRow[] {
  const rows: BalanceRow[] = [];
  const levels = [1, 10, 25, 50, 100, 200, 500, 1000];
  
  for (const business of BUSINESSES) {
    for (const level of levels) {
      // Calculate with no upgrades
      const cost = calculateBusinessCost(business, level - 1);
      const income = calculateBusinessIncome(business, level, [], 1);
      const cycleTime = calculateBusinessTime(business, [], 1);
      const incomePerSecond = income.div(cycleTime);
      const roi = cost.div(incomePerSecond); // Seconds to ROI
      
      // Basic row
      rows.push({
        businessId: business.id,
        level,
        cost: cost.toString(),
        income: income.toString(),
        incomePerSecond: incomePerSecond.toString(),
        roi: roi.toString(),
        timeToAfford: '0', // Will calculate based on previous businesses
        withManager: false,
        withUpgrades: 'none',
      });
      
      // With all business upgrades
      const businessUpgrades = UPGRADES
        .filter(u => u.effects.some(e => 
          e.type === 'business_income' && e.businessId === business.id
        ))
        .flatMap(u => u.effects);
      
      if (businessUpgrades.length > 0) {
        const upgradeIncome = calculateBusinessIncome(business, level, businessUpgrades, 1);
        const upgradeIncomePerSecond = upgradeIncome.div(cycleTime);
        const upgradeRoi = cost.div(upgradeIncomePerSecond);
        
        rows.push({
          businessId: business.id,
          level,
          cost: cost.toString(),
          income: upgradeIncome.toString(),
          incomePerSecond: upgradeIncomePerSecond.toString(),
          roi: upgradeRoi.toString(),
          timeToAfford: '0',
          withManager: false,
          withUpgrades: 'business',
        });
      }
    }
  }
  
  return rows;
}

function generatePrestigeData() {
  const earnings = [
    '1e6', '1e7', '1e8', '1e9', '1e10',
    '1e12', '1e15', '1e18', '1e21', '1e24',
  ];
  
  const prestigeRows = earnings.map(earning => {
    const gain = calculatePrestigeGain(
      new Big(earning),
      PRESTIGE_CONFIG.k,
      PRESTIGE_CONFIG.alpha
    );
    
    return {
      totalEarnings: earning,
      prestigeGain: gain.toString(),
      incomeMultiplier: Math.pow(PRESTIGE_CONFIG.incomeMultiplier, Number(gain.toString())),
      speedMultiplier: Math.pow(PRESTIGE_CONFIG.speedMultiplier, Number(gain.toString())),
    };
  });
  
  return prestigeRows;
}

function writeCSV(filename: string, data: any[]) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');
  
  writeFileSync(filename, csv);
  console.log(`Written: ${filename}`);
}

function formatCSVNumbers(data: any[]): any[] {
  return data.map(row => {
    const formatted: any = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
        formatted[key] = formatBigNumber(value, 2);
      } else {
        formatted[key] = value;
      }
    }
    return formatted;
  });
}

// Generate balance data
console.log('Generating balance sweep data...');

const balanceData = generateBalanceData();
const prestigeData = generatePrestigeData();

// Format numbers for readability
const formattedBalance = formatCSVNumbers(balanceData);
const formattedPrestige = formatCSVNumbers(prestigeData);

// Write CSV files
const outputDir = join(process.cwd(), 'balance-data');
try {
  require('fs').mkdirSync(outputDir, { recursive: true });
} catch {}

writeCSV(join(outputDir, 'business-balance.csv'), formattedBalance);
writeCSV(join(outputDir, 'prestige-balance.csv'), formattedPrestige);

// Also write raw data for analysis
writeCSV(join(outputDir, 'business-balance-raw.csv'), balanceData);
writeCSV(join(outputDir, 'prestige-balance-raw.csv'), prestigeData);

console.log('\nBalance sweep complete!');
console.log(`Output directory: ${outputDir}`);

// Print summary
console.log('\nSummary:');
console.log(`- Total businesses: ${BUSINESSES.length}`);
console.log(`- Total upgrades: ${UPGRADES.length}`);
console.log(`- Total managers: ${MANAGERS.length}`);
console.log(`- Prestige formula: ${PRESTIGE_CONFIG.k} × earnings^${PRESTIGE_CONFIG.alpha}`);