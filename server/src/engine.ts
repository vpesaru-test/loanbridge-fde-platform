export function payment(principal:number, apr:number, months:number):number {
 if(!Number.isFinite(principal)||principal<=0||!Number.isFinite(apr)||apr<0||!Number.isInteger(months)||months<1) throw new Error('Invalid loan terms');
 const r=apr/1200;
 return Math.round((r===0 ? principal/months : principal*r/(1-Math.pow(1+r,-months)))*100)/100;
}
export function simulate(principal:number,currentApr:number,currentMonths:number,newApr:number,newMonths:number){
 const currentPayment=payment(principal,currentApr,currentMonths);
 const proposedPayment=payment(principal,newApr,newMonths);
 return {currentPayment,proposedPayment,monthlySavings:Math.round((currentPayment-proposedPayment)*100)/100,currentRemainingInterest:Math.round((currentPayment*currentMonths-principal)*100)/100,proposedRemainingInterest:Math.round((proposedPayment*newMonths-principal)*100)/100};
}
