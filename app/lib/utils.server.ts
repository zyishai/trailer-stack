import { performance } from "node:perf_hooks";

export function startMeasurement(mark: string) {
  performance.mark(mark);
  return (message?: string) => performance.measure(message || mark, mark);
}
