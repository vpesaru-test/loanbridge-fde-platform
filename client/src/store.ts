import { create } from 'zustand';

export type Loan = {
  id: string;
  borrower: string;
  principal: number;
  apr: number;
  months: number;
  status: string;
  source: string;
  version: number;
};

export type Calc = {
  currentPayment: number;
  proposedPayment: number;
  monthlySavings: number;
  currentRemainingInterest: number;
  proposedRemainingInterest: number;
};

export type Proposal = {
  id: string;
  loanId: string;
  status: string;
  proposedApr: number;
  proposedMonths: number;
  reason: string;
  calculation: Calc;
  createdAt: string;
  externalRef?: string;
};

type State = {
  selected: string;
  setSelected: (v: string) => void;
  user: string;
  setUser: (v: string) => void;
  page: string;
  setPage: (v: string) => void;
};

export const useApp = create<State>((set) => ({
  selected: 'PL-100245',
  setSelected: (selected) => set({ selected }),
  user: 'analyst',
  setUser: (user) => set({ user }),
  page: 'workspace',
  setPage: (page) => set({ page }),
}));