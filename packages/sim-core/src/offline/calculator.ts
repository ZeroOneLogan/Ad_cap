import type { GameState, OfflineReport } from '../types';
import { simulateOffline, tick } from '../simulation/engine';

export function computeOfflineProgress(state: GameState, now: number): {
  report: OfflineReport;
  state: GameState;
} {
  const report = simulateOffline(state, now);
  const progressed = tick(state, { now: state.lastTick + report.effectiveMs, elapsedMs: report.effectiveMs });
  return { report, state: { ...progressed, lastTick: now } };
}
