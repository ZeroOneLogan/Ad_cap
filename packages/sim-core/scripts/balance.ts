#!/usr/bin/env node
import { BUSINESSES, UPGRADES, MANAGERS, PRESTIGE_CONFIG } from '../src/economy/constants';
import { 
  calculateBusinessCost, 
  calculateBusinessIncome, 
  calculatePrestigeGain,
  formatBigNumber 
} from '../src/economy/formulas';
import Big from 'big.js';
import * as fs from 'fs';
import * as path from 'path';

interface ProgressionData {
  level: number;
  cost: string;
  totalCost: string;
  income: string;
  incomePerSecond: string;
  roi: string; // Return on Investment in seconds
}

function analyzeBusinessProgression(businessId: string): ProgressionData[] {
  const business = BUSINESSES.find(b => b.id === businessId);
  if (!business) return [];
  
  const data: ProgressionData[] = [];
  let totalCost = new Big(0);
  
  const levels = [1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500];
  
  for (const level of levels) {
    const cost = calculateBusinessCost(business, level - 1);
    totalCost = totalCost.plus(cost);
    
    const income = calculateBusinessIncome(business, level, [], 1);
    const incomePerSecond = income.div(business.baseTime);
    const roi = cost.div(incomePerSecond);
    
    data.push({
      level,
      cost: formatBigNumber(cost),
      totalCost: formatBigNumber(totalCost),
      income: formatBigNumber(income),
      incomePerSecond: formatBigNumber(incomePerSecond),
      roi: roi.toFixed(2),
    });
  }
  
  return data;
}

function generateBalanceReport() {
  console.log('🎮 Idle Tycoon Balance Analysis\n');
  
  // Business progression
  console.log('📊 Business Progression Analysis\n');
  
  for (const business of BUSINESSES) {
    console.log(`\n${business.icon} ${business.name}`);
    console.log('─'.repeat(50));
    
    const progression = analyzeBusinessProgression(business.id);
    console.table(progression.slice(0, 10)); // Show first 10 levels
  }
  
  // Manager costs
  console.log('\n👥 Manager Analysis\n');
  const managerData = MANAGERS.map(m => ({
    Name: m.name,
    Business: BUSINESSES.find(b => b.id === m.businessId)?.name,
    Cost: formatBigNumber(m.cost),
    'Required Level': m.requires.businessLevel,
  }));
  console.table(managerData);
  
  // Upgrade effects
  console.log('\n⬆️ Upgrade Analysis\n');
  const upgradeData = UPGRADES.slice(0, 10).map(u => ({
    Name: u.name,
    Cost: formatBigNumber(u.cost),
    Effect: u.effects.map(e => {
      switch (e.type) {
        case 'business_income':
          return `${e.multiplier}x ${e.businessId} income`;
        case 'all_income':
          return `${e.multiplier}x all income`;
        case 'business_speed':
          return `${Math.round((1 - e.multiplier) * 100)}% faster ${e.businessId}`;
        case 'all_speed':
          return `${Math.round((1 - e.multiplier) * 100)}% faster all`;
        default:
          return 'Unknown';
      }
    }).join(', '),
  }));
  console.table(upgradeData);
  
  // Prestige analysis
  console.log('\n🌟 Prestige Analysis\n');
  const prestigeEarnings = [
    '1e6', '1e7', '1e8', '1e9', '1e10', '1e12', '1e15', '1e18', '1e21', '1e24'
  ];
  
  const prestigeData = prestigeEarnings.map(earnings => {
    const earningsBig = new Big(earnings);
    const gain = calculatePrestigeGain(earningsBig, PRESTIGE_CONFIG.k, PRESTIGE_CONFIG.alpha);
    return {
      'Total Earnings': formatBigNumber(earningsBig),
      'Prestige Points': formatBigNumber(gain),
      'Income Multi': Math.pow(PRESTIGE_CONFIG.incomeMultiplier, Number(gain.toString())).toFixed(2) + 'x',
      'Speed Multi': (1 / Math.pow(PRESTIGE_CONFIG.speedMultiplier, Number(gain.toString()))).toFixed(2) + 'x',
    };
  });
  console.table(prestigeData);
  
  // Export to CSV
  exportToCSV();
}

function exportToCSV() {
  const outputDir = path.join(__dirname, '../../../analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Export business progressions
  for (const business of BUSINESSES) {
    const progression = analyzeBusinessProgression(business.id);
    const csv = [
      'Level,Cost,Total Cost,Income,Income/Sec,ROI (seconds)',
      ...progression.map(p => 
        `${p.level},${p.cost},${p.totalCost},${p.income},${p.incomePerSecond},${p.roi}`
      )
    ].join('\n');
    
    fs.writeFileSync(
      path.join(outputDir, `${business.id}_progression.csv`),
      csv
    );
  }
  
  console.log(`\n✅ Analysis exported to ${outputDir}/`);
}

// Run the analysis
generateBalanceReport();