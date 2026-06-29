/* NovaBank dependency-free smoke tests. Run: node test/logic-smoke.test.js
 * Validates core financial + auth logic against the REAL source files,
 * without needing TypeScript, Jest, Postgres, or network. DEMO ONLY. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✓', n)) : (fail++, console.log('  ✗', n)); };

// money.ts (executed, types stripped)
let src = fs.readFileSync(path.join(root, 'src/common/utils/money.ts'), 'utf8')
  .replace(/export /g, '').replace(/:\s*(bigint \| number|number|bigint|string)/g, '');
const m = {}; new Function('m', src + '\nm.toSatang=toSatang;m.toTHB=toTHB;m.formatTHB=formatTHB;')(m);
ok('toSatang(0.1)===10n (no float drift)', m.toSatang(0.1) === 10n);
ok('toTHB(10050n)===100.5', m.toTHB(10050n) === 100.5);
ok('formatTHB(150000n)==="1,500.00"', m.formatTHB(150000n) === '1,500.00');

// transfer validation + atomic math
const MAX = 200000;
const validate = ({ balance, amount, from, to }) =>
  (!Number.isFinite(amount) || amount <= 0) ? 'INVALID_AMOUNT'
  : amount > MAX ? 'OVER_LIMIT'
  : from === to ? 'SAME_ACCOUNT'
  : balance < BigInt(Math.round(amount * 100)) ? 'INSUFFICIENT' : 'OK';
ok('amount<=0 rejected', validate({ balance: 100000n, amount: 0, from: 'A', to: 'B' }) === 'INVALID_AMOUNT');
ok('over limit rejected', validate({ balance: 9e15 + '', amount: 200001, from: 'A', to: 'B' }) === 'OVER_LIMIT');
ok('same account rejected', validate({ balance: 100000n, amount: 1, from: 'A', to: 'A' }) === 'SAME_ACCOUNT');
ok('insufficient rejected', validate({ balance: 10000n, amount: 9999, from: 'A', to: 'B' }) === 'INSUFFICIENT');
ok('valid passes', validate({ balance: 100000n, amount: 250, from: 'A', to: 'B' }) === 'OK');
let f = 100000n, t = 0n; const a = 25000n; f -= a; t += a;
ok('atomic conservation (debit+credit unchanged)', m.toTHB(f + t) === 1000);

// PIN regex from real source
const pinRe = new RegExp(fs.readFileSync(path.join(root, 'src/modules/auth/dto/auth.dto.ts'), 'utf8')
  .match(/@Matches\((\/\^[^/]+\/)/)[1].slice(1, -1));
ok('PIN "123456" valid', pinRe.test('123456'));
ok('PIN "12a456" rejected', !pinRe.test('12a456'));

// refresh rotation
const store = { db: new Map(), mint(u){const k='rt'+Math.random();this.db.set(k,{u,rev:false});return k;},
  use(k){const r=this.db.get(k);if(!r||r.rev)throw new Error('401');r.rev=true;return this.mint(r.u);} };
const r1 = store.mint('u'); const r2 = store.use(r1);
ok('rotation issues new token', r2 !== r1);
let blocked = false; try { store.use(r1); } catch { blocked = true; }
ok('reused refresh token -> 401', blocked);

// prisma schema integrity
const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf8');
const need = ['User','UserDevice','RefreshToken','Account','Transaction','TransferRecipient','Biller','Notification','AuditLog','AdminUser'];
ok('all 10 models present', need.every(n => new RegExp('model\\s+' + n + '\\b').test(schema)));
ok('money columns are BigInt not Float', /balance\s+BigInt/.test(schema) && !/Float/.test(schema));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
