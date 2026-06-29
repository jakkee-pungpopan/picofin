import { toSatang, toTHB, formatTHB } from './money';

describe('money utils', () => {
  it('converts THB to satang (integer, no float drift)', () => {
    expect(toSatang(100.5)).toBe(BigInt(10050));
    expect(toSatang(0.1)).toBe(BigInt(10));
  });
  it('converts satang back to THB', () => {
    expect(toTHB(BigInt(10050))).toBe(100.5);
  });
  it('formats THB with 2 decimals', () => {
    expect(formatTHB(BigInt(150000))).toBe('1,500.00');
  });
});
