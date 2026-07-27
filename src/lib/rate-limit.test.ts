import { describe, expect, it, vi } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit and blocks the next one in the same window", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
    }
    const blocked = rateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets once the window elapses", () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, { limit: 1, windowMs: 1000 }).allowed).toBe(true);
    expect(rateLimit(key, { limit: 1, windowMs: 1000 }).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, { limit: 1, windowMs: 1000 }).allowed).toBe(true);
    vi.useRealTimers();
  });

  it("tracks separate keys independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, { limit: 1, windowMs: 60_000 }).allowed).toBe(true);
    expect(rateLimit(b, { limit: 1, windowMs: 60_000 }).allowed).toBe(true);
    expect(rateLimit(a, { limit: 1, windowMs: 60_000 }).allowed).toBe(false);
  });
});
