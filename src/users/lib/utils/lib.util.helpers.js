import Crypto from 'crypto';
import dayjs from 'dayjs';

export const generateOtp = () => Crypto.randomInt(0, 1000000).toString().padStart(6, '0');
export const generateReferralCode = (size) => {
  try {
    return Crypto.randomBytes(size).toString('hex').toUpperCase();
  } catch (error) {
    return error;
  }
};

export const generateElevenDigits = () => Crypto.randomInt(0, 10000000000).toString().padStart(11, '22');

export const generateLoanRepaymentSchedule = async(existingLoanApplication, user) => {
  const loanFees = [ parseFloat(existingLoanApplication.processing_fee), parseFloat(existingLoanApplication.insurance_fee), parseFloat(existingLoanApplication.advisory_fee) ];
  let totalFee = loanFees.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  let subsequentFee = 0;
  let preOutstandingLoanAmount = parseFloat(existingLoanApplication.amount_requested).toFixed(2);
  let monthlyRepayment = parseFloat(existingLoanApplication.monthly_repayment);
  let monthlyInterest = parseFloat(existingLoanApplication.monthly_interest);
  let firstRepaymentInterest = parseFloat((parseFloat(monthlyInterest) / 100) * (parseFloat(preOutstandingLoanAmount))).toFixed(2);
  let firstPrincipalPayment = parseFloat(parseFloat(monthlyRepayment) - parseFloat(firstRepaymentInterest)).toFixed(2);
  let firstRepaymentDue = parseFloat(parseFloat(firstPrincipalPayment) + parseFloat(firstRepaymentInterest) + parseFloat(totalFee)).toFixed(2);
  let postOutstandingLoanAmount = parseFloat(parseFloat(preOutstandingLoanAmount) - parseFloat(firstPrincipalPayment)).toFixed(2);
  let repaymentArray = [
    {
      loan_id: existingLoanApplication.loan_id,
      user_id: user.user_id,
      repayment_order: 1,
      principal_payment: parseFloat(firstPrincipalPayment),
      interest_payment: parseFloat(firstRepaymentInterest),
      fees: parseFloat(totalFee),
      total_payment_amount: parseFloat(firstRepaymentDue),
      pre_payment_outstanding_amount: parseFloat(preOutstandingLoanAmount),
      post_payment_outstanding_amount: parseFloat(postOutstandingLoanAmount),
      proposed_payment_date: dayjs().add(30, 'days').format('YYYY-MM-DD')
    }
  ];


  for (let i = 0; i < Number(existingLoanApplication.loan_tenor_in_months - 1); i++) {
    let repaymentOrder = 1 + i + 1;
    let nextInterestPayment = parseFloat((parseFloat(monthlyInterest) / 100) * (parseFloat(postOutstandingLoanAmount))).toFixed(2);
    let nextPrincipalPayment = parseFloat(parseFloat(monthlyRepayment) - parseFloat(nextInterestPayment)).toFixed(2);
    let nextTotalPaymentAmount = parseFloat(parseFloat(nextPrincipalPayment) + parseFloat(nextInterestPayment) + parseFloat(subsequentFee)).toFixed(2);
    preOutstandingLoanAmount = parseFloat(postOutstandingLoanAmount).toFixed(2),
    postOutstandingLoanAmount = parseFloat(parseFloat(preOutstandingLoanAmount) - parseFloat(nextPrincipalPayment)).toFixed(2);
    const nextRepaymentDetails = {
      loan_id: existingLoanApplication.loan_id,
      user_id: user.user_id,
      repayment_order: parseFloat(repaymentOrder),
      principal_payment: parseFloat(nextPrincipalPayment),
      interest_payment: parseFloat(nextInterestPayment),
      fees: parseFloat(subsequentFee),
      total_payment_amount: parseFloat(nextTotalPaymentAmount),
      pre_payment_outstanding_amount: parseFloat(preOutstandingLoanAmount),
      post_payment_outstanding_amount: parseFloat(postOutstandingLoanAmount),
      proposed_payment_date: dayjs().add(30 * Number(repaymentOrder), 'days').format('YYYY-MM-DD')
    };
    repaymentArray.push(nextRepaymentDetails);
  }
  await Promise.all([ repaymentArray ]);
  return repaymentArray;
};
