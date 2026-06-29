/* PicoFin core math + compliance. Money in satang (integer). DEMO ONLY. */

export type PicoType = 'PICO' | 'PICO_PLUS';

// Regulatory caps (verify against latest กระทรวงการคลัง announcements before production).
export const PICO_RULES = {
  PICO:      { maxPrincipalTHB: 50000,  maxAnnualRatePct: 36 }, // unsecured cap 36%
  PICO_PLUS: { maxPrincipalTHB: 100000, maxAnnualRatePct: 28 },
} as const;

export interface ComplianceInput {
  picoType: PicoType;
  principalTHB: number;
  annualRatePct: number;
  borrowerProvince: string;
  operatorProvince: string;
  termMonths: number;
}
export interface ComplianceResult { ok: boolean; violations: string[]; }

export function checkCompliance(i: ComplianceInput): ComplianceResult {
  const r = PICO_RULES[i.picoType];
  const v: string[] = [];
  if (!(i.principalTHB > 0)) v.push('วงเงินต้องมากกว่า 0');
  if (i.principalTHB > r.maxPrincipalTHB) v.push(`วงเงินเกินเพดาน ${i.picoType} (${r.maxPrincipalTHB.toLocaleString()} บาท)`);
  if (i.annualRatePct < 0) v.push('อัตราดอกเบี้ยติดลบไม่ได้');
  if (i.annualRatePct > r.maxAnnualRatePct) v.push(`ดอกเบี้ยเกินเพดาน ${r.maxAnnualRatePct}% ต่อปี`);
  if (i.borrowerProvince.trim() !== i.operatorProvince.trim())
    v.push('ผู้กู้ต้องมีภูมิลำเนาจังหวัดเดียวกับผู้ประกอบการ (เงื่อนไขพิโก)');
  if (!(i.termMonths >= 1 && i.termMonths <= 60)) v.push('จำนวนงวดต้องอยู่ระหว่าง 1–60 เดือน');
  return { ok: v.length === 0, violations: v };
}

export interface Installment {
  no: number; dueOffsetMonths: number;
  principal: number; interest: number; total: number; balanceAfter: number; // all in satang
}

/**
 * Reducing-balance amortization with equal monthly installments (effective annual rate).
 * Returns schedule in satang. monthlyRate = annual/12.
 */
export function buildSchedule(principalSatang: number, annualRatePct: number, termMonths: number): Installment[] {
  const P = Math.round(principalSatang);
  const i = annualRatePct / 100 / 12;
  let pay: number;
  if (i === 0) pay = Math.round(P / termMonths);
  else pay = Math.round((P * i) / (1 - Math.pow(1 + i, -termMonths)));
  const out: Installment[] = [];
  let bal = P;
  for (let n = 1; n <= termMonths; n++) {
    let interest = Math.round(bal * i);
    let principalPart = pay - interest;
    if (n === termMonths) { principalPart = bal; pay = bal + interest; } // settle remainder exactly
    bal -= principalPart;
    out.push({ no: n, dueOffsetMonths: n, principal: principalPart, interest, total: principalPart + interest, balanceAfter: Math.max(bal, 0) });
  }
  return out;
}

export function scheduleTotals(s: Installment[]) {
  const principal = s.reduce((a, x) => a + x.principal, 0);
  const interest = s.reduce((a, x) => a + x.interest, 0);
  return { principal, interest, total: principal + interest };
}
