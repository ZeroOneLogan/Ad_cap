/// <reference lib="webworker" />
import { createSimulationWorkerHandler, type WorkerMessage } from '@idle-tycoon/sim-core/worker';

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;
const handler = createSimulationWorkerHandler((response) => {
  ctx.postMessage(response);
});

ctx.onmessage = (event: MessageEvent<WorkerMessage>) => {
  handler(event.data);
};
