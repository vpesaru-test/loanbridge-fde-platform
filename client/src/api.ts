import { useApp } from './store';
import type { Calc, Loan, Proposal } from './store';

export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-demo-user': useApp.getState().user,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data as T;
}

export const getLoans = () => api<Loan[]>('/loans');
export const getProposals = () => api<Proposal[]>('/proposals');
export const simulate = (body: unknown) => api<Calc>('/proposals/simulate', 'POST', body);
export const createProposal = (body: unknown) => api<Proposal>('/proposals', 'POST', body);
export const action = (id: string, verb: string, body?: unknown) =>
  api<Proposal>(`/proposals/${id}/${verb}`, 'POST', body);
