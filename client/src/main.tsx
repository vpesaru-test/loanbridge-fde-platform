import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Landmark,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { api, action, createProposal, getLoans, getProposals, simulate } from './api';
import { useApp, type Calc, type Loan, type Proposal } from './store';
import './index.css';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);

const navItems = [
  { id: 'workspace', label: 'Restructuring studio', icon: Calculator },
  { id: 'requests', label: 'Approval queue', icon: ClipboardCheck },
  { id: 'loans', label: 'Loan portfolio', icon: Landmark },
  { id: 'architecture', label: 'How it works', icon: BookOpen },
];

function App() {
  const { selected, setSelected, user, setUser, page, setPage } = useApp();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [apr, setApr] = useState(9);
  const [months, setMonths] = useState(48);
  const [reason, setReason] = useState('PAYMENT_RELIEF');
  const [calc, setCalc] = useState<Calc | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [explain, setExplain] = useState('');
  const [showAudit, setShowAudit] = useState('');
  const [audits, setAudits] = useState<{ action: string; actor: string; at: string }[]>([]);

  const loan = loans.find((item) => item.id === selected);

  const refresh = async () => {
    try {
      const [activeLoans, activeProposals] = await Promise.all([getLoans(), getProposals()]);
      setLoans(activeLoans);
      setProposals(activeProposals);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    setCalc(null);
    setExplain('');
    setMessage('');
  }, [selected]);

  const work = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setMessage('');

    try {
      await fn();
      await refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const payload = {
    loanId: selected,
    proposedApr: Number(apr),
    proposedMonths: Number(months),
    reason,
  };

  const runSimulation = () =>
    work(async () => {
      const nextCalc = await simulate(payload);
      setCalc(nextCalc);
      setExplain('');
      setMessage('Simulation complete. No source loan was modified.');
    });

  const save = () =>
    work(async () => {
      const proposal = await createProposal(payload);
      setMessage(`Draft saved: ${proposal.id.slice(0, 8)}`);
      setCalc(null);
    });

  const mutate = (proposal: Proposal, verb: string, body?: unknown) =>
    work(async () => {
      await action(proposal.id, verb, body);
      setMessage('Action completed successfully.');
    });

  const explainProposal = (proposal: Proposal) =>
    work(async () => {
      const result = await api<{ text: string }>(`/proposals/${proposal.id}/explain`, 'POST');
      setExplain(result.text);
    });

  const viewAudit = (proposal: Proposal) =>
    work(async () => {
      const result = await api<{ action: string; actor: string; at: string }[]>(
        `/proposals/${proposal.id}/audit`,
      );
      setAudits(result);
      setShowAudit(proposal.id);
    });

  const pageTitle =
    page === 'workspace'
      ? 'Restructuring studio'
      : page === 'requests'
        ? 'Approval queue'
        : page === 'loans'
          ? 'Loan portfolio'
          : 'Solution architecture';

  const pageSummary =
    page === 'workspace'
      ? 'Explore repayment alternatives with transparent calculations.'
      : page === 'requests'
        ? 'Track proposals from draft through execution.'
        : page === 'loans'
          ? 'Synthetic legacy loan records for integration testing.'
          : 'Understand the integration boundaries and business workflow.';

  const stats = [
    { name: 'Active loans', value: loans.filter((item) => item.status === 'ACTIVE').length, icon: Landmark },
    { name: 'Total proposals', value: proposals.length, icon: Activity },
    {
      name: 'Pending review',
      value: proposals.filter((item) => item.status === 'PENDING_APPROVAL').length,
      icon: ClipboardCheck,
    },
    {
      name: 'Completed',
      value: proposals.filter((item) => item.status === 'COMPLETED').length,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen lg:flex">
      <aside className="lg:w-64 bg-[#102238] text-white lg:min-h-screen p-5 flex flex-col">
        <div className="flex items-center gap-3 py-4 px-2">
          <div className="bg-teal-500 p-2 rounded-xl">
            <Landmark size={22} />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">LoanBridge</div>
            <div className="text-xs text-slate-400">LENDING OPERATIONS</div>
          </div>
        </div>

        <div className="mt-8 text-[11px] font-bold tracking-widest text-slate-500 px-4 mb-3">
          WORKSPACE
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`nav w-full text-left ${page === item.id ? 'nav-active' : 'hover:bg-slate-800'}`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-10">
          <div className="rounded-xl bg-slate-800 p-4">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
              <ShieldCheck size={16} />
              SYNTHETIC DATA ONLY
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Portfolio demonstration. No real borrower information or live bank connections.
            </p>
          </div>

          <div className="mt-4 text-xs text-slate-500 px-2">LoanBridge · FDE Portfolio v1.0</div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-5 md:px-10 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            Cedar Valley Regional Bank <span className="mx-2">/</span>
            <span className="text-slate-800 font-semibold">Operations Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-teal-50 text-teal-700 font-bold px-3 py-1.5 rounded-full">
              ● Demo environment
            </span>

            <label className="text-xs text-slate-500">
              Act as
              <select
                aria-label="Demo role"
                className="ml-1 border rounded-lg px-2 py-1.5 text-slate-800"
                value={user}
                onChange={(event) => setUser(event.target.value)}
              >
                <option value="analyst">Analyst</option>
                <option value="manager">Manager</option>
              </select>
            </label>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-5 md:p-10">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-8">
            <div>
              <div className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-2">
                Personal lending / Portfolio operations
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{pageTitle}</h1>
              <p className="text-slate-500 mt-2">{pageSummary}</p>
            </div>

            <button className="btn-secondary flex gap-2 items-center text-sm" onClick={() => void refresh()}>
              <RefreshCw size={15} />
              Refresh data
            </button>
          </div>

          {message && (
            <div
              role="status"
              className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 text-sm"
            >
              <AlertCircle size={17} />
              {message}
              <button onClick={() => setMessage('')} className="ml-auto font-bold">
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="panel p-5">
                  <div className="flex justify-between text-slate-500 text-xs font-semibold">
                    <span>{stat.name}</span>
                    <Icon size={17} className={index === 3 ? 'text-teal-600' : 'text-slate-400'} />
                  </div>
                  <div className="text-3xl font-extrabold mt-3">{stat.value}</div>
                </div>
              );
            })}
          </div>

          {page === 'workspace' && (
            <div className="grid xl:grid-cols-5 gap-6">
              <div className="xl:col-span-2 panel p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Landmark size={18} className="text-teal-700" />
                  <h2 className="font-bold text-lg">Loan & proposal terms</h2>
                </div>

                <label className="block text-sm font-semibold mb-2">Select legacy loan</label>
                <select className="input" value={selected} onChange={(event) => setSelected(event.target.value)}>
                  {loans.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} — {item.borrower}
                    </option>
                  ))}
                </select>

                {loan && (
                  <div className="bg-slate-50 rounded-xl p-4 my-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 text-xs">Outstanding principal</div>
                      <strong>{usd(loan.principal)}</strong>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Current APR</div>
                      <strong>{loan.apr}%</strong>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Remaining term</div>
                      <strong>{loan.months} months</strong>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Eligibility</div>
                      <strong className={loan.status === 'ACTIVE' ? 'text-teal-700' : 'text-rose-600'}>
                        {loan.status}
                      </strong>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Proposed APR (%)</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      max="30"
                      step="0.1"
                      value={apr}
                      onChange={(event) => setApr(Number(event.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Proposed remaining term (months)
                    </label>
                    <input
                      className="input"
                      type="number"
                      min="6"
                      max="84"
                      value={months}
                      onChange={(event) => setMonths(Number(event.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Reason code</label>
                    <select className="input" value={reason} onChange={(event) => setReason(event.target.value)}>
                      <option value="PAYMENT_RELIEF">PAYMENT_RELIEF</option>
                      <option value="RATE_REDUCTION">RATE_REDUCTION</option>
                      <option value="TERM_EXTENSION">TERM_EXTENSION</option>
                    </select>
                  </div>

                  <button disabled={busy} className="btn-primary w-full" onClick={runSimulation}>
                    Run simulation
                  </button>
                </div>
              </div>

              <div className="xl:col-span-3 space-y-6">
                <div className="panel p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-bold">Payment comparison</h2>
                      <p className="text-xs text-slate-500 mt-1">Illustrative fixed-rate amortization</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 text-xs rounded-full">
                      Calculated by API
                    </span>
                  </div>

                  {calc ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-5">
                          <div className="text-xs text-slate-500">Current monthly payment</div>
                          <div className="text-3xl font-extrabold mt-2">{usd(calc.currentPayment)}</div>
                        </div>

                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5">
                          <div className="text-xs text-teal-700">Proposed monthly payment</div>
                          <div className="text-3xl font-extrabold text-teal-800 mt-2">
                            {usd(calc.proposedPayment)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-slate-500">Monthly payment reduction</span>
                          <strong className={calc.monthlySavings >= 0 ? 'text-teal-700' : 'text-rose-600'}>
                            {usd(calc.monthlySavings)}
                          </strong>
                        </div>

                        <div className="flex justify-between border-b pb-3">
                          <span className="text-slate-500">Current remaining interest</span>
                          <strong>{usd(calc.currentRemainingInterest)}</strong>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Proposed remaining interest</span>
                          <strong>{usd(calc.proposedRemainingInterest)}</strong>
                        </div>
                      </div>

                      <button disabled={busy} className="btn-primary mt-6 w-full" onClick={save}>
                        Save restructuring proposal
                        <ArrowUpRight size={16} className="inline ml-1" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Calculator className="text-slate-400" />
                      </div>
                      <p className="font-semibold">Ready to compare payment options</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Choose a loan and run a simulation to see the results.
                      </p>
                    </div>
                  )}
                </div>

                <div className="panel p-6">
                  <div className="flex gap-3 items-start">
                    <Sparkles size={20} className="text-violet-600 mt-1" />
                    <div>
                      <h3 className="font-bold">AI-ready explanation service</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        The demo uses a deterministic local explanation provider. Open the approval queue and
                        select “Explain” on a saved proposal to see it. The provider can later be replaced with
                        an LLM without changing the UI.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === 'requests' && (
            <div className="panel overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-bold text-lg">Modification requests</h2>
                <p className="text-sm text-slate-500">
                  Switch roles at the top right to test approval permissions.
                </p>
              </div>

              {proposals.length === 0 ? (
                <div className="p-14 text-center text-slate-500">
                  No proposals yet. Create one in the restructuring studio.
                </div>
              ) : (
                <div className="divide-y">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="p-5 md:p-6">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <div className="font-bold">
                            {proposal.loanId}
                            <span className="font-normal text-slate-400 text-xs ml-2">
                              {proposal.id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {proposal.proposedApr}% APR · {proposal.proposedMonths} months ·{' '}
                            {usd(proposal.calculation.proposedPayment)}/mo
                          </div>
                        </div>

                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 h-fit">
                          {proposal.status.replaceAll('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          className="btn-secondary text-xs"
                          disabled={busy || proposal.status !== 'DRAFT'}
                          onClick={() => mutate(proposal, 'submit-for-approval')}
                        >
                          Submit for approval
                        </button>

                        <button
                          className="btn-secondary text-xs"
                          disabled={busy || user !== 'manager' || proposal.status !== 'PENDING_APPROVAL'}
                          onClick={() => mutate(proposal, 'decision', { decision: 'APPROVED' })}
                        >
                          Approve
                        </button>

                        <button
                          className="btn-secondary text-xs"
                          disabled={busy || user !== 'manager' || proposal.status !== 'PENDING_APPROVAL'}
                          onClick={() => mutate(proposal, 'decision', { decision: 'REJECTED' })}
                        >
                          Reject
                        </button>

                        <button
                          className="btn-primary text-xs"
                          disabled={busy || proposal.status !== 'APPROVED'}
                          onClick={() => mutate(proposal, 'execute')}
                        >
                          Execute via API
                        </button>

                        <button className="btn-secondary text-xs" disabled={busy} onClick={() => explainProposal(proposal)}>
                          <Sparkles size={13} className="inline" />
                          Explain
                        </button>

                        <button className="btn-secondary text-xs" disabled={busy} onClick={() => viewAudit(proposal)}>
                          Audit history
                        </button>
                      </div>

                      {explain && (
                        <div className="mt-4 bg-violet-50 text-violet-900 rounded-xl p-4 text-sm">
                          {explain}
                        </div>
                      )}

                      {showAudit === proposal.id && (
                        <div className="mt-4 bg-slate-50 p-4 rounded-xl">
                          <h3 className="font-bold text-sm mb-2">Audit events</h3>
                          {audits.map((audit) => (
                            <div key={`${audit.at}${audit.action}`} className="text-xs py-1">
                              {new Date(audit.at).toLocaleString()} · {audit.actor} · {audit.action}
                            </div>
                          ))}
                        </div>
                      )}

                      {proposal.externalRef && (
                        <div className="text-xs text-teal-700 mt-3">
                          Platform reference: {proposal.externalRef}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {page === 'loans' && (
            <div className="panel overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs">
                  <tr>
                    {['Loan ID', 'Borrower (synthetic)', 'Balance', 'APR', 'Remaining term', 'Status', 'Action'].map(
                      (heading) => (
                        <th key={heading} className="text-left px-5 py-4">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {loans.map((loanItem) => (
                    <tr key={loanItem.id} className="border-t">
                      <td className="px-5 py-4 font-bold">{loanItem.id}</td>
                      <td className="px-5 py-4">{loanItem.borrower}</td>
                      <td className="px-5 py-4">{usd(loanItem.principal)}</td>
                      <td className="px-5 py-4">{loanItem.apr}%</td>
                      <td className="px-5 py-4">{loanItem.months} mo</td>
                      <td className="px-5 py-4">{loanItem.status}</td>
                      <td className="px-5 py-4">
                        <button
                          className="text-teal-700 font-bold"
                          onClick={() => {
                            setSelected(loanItem.id);
                            setPage('workspace');
                          }}
                        >
                          Open →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {page === 'architecture' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="panel p-6">
                <h2 className="font-bold text-lg mb-5">System integration flow</h2>

                {[
                  'Legacy bank loan records (synthetic)',
                  'Express API: normalization and validation',
                  'Deterministic restructuring calculation',
                  'Human manager approval',
                  'Mock modern lending platform',
                  'Audit trail and confirmation',
                ].map((step, index) => (
                  <div key={step} className="flex gap-3 items-start mb-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <div className="border-b pb-4 w-full text-sm font-semibold">{step}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="panel p-6">
                  <h2 className="font-bold text-lg mb-3">What to explore</h2>
                  <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-3">
                    <li>Run a payment simulation on PL-100245.</li>
                    <li>Save a draft and submit it for approval.</li>
                    <li>Switch to Manager and approve the request.</li>
                    <li>Execute the modification and inspect its audit history.</li>
                    <li>Try PL-100247 to see an eligibility failure.</li>
                    <li>Inspect server/src/app.ts and engine.ts to understand the API.</li>
                  </ol>
                </div>

                <div className="panel p-6">
                  <h2 className="font-bold text-lg mb-2">Engineering notes</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    All data is synthetic and stored in memory. A restart resets the demo. Demo role selection is
                    not production authentication. AI explanations are deterministic mock responses. No real bank
                    systems are contacted.
                  </p>
                  <a
                    href="https://expressjs.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 text-sm font-semibold flex items-center gap-2 mt-4"
                  >
                    Learn about Express <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-10 text-xs text-slate-400">
            LoanBridge is an educational engineering prototype, not a lending decision system. Calculations exclude
            fees, arrears, and irregular schedules.
          </footer>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
