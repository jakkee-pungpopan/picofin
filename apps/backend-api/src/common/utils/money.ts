// All balances/amounts are stored in satang (integer). 1 THB = 100 satang.
export const toSatang = (thb: number): bigint => BigInt(Math.round(thb * 100));
export const toTHB = (satang: bigint | number): number => Number(satang) / 100;
export const formatTHB = (satang: bigint | number): string =>
  toTHB(satang).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
