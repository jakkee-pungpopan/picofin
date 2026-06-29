/* PicoFin dependency-free smoke test. Run: node test/pico-smoke.test.js
 * Exercises the REAL pico.ts (types stripped) — amortization + Pico compliance caps. */
const fs=require('fs'),path=require('path');
let src=fs.readFileSync(path.join(__dirname,'../src/common/utils/pico.ts'),'utf8')
  .replace(/export interface \w+ \{[^\n]*\}\n/g,'')
  .replace(/export interface \w+ \{\n[\s\S]*?\n\}\n/g,'')
  .replace(/export type [^\n]*\n/g,'').replace(/ as const/g,'').replace(/export /g,'')
  .replace(/\):\s*[A-Za-z\[\]]+\s*\{/g,'){')
  .replace(/:\s*(ComplianceInput|ComplianceResult|Installment\[\]|Installment|PicoType|string\[\]|number|string|boolean)/g,'');
const M={};new Function('M',src+'\nM.checkCompliance=checkCompliance;M.buildSchedule=buildSchedule;M.scheduleTotals=scheduleTotals;M.PICO_RULES=PICO_RULES;')(M);
let pass=0,fail=0;const ok=(n,c)=>{c?(pass++,console.log('  ✓',n)):(fail++,console.log('  ✗',n));};
const base={picoType:'PICO',principalTHB:20000,annualRatePct:24,borrowerProvince:'เชียงใหม่',operatorProvince:'เชียงใหม่',termMonths:12};
ok('valid case passes',M.checkCompliance(base).ok);
ok('over 50,000 blocked',!M.checkCompliance({...base,principalTHB:60000}).ok);
ok('rate 40% blocked',!M.checkCompliance({...base,annualRatePct:40}).ok);
ok('different province blocked',!M.checkCompliance({...base,borrowerProvince:'กรุงเทพ'}).ok);
ok('PICO_PLUS cap 28% enforced',!M.checkCompliance({...base,picoType:'PICO_PLUS',principalTHB:80000,annualRatePct:30}).ok);
const sch=M.buildSchedule(12000*100,12,12),tot=M.scheduleTotals(sch);
ok('12 installments',sch.length===12);
ok('final balance 0',sch[11].balanceAfter===0);
ok('principal sums exactly',tot.principal===1200000);
ok('every total=principal+interest',sch.every(x=>x.total===x.principal+x.interest));
ok('0% interest divides evenly',M.scheduleTotals(M.buildSchedule(1200000,0,12)).interest===0);
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);process.exit(fail?1:0);
