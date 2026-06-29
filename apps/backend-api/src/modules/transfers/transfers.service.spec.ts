import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransfersService } from './transfers.service';

// Lightweight mocks (no DB) to test validation + atomic flow logic.
const audit = { log: jest.fn() } as any;

function buildPrisma(source: any, dest: any = null) {
  return {
    account: {
      findFirst: jest.fn().mockResolvedValue(source),
      findUnique: jest.fn().mockResolvedValue(dest),
      update: jest.fn().mockImplementation(({ data }: any) => {
        const delta = data.balance?.decrement ?? -(data.balance?.increment ?? BigInt(0));
        return Promise.resolve({ ...source, balance: source.balance - delta });
      }),
    },
    transaction: { create: jest.fn().mockResolvedValue({ id: 't1', reference: 'TXN1', createdAt: new Date() }) },
    notification: { create: jest.fn().mockResolvedValue({}) },
    $transaction: async (cb: any) => cb({
      account: { update: jest.fn().mockResolvedValue({ ...source, balance: source.balance - BigInt(10050) }) },
      transaction: { create: jest.fn().mockResolvedValue({ id: 't1', reference: 'TXN1', createdAt: new Date() }) },
    }),
  } as any;
}

describe('TransfersService', () => {
  const source = { id: 'a1', userId: 'u1', accountNumber: '111', balance: BigInt(50000) };

  it('rejects when source account not found', async () => {
    const prisma = buildPrisma(null);
    const svc = new TransfersService(prisma, audit);
    await expect(svc.create('u1', { fromAccountId: 'x', toAccountNumber: '222', amount: 10, channel: 'OTHER' } as any))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects transfer to same account', async () => {
    const prisma = buildPrisma(source);
    const svc = new TransfersService(prisma, audit);
    await expect(svc.create('u1', { fromAccountId: 'a1', toAccountNumber: '111', amount: 10, channel: 'OWN' } as any))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects insufficient balance', async () => {
    const prisma = buildPrisma(source);
    const svc = new TransfersService(prisma, audit);
    await expect(svc.create('u1', { fromAccountId: 'a1', toAccountNumber: '222', amount: 9999, channel: 'OTHER' } as any))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects amount over demo limit', async () => {
    const prisma = buildPrisma(source);
    const svc = new TransfersService(prisma, audit);
    await expect(svc.create('u1', { fromAccountId: 'a1', toAccountNumber: '222', amount: 999999, channel: 'OTHER' } as any))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('completes a valid transfer atomically', async () => {
    const prisma = buildPrisma(source);
    const svc = new TransfersService(prisma, audit);
    const res = await svc.create('u1', { fromAccountId: 'a1', toAccountNumber: '222', amount: 100.5, channel: 'OTHER' } as any);
    expect(res.success).toBe(true);
    expect(res.reference).toBeDefined();
    expect(audit.log).toHaveBeenCalled();
  });
});
