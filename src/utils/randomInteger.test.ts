import { afterEach, describe, expect, it, vi } from "vitest";
import { secureRandomInteger } from "./randomInteger";

const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");

afterEach(() => {
  vi.restoreAllMocks();
  if (originalCrypto) Object.defineProperty(globalThis, "crypto", originalCrypto);
});

describe("secureRandomInteger", () => {
  it("uses crypto randomness and never Math.random", () => {
    const mathRandom = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used by secure dice.");
    });
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {
        getRandomValues: (buffer: Uint32Array) => {
          buffer[0] = 7;
          return buffer;
        }
      }
    });

    expect(secureRandomInteger(1, 20)).toBe(8);
    expect(mathRandom).not.toHaveBeenCalled();
  });

  it("rejects uint32 values outside the evenly divisible acceptance window", () => {
    const values = [0xffffffff, 19];
    let calls = 0;
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {
        getRandomValues: (buffer: Uint32Array) => {
          buffer[0] = values[calls++] ?? 0;
          return buffer;
        }
      }
    });

    expect(secureRandomInteger(1, 20)).toBe(20);
    expect(calls).toBe(2);
  });

  it("fails closed when cryptographic randomness is unavailable", () => {
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: undefined });
    expect(() => secureRandomInteger(1, 20)).toThrow(/secure randomness is not available/i);
  });

  it("rejects unsafe or descending bounds", () => {
    expect(() => secureRandomInteger(2, 1)).toThrow(/bounds/i);
    expect(() => secureRandomInteger(0, Number.MAX_SAFE_INTEGER)).toThrow(/too large/i);
  });
});
