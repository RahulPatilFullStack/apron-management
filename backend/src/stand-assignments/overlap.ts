export interface TimeWindow {
  fromTime: Date;
  toTime: Date;
}

/**
 * Half-open interval overlap check `[fromTime, toTime)`.
 * Two windows overlap iff each starts before the other ends.
 */
export function windowsOverlap(a: TimeWindow, b: TimeWindow): boolean {
  return a.fromTime < b.toTime && b.fromTime < a.toTime;
}
