import '@testing-library/jest-dom';

// Mock Web Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  postMessage(data: any) {
    // Mock implementation
  }
  
  terminate() {
    // Mock implementation
  }
}

global.Worker = MockWorker as any;