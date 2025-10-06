import { BUSINESSES } from '../src/economy/economy';
import { calculatePurchaseCost } from '../src/features/businesses';

const levels = [1, 10, 25, 50, 100, 250];

console.log('business,owned,cost_next');
for (const business of BUSINESSES) {
  for (const owned of levels) {
    const cost = calculatePurchaseCost(business.id, owned, 1);
    console.log(`${business.id},${owned},${cost.toFixed(2)}`);
  }
}
