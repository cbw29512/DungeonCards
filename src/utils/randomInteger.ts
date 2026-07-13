export type RandomIntegerSource = (minimum: number, maximum: number) => number;

const UINT32_RANGE = 0x100000000;

export const secureRandomInteger: RandomIntegerSource = (minimum, maximum) => {
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || maximum < minimum) {
    throw new Error("Random integer bounds must be safe integers in ascending order.");
  }

  const span = maximum - minimum + 1;

  if (span > UINT32_RANGE) {
    throw new Error("Random integer range is too large.");
  }

  const cryptoApi = globalThis.crypto;

  if (!cryptoApi?.getRandomValues) {
    throw new Error("Secure randomness is not available in this environment.");
  }

  const acceptedLimit = Math.floor(UINT32_RANGE / span) * span;
  const buffer = new Uint32Array(1);
  let value = UINT32_RANGE;

  while (value >= acceptedLimit) {
    cryptoApi.getRandomValues(buffer);
    value = buffer[0];
  }

  return minimum + (value % span);
};