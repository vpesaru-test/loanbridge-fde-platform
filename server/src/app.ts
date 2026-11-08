import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { simulate } from './engine.js';

export type Loan={id:string,borrower:string,principal:number,apr:number,months:number,status:'ACTIVE'|'DELINQUENT'|'CLOSED',version:number,source:string};
type Proposal={id:string,loanId:string,createdBy:string,proposedApr:number,proposedMonths:number,reason:string,status:'DRAFT'|'PENDING_APPROVAL'|'APPROVED'|'REJECTED'|'COMPLETED'|'RECONCILIATION_REQUIRED',calculation:ReturnType<typeof simulate>,loanVersion:number,createdAt:string,externalRef?:string};
type Audit={id:string,proposalId:string,action:string,actor:string,at:string,details?:string};
const initialLoans:Loan[]=[
 {id:'PL-100245',borrower:'Jordan Lee',principal:15000,apr:12,months:36,status:'ACTIVE',version:1,source:'LEGACY_CORE'},
 {id:'PL-100246',borrower:'Taylor Morgan',principal:22500,apr:14.5,months:48,status:'ACTIVE',version:1,source:'LEGACY_CORE'},
 {id:'PL-100247',borrower:'Alex Rivera',principal:8500,apr:10.2,months:24,status:'DELINQUENT',version:1,source:'LEGACY_CORE'},
 {id:'PL-100248',borrower:'Casey Patel',principal:32000,apr:8.9,months:60,status:'ACTIVE',version:1,source:'LEGACY_CORE'},
 {id:'PL-100249',borrower:'Sam Brooks',principal:5000,apr:7.5,months:12,status:'CLOSED',version:1,source:'LEGACY_CORE'}
];
const terms=z.object({loanId:z.string(),proposedApr:z.number().min(0).max(30),proposedMonths:z.number().int().min(6).max(84),reason:z.string().min(3).max(200)});
const actor=(req:express.Request)=>String(req.header('x-demo-user')||'analyst');
export function createApp(){
 const app=express();app.use(cors());app.use(express.json());
 const loans=initialLoans.map(x=>({...x}));const proposals=new Map<string,Proposal>();const audits:Audit[]=[];
 const audit=(proposalId:string,action:string,who:string,details?:string)=>audits.push({id:randomUUID(),proposalId,action,actor:who,at:new Date().toISOString(),details});
 const getProposal=(req:express.Request,res:express.Response)=>{const p=proposals.get(req.params.id);if(!p){res.status(404).json({error:'Proposal not found'});return null;}return p;};
 app.get('/api/health',(_req,res)=>res.json({status:'ok',mode:'synthetic-demo'}));
 app.get('/api/loans',(_req,res)=>res.json(loans));
 app.get('/api/loans/:id',(req,res)=>{const l=loans.find(x=>x.id===req.params.id);if(!l)return res.status(404).json({error:'Loan not found'});res.json(l);});
 app.post('/api/loans/:id/validate',(req,res)=>{const l=loans.find(x=>x.id===req.params.id);if(!l)return res.status(404).json({error:'Loan not found'});const issues=l.status==='ACTIVE'?[]:['Only ACTIVE loans are eligible for this demo'];res.json({eligible:issues.length===0,issues});});
 app.post('/api/proposals/simulate',(req,res)=>{const parsed=terms.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid proposal',issues:parsed.error.flatten()});const d=parsed.data;const l=loans.find(x=>x.id===d.loanId);if(!l)return res.status(404).json({error:'Loan not found'});if(l.status!=='ACTIVE')return res.status(422).json({error:'Loan not eligible for restructuring'});res.json({loanId:l.id,loanVersion:l.version,...simulate(l.principal,l.apr,l.months,d.proposedApr,d.proposedMonths)});});
 app.get('/api/proposals',(_req,res)=>res.json([...proposals.values()].reverse()));
 app.post('/api/proposals',(req,res)=>{const parsed=terms.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid proposal',issues:parsed.error.flatten()});const d=parsed.data;const l=loans.find(x=>x.id===d.loanId);if(!l)return res.status(404).json({error:'Loan not found'});if(l.status!=='ACTIVE')return res.status(422).json({error:'Loan not eligible'});const p:Proposal={id:randomUUID(),loanId:l.id,createdBy:actor(req),proposedApr:d.proposedApr,proposedMonths:d.proposedMonths,reason:d.reason,status:'DRAFT',loanVersion:l.version,calculation:simulate(l.principal,l.apr,l.months,d.proposedApr,d.proposedMonths),createdAt:new Date().toISOString()};proposals.set(p.id,p);audit(p.id,'CREATED',actor(req));res.status(201).json(p);});
 app.get('/api/proposals/:id',(req,res)=>{const p=getProposal(req,res);if(p)res.json(p);});
 app.post('/api/proposals/:id/submit-for-approval',(req,res)=>{const p=getProposal(req,res);if(!p)return;if(p.status!=='DRAFT')return res.status(409).json({error:'Only draft proposals can be submitted'});p.status='PENDING_APPROVAL';audit(p.id,'SUBMITTED_FOR_APPROVAL',actor(req));res.json(p);});
 app.post('/api/proposals/:id/decision',(req,res)=>{const p=getProposal(req,res);if(!p)return;const who=actor(req);if(who!=='manager')return res.status(403).json({error:'Manager role required'});if(who===p.createdBy)return res.status(403).json({error:'Creator cannot approve own proposal'});if(p.status!=='PENDING_APPROVAL')return res.status(409).json({error:'Proposal is not pending approval'});if(!['APPROVED','REJECTED'].includes(req.body?.decision))return res.status(400).json({error:'Decision must be APPROVED or REJECTED'});p.status=req.body.decision;audit(p.id,p.status,who);res.json(p);});
 app.post('/api/proposals/:id/execute',(req,res)=>{const p=getProposal(req,res);if(!p)return;if(p.status==='COMPLETED')return res.json(p);if(p.status!=='APPROVED'&&p.status!=='RECONCILIATION_REQUIRED')return res.status(409).json({error:'Proposal must be approved'});const l=loans.find(x=>x.id===p.loanId)!;if(l.version!==p.loanVersion)return res.status(409).json({error:'Source loan changed. Re-simulate before execution'});if(req.header('x-simulate-timeout')==='true'){p.status='RECONCILIATION_REQUIRED';audit(p.id,'SUBMISSION_OUTCOME_UNKNOWN',actor(req));return res.status(504).json({error:'Mock platform timeout. Reconcile status before retrying'});}p.status='COMPLETED';p.externalRef='MOD-'+p.id.slice(0,8).toUpperCase();audit(p.id,'EXECUTED',actor(req),p.externalRef);res.json(p);});
 app.get('/api/proposals/:id/audit',(req,res)=>{const p=getProposal(req,res);if(p)res.json(audits.filter(x=>x.proposalId===p.id));});
 app.post('/api/proposals/:id/explain',(req,res)=>{const p=getProposal(req,res);if(!p)return;const c=p.calculation;const direction=c.monthlySavings>=0?'decreases':'increases';res.json({provider:'local-template-demo',text:`The proposed payment ${direction} by $${Math.abs(c.monthlySavings).toFixed(2)} per month. Estimated remaining interest changes from $${c.currentRemainingInterest.toFixed(2)} to $${c.proposedRemainingInterest.toFixed(2)}. Longer terms can reduce monthly payments while increasing total interest. This is an illustrative explanation, not an approval or financial recommendation.`});});
 app.get('/api/dashboard/summary',(_req,res)=>{const values=[...proposals.values()];res.json({loans:loans.length,proposals:values.length,pending:values.filter(x=>x.status==='PENDING_APPROVAL').length,completed:values.filter(x=>x.status==='COMPLETED').length});});
 app.use((err:Error,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(500).json({error:'Unexpected server error'}));
 return app;
}
