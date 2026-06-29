export const toSatang = (thb: number): bigint => BigInt(Math.round(thb * 100));
export const toTHB = (s: bigint | number): number => Number(s) / 100;
