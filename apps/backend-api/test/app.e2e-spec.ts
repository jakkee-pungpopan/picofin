/**
 * NovaBank end-to-end happy path (DEMO ONLY).
 * Flow: register -> login -> GET /accounts -> POST /transfers (mock) -> GET /transactions
 *
 * Requires a running Postgres with the schema migrated. Set DATABASE_URL before running:
 *   npm run prisma:migrate && npm run test:e2e
 */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('NovaBank E2E (happy path)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let access: string;
  let refresh: string;
  let accountId: string;
  let accountNumber: string;
  const email = `e2e_${Date.now()}@novabank.local`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('registers a new customer (auto-creates a savings account)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password: 'Password@123', fullName: 'E2E Tester' })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    access = res.body.accessToken;
    refresh = res.body.refreshToken;
  });

  it('rejects login with a wrong password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'wrong' })
      .expect(401);
  });

  it('logs in successfully', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'Password@123' })
      .expect(200);
    access = res.body.accessToken;
  });

  it('lists accounts', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/accounts')
      .set('Authorization', `Bearer ${access}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    accountId = res.body[0].id;
    accountNumber = res.body[0].accountNumber;
  });

  it('blocks unauthenticated access', async () => {
    await request(app.getHttpServer()).get('/api/accounts').expect(401);
  });

  it('top-up demo balance then rejects an over-balance transfer', async () => {
    // give the new account some balance directly (demo helper, not an API)
    await prisma.account.update({ where: { id: accountId }, data: { balance: BigInt(100000) } }); // 1000 THB
    await request(app.getHttpServer())
      .post('/api/transfers')
      .set('Authorization', `Bearer ${access}`)
      .send({ fromAccountId: accountId, toAccountNumber: '9999999999', amount: 999999, channel: 'OTHER' })
      .expect(400);
  });

  it('performs a valid mock transfer and returns a receipt', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/transfers')
      .set('Authorization', `Bearer ${access}`)
      .send({ fromAccountId: accountId, toAccountNumber: '9999999999', amount: 250, channel: 'OTHER', note: 'e2e' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.reference).toBeDefined();
    expect(res.body.balanceAfter).toBe(750); // 1000 - 250
  });

  it('shows the transfer in transaction history', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/transactions')
      .set('Authorization', `Bearer ${access}`)
      .expect(200);
    const refs = res.body.map((t: any) => t.type);
    expect(refs).toContain('TRANSFER_OUT');
  });

  it('rotates the refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: refresh })
      .expect(200);
    expect(res.body.accessToken).toBeDefined();
    // old refresh token is now revoked -> reuse must fail
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: refresh })
      .expect(401);
  });
});
