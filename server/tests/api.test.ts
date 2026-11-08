import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { payment } from '../src/engine.js';

describe('loan restructuring', () => {
  it('calculates amortization', () => {
    expect(payment(15000, 12, 36)).toBe(498.21);
    expect(payment(1200, 0, 12)).toBe(100);
  });

  it('blocks delinquent loans', async () => {
    const response = await request(createApp())
      .post('/api/proposals/simulate')
      .send({ loanId: 'PL-100247', proposedApr: 9, proposedMonths: 48, reason: 'Payment relief' });

    expect(response.status).toBe(422);
  });

  it('requires separate manager approval and executes idempotently', async () => {
    const app = createApp();
    const data = {
      loanId: 'PL-100245',
      proposedApr: 9,
      proposedMonths: 48,
      reason: 'Payment relief',
    };

    const created = await request(app).post('/api/proposals').send(data);
    expect(created.status).toBe(201);

    const id = created.body.id;

    expect((await request(app).post(`/api/proposals/${id}/execute`)).status).toBe(409);
    expect((await request(app).post(`/api/proposals/${id}/submit-for-approval`)).status).toBe(200);
    expect((await request(app).post(`/api/proposals/${id}/decision`).send({ decision: 'APPROVED' })).status).toBe(403);
    expect(
      (await request(app)
        .post(`/api/proposals/${id}/decision`)
        .set('x-demo-user', 'manager')
        .send({ decision: 'APPROVED' })).status,
    ).toBe(200);

    const first = await request(app).post(`/api/proposals/${id}/execute`);
    const second = await request(app).post(`/api/proposals/${id}/execute`);

    expect(first.body.externalRef).toBe(second.body.externalRef);
    expect(first.body.status).toBe('COMPLETED');
  });
});
