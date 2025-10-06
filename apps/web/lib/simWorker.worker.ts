/// <reference lib="webworker" />
import { createSimulationWorkerHandler } from '@idle-tycoon/sim-core/worker';

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;
const handler = createSimulationWorkerHandler((response) => {
  ctx.postMessage(response);
});

ctx.onmessage = (event) => {
  handler(event.data as any);
};
