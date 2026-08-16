import { windowsOverlap } from './overlap';

describe('windowsOverlap', () => {
  const at = (iso: string) => new Date(iso);

  it('detects a plain overlap', () => {
    const a = { fromTime: at('2026-03-06T10:00:00Z'), toTime: at('2026-03-06T12:00:00Z') };
    const b = { fromTime: at('2026-03-06T11:00:00Z'), toTime: at('2026-03-06T13:00:00Z') };
    expect(windowsOverlap(a, b)).toBe(true);
  });

  it('detects one window fully containing another', () => {
    const a = { fromTime: at('2026-03-06T09:00:00Z'), toTime: at('2026-03-06T15:00:00Z') };
    const b = { fromTime: at('2026-03-06T10:00:00Z'), toTime: at('2026-03-06T11:00:00Z') };
    expect(windowsOverlap(a, b)).toBe(true);
  });

  it('treats back-to-back windows as non-overlapping (half-open interval)', () => {
    const a = { fromTime: at('2026-03-06T10:00:00Z'), toTime: at('2026-03-06T12:00:00Z') };
    const b = { fromTime: at('2026-03-06T12:00:00Z'), toTime: at('2026-03-06T13:00:00Z') };
    expect(windowsOverlap(a, b)).toBe(false);
  });

  it('returns false for windows with a gap between them', () => {
    const a = { fromTime: at('2026-03-06T10:00:00Z'), toTime: at('2026-03-06T11:00:00Z') };
    const b = { fromTime: at('2026-03-06T12:00:00Z'), toTime: at('2026-03-06T13:00:00Z') };
    expect(windowsOverlap(a, b)).toBe(false);
  });
});
