import Decimal from 'decimal.js';

const SUFFIXES = ['K', 'M', 'B', 'T'];

export function formatCurrency(value: Decimal | number, locale = 'en-US'): string {
  const decimal = Decimal.isDecimal(value) ? value : new Decimal(value);
  if (decimal.lt(1000)) {
    return decimal.toNumber().toLocaleString(locale, {
      maximumFractionDigits: 2
    });
  }
  let reduced = decimal;
  let exponent = 0;
  while (reduced.gte(1000)) {
    reduced = reduced.div(1000);
    exponent += 1;
  }
  const suffix = exponent <= SUFFIXES.length ? SUFFIXES[exponent - 1] : alphabetSuffix(exponent - SUFFIXES.length);
  return `${reduced.toFixed(2)}${suffix}`;
}

function alphabetSuffix(index: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let suffix = '';
  let current = index;
  while (current > 0) {
    current -= 1;
    suffix = alphabet[current % alphabet.length] + suffix;
    current = Math.floor(current / alphabet.length);
  }
  return suffix;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}
