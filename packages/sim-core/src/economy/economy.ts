import Decimal from 'decimal.js';
import type {
  BusinessDefinition,
  ManagerDefinition,
  PrestigeTier,
  UpgradeDefinition
} from '../types';

export const BUSINESSES: BusinessDefinition[] = [
  {
    id: 'lemonade-stand',
    name: 'Lemonade Stand',
    description: 'The humble beginning. Squeeze profits drop by drop.',
    baseCost: new Decimal(4),
    costGrowth: new Decimal(1.07),
    baseRate: new Decimal(1),
    durationMs: 750,
    unlockAt: 0,
    managerCost: new Decimal(1000),
    upgradeIds: ['lemonade-boost-1', 'lemonade-boost-2']
  },
  {
    id: 'newspaper-route',
    name: 'Newspaper Route',
    description: 'Morning delivery hustle with returning subscribers.',
    baseCost: new Decimal(60),
    costGrowth: new Decimal(1.15),
    baseRate: new Decimal(8),
    durationMs: 1500,
    unlockAt: 25,
    managerCost: new Decimal(15000),
    upgradeIds: ['newspaper-boost-1', 'newspaper-boost-2']
  },
  {
    id: 'car-wash',
    name: 'Car Wash',
    description: 'Automated suds and polish for constant shine.',
    baseCost: new Decimal(720),
    costGrowth: new Decimal(1.14),
    baseRate: new Decimal(96),
    durationMs: 3500,
    unlockAt: 75,
    managerCost: new Decimal(120000),
    upgradeIds: ['carwash-boost-1', 'carwash-boost-2']
  },
  {
    id: 'pizza-delivery',
    name: 'Pizza Delivery',
    description: 'Hot slices in 30 minutes or a bonus multiplier.',
    baseCost: new Decimal(8640),
    costGrowth: new Decimal(1.13),
    baseRate: new Decimal(864),
    durationMs: 5000,
    unlockAt: 150,
    managerCost: new Decimal(750000),
    upgradeIds: ['pizza-boost-1', 'pizza-boost-2']
  },
  {
    id: 'oil-company',
    name: 'Oil Company',
    description: 'Deep wells pumping unstoppable cashflow.',
    baseCost: new Decimal(103680),
    costGrowth: new Decimal(1.12),
    baseRate: new Decimal(10368),
    durationMs: 12000,
    unlockAt: 400,
    managerCost: new Decimal(4000000),
    upgradeIds: ['oil-boost-1', 'oil-boost-2']
  },
  {
    id: 'galactic-resort',
    name: 'Galactic Resort',
    description: 'Orbiting luxury with zero-gravity profits.',
    baseCost: new Decimal(1244160),
    costGrowth: new Decimal(1.11),
    baseRate: new Decimal(124416),
    durationMs: 20000,
    unlockAt: 800,
    managerCost: new Decimal(20000000),
    upgradeIds: ['resort-boost-1', 'resort-boost-2']
  }
];

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'lemonade-boost-1',
    name: 'Sugar Rush',
    description: 'Double lemonade profits after 25 stands.',
    targetBusinessId: 'lemonade-stand',
    multiplier: new Decimal(2),
    cost: new Decimal(100),
    threshold: 25
  },
  {
    id: 'lemonade-boost-2',
    name: 'Organic Lemons',
    description: 'Triple lemonade profits after 100 stands.',
    targetBusinessId: 'lemonade-stand',
    multiplier: new Decimal(3),
    cost: new Decimal(5000),
    threshold: 100
  },
  {
    id: 'newspaper-boost-1',
    name: 'Ink Saver',
    description: '2x newspaper route revenue.',
    targetBusinessId: 'newspaper-route',
    multiplier: new Decimal(2),
    cost: new Decimal(2500),
    threshold: 25
  },
  {
    id: 'newspaper-boost-2',
    name: 'Drone Delivery',
    description: '3x newspaper route efficiency.',
    targetBusinessId: 'newspaper-route',
    multiplier: new Decimal(3),
    cost: new Decimal(55000),
    threshold: 100
  },
  {
    id: 'carwash-boost-1',
    name: 'Hyper Soap',
    description: 'Foam adds 2x profits.',
    targetBusinessId: 'car-wash',
    multiplier: new Decimal(2),
    cost: new Decimal(120000),
    threshold: 25
  },
  {
    id: 'carwash-boost-2',
    name: 'Nano Polish',
    description: 'Another 3x profits.',
    targetBusinessId: 'car-wash',
    multiplier: new Decimal(3),
    cost: new Decimal(750000),
    threshold: 100
  },
  {
    id: 'pizza-boost-1',
    name: 'Thermal Bags',
    description: 'Keeps slices hot for 2x payout.',
    targetBusinessId: 'pizza-delivery',
    multiplier: new Decimal(2),
    cost: new Decimal(900000),
    threshold: 25
  },
  {
    id: 'pizza-boost-2',
    name: 'Quantum Ovens',
    description: 'Instant pizzas, 3x profits.',
    targetBusinessId: 'pizza-delivery',
    multiplier: new Decimal(3),
    cost: new Decimal(4500000),
    threshold: 100
  },
  {
    id: 'oil-boost-1',
    name: 'Eco Pumps',
    description: 'Doubles extraction revenue.',
    targetBusinessId: 'oil-company',
    multiplier: new Decimal(2),
    cost: new Decimal(12000000),
    threshold: 25
  },
  {
    id: 'oil-boost-2',
    name: 'Deep Core Probes',
    description: 'Triples oil company profits.',
    targetBusinessId: 'oil-company',
    multiplier: new Decimal(3),
    cost: new Decimal(60000000),
    threshold: 100
  },
  {
    id: 'resort-boost-1',
    name: 'Zero-G Concierge',
    description: 'Doubles resort profits.',
    targetBusinessId: 'galactic-resort',
    multiplier: new Decimal(2),
    cost: new Decimal(250000000),
    threshold: 25
  },
  {
    id: 'resort-boost-2',
    name: 'Orbital Marketing',
    description: 'Triples resort profits.',
    targetBusinessId: 'galactic-resort',
    multiplier: new Decimal(3),
    cost: new Decimal(1000000000),
    threshold: 100
  },
  {
    id: 'global-branding',
    name: 'Global Branding',
    description: 'All businesses earn 1.5x more.',
    targetBusinessId: 'global',
    multiplier: new Decimal(1.5),
    cost: new Decimal(5000000),
    threshold: 0
  }
];

export const MANAGERS: ManagerDefinition[] = BUSINESSES.map((business, index) => ({
  id: `${business.id}-manager`,
  name: `${business.name} Manager`,
  description: `Automates ${business.name} production.`,
  businessId: business.id,
  cost: business.managerCost.mul(index + 1)
}));

export const PRESTIGE_TIERS: PrestigeTier[] = [
  {
    id: 'seed-1',
    name: 'Seed Investor',
    description: 'Earn 5% permanent profit boost.',
    threshold: new Decimal(1e6),
    bonusMultiplier: new Decimal(1.05)
  },
  {
    id: 'angel-1',
    name: 'Angel Syndicate',
    description: 'Earn 10% permanent boost.',
    threshold: new Decimal(5e7),
    bonusMultiplier: new Decimal(1.1)
  },
  {
    id: 'cosmic-1',
    name: 'Cosmic Visionary',
    description: 'Earn 25% permanent boost.',
    threshold: new Decimal(1e10),
    bonusMultiplier: new Decimal(1.25)
  }
];

export const BASE_TICK_MS = 200;
export const OFFLINE_CAP_HOURS = 12;
export const PRESTIGE_K = new Decimal(0.000015);
export const PRESTIGE_ALPHA = 0.7;
