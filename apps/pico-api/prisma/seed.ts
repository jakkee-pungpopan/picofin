/* PicoFin seed - DEMO. Operator lends from own capital; no public deposits. */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PicoFin demo...');
  // Operator config (the licensed Pico business)
  const op = await prisma.operator.findFirst();
  if (!op) {
    await prisma.operator.create({
      data: { name: 'พิโกไฟแนนซ์ เชียงใหม่ (ตัวอย่าง)', picoType: 'PICO', province: 'บุรีรัมย์',
        licenseNo: 'PICO-DEMO-0001', registeredCapital: BigInt(5_000_000_00) }, // 5,000,000 บาท
    });
  }

  const pw = await bcrypt.hash('Password@123', 10);
  await prisma.user.upsert({ where: { email: 'owner@picofin.local' }, update: {},
    create: { email: 'owner@picofin.local', fullName: 'เจ้าของกิจการ', passwordHash: pw, role: 'OPERATOR' } });
  await prisma.user.upsert({ where: { email: 'staff@picofin.local' }, update: {},
    create: { email: 'staff@picofin.local', fullName: 'พนักงานสินเชื่อ', passwordHash: pw, role: 'STAFF' } });

  // Demo borrower (same province as operator)
  const borrowerUser = await prisma.user.upsert({ where: { email: 'somchai@picofin.local' }, update: {},
    create: { email: 'somchai@picofin.local', fullName: 'สมชาย ใจดี', passwordHash: pw, role: 'BORROWER',
      borrower: { create: { fullName: 'สมชาย ใจดี', nationalId: '1100700123456', province: 'บุรีรัมย์', phone: '0810000001', address: 'อ.เมือง เชียงใหม่' } } },
    include: { borrower: true } });

  // A pending application ready to approve in the demo
  const b = await prisma.borrower.findUnique({ where: { userId: borrowerUser.id } });
  if (b) {
    const existing = await prisma.loanApplication.count({ where: { borrowerId: b.id } });
    if (existing === 0) {
      await prisma.loanApplication.create({ data: { borrowerId: b.id, amount: BigInt(20000_00), annualRatePct: 24, termMonths: 12, purpose: 'เงินทุนหมุนเวียนค้าขาย' } });
    }
  }

  console.log('Seed complete.');
  console.log('  ผู้ประกอบการ : owner@picofin.local / Password@123');
  console.log('  พนักงาน      : staff@picofin.local / Password@123');
  console.log('  ลูกค้า(ผู้กู้): somchai@picofin.local / Password@123');
  await prisma.operator.updateMany({ data: { province: 'บุรีรัมย์' } });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
