/* NovaBank seed data - DEMO ONLY. Do not use for real financial transactions. */
import { PrismaClient, AccountType, TxnType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function acctNo(): string {
  return Math.floor(1000000000 + Math.random() * 8999999999).toString();
}
function ref(): string {
  return 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function main() {
  console.log('Seeding NovaBank demo data...');

  // ----- Admin users -----
  const adminPw = await bcrypt.hash('Admin@123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@novabank.local' },
    update: {},
    create: { email: 'admin@novabank.local', fullName: 'Nova Super Admin', passwordHash: adminPw, role: 'SUPER_ADMIN' },
  });

  // ----- Demo customer -----
  const pw = await bcrypt.hash('Password@123', 10);
  const pin = await bcrypt.hash('123456', 10);

  const somchai = await prisma.user.upsert({
    where: { email: 'somchai@novabank.local' },
    update: {},
    create: {
      email: 'somchai@novabank.local',
      phone: '0810000001',
      fullName: 'Somchai Demo',
      passwordHash: pw,
      pinHash: pin,
      biometricEnabled: true,
      accounts: {
        create: [
          { accountNumber: acctNo(), type: AccountType.SAVINGS, name: 'Savings Account', balance: BigInt(2_500_00), isPrimary: true },
          { accountNumber: acctNo(), type: AccountType.CURRENT, name: 'Current Account', balance: BigInt(15_000_00) },
        ],
      },
    },
    include: { accounts: true },
  });

  const malee = await prisma.user.upsert({
    where: { email: 'malee@novabank.local' },
    update: {},
    create: {
      email: 'malee@novabank.local',
      phone: '0810000002',
      fullName: 'Malee Demo',
      passwordHash: pw,
      pinHash: pin,
      accounts: { create: [{ accountNumber: acctNo(), type: AccountType.SAVINGS, name: 'Savings Account', balance: BigInt(8_000_00), isPrimary: true }] },
    },
    include: { accounts: true },
  });

  // ----- Recipients -----
  await prisma.transferRecipient.createMany({
    data: [
      { userId: somchai.id, nickname: 'Malee', accountNumber: malee.accounts[0].accountNumber, isFavorite: true },
      { userId: somchai.id, nickname: 'Mom PromptPay', accountNumber: '0820000099', promptPayId: '0820000099' },
    ],
    skipDuplicates: true,
  });

  // ----- Billers -----
  await prisma.biller.createMany({
    data: [
      { code: 'MEA', name: 'Metropolitan Electricity', category: 'UTILITY' },
      { code: 'PWA', name: 'Provincial Waterworks', category: 'UTILITY' },
      { code: 'TRUE', name: 'TrueMove Mobile', category: 'TELECOM' },
      { code: 'AIS', name: 'AIS Mobile', category: 'TELECOM' },
    ],
    skipDuplicates: true,
  });

  // ----- Sample transaction history -----
  const primary = somchai.accounts[0];
  await prisma.transaction.create({
    data: { reference: ref(), type: TxnType.TOPUP, amount: BigInt(1_000_00), description: 'Initial top-up', toAccountId: primary.id, balanceAfter: primary.balance },
  });
  await prisma.transaction.create({
    data: { reference: ref(), type: TxnType.TRANSFER_OUT, amount: BigInt(250_00), description: 'Coffee split', fromAccountId: primary.id, counterparty: malee.accounts[0].accountNumber, balanceAfter: primary.balance },
  });

  // ----- Notifications -----
  await prisma.notification.createMany({
    data: [
      { userId: somchai.id, title: 'Welcome to NovaBank', body: 'This is a demo banking system. Do not use for real financial transactions.', type: 'SYSTEM' },
      { userId: somchai.id, title: 'Money received', body: 'You received THB 1,000.00', type: 'TRANSACTION' },
    ],
  });

  console.log('Seed complete.');
  console.log('  Customer login : somchai@novabank.local / Password@123  (PIN 123456)');
  console.log('  Admin login    : admin@novabank.local / Admin@123');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
