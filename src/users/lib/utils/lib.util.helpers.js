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

export const generateLoanRepaymentSchedule = async(existingLoanApplication, user_id) => {
  const loanFees = [ parseFloat(existingLoanApplication.processing_fee), parseFloat(existingLoanApplication.insurance_fee), parseFloat(existingLoanApplication.advisory_fee) ];
  let totalFee = loanFees.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  let subsequentFee = 0;
  let preOutstandingLoanAmount = parseFloat(existingLoanApplication.amount_requested);
  let monthlyRepayment = parseFloat(existingLoanApplication.monthly_repayment);
  let monthlyInterest = parseFloat(existingLoanApplication.monthly_interest);
  let firstRepaymentInterest = parseFloat((parseFloat(monthlyInterest) / 100) * (parseFloat(preOutstandingLoanAmount)));
  let firstPrincipalPayment = parseFloat(parseFloat(monthlyRepayment) - parseFloat(firstRepaymentInterest));
  let firstRepaymentDue = parseFloat(parseFloat(firstPrincipalPayment) + parseFloat(firstRepaymentInterest) + parseFloat(totalFee));
  let postOutstandingLoanAmount = parseFloat(parseFloat(preOutstandingLoanAmount) - parseFloat(firstPrincipalPayment));
  let repaymentArray = [
    {
      loan_id: existingLoanApplication.loan_id,
      user_id,
      repayment_order: 1,
      principal_payment: parseFloat(parseFloat(firstPrincipalPayment).toFixed(1)),
      interest_payment: parseFloat(parseFloat(firstRepaymentInterest).toFixed(1)),
      fees: parseFloat(parseFloat(totalFee).toFixed(1)),
      total_payment_amount: parseFloat(parseFloat(firstRepaymentDue).toFixed(1)),
      pre_payment_outstanding_amount: parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(1)),
      post_payment_outstanding_amount: parseFloat(parseFloat(postOutstandingLoanAmount).toFixed(1)),
      proposed_payment_date: dayjs().add(30, 'days').format('YYYY-MM-DD')
    }
  ];


  for (let i = 0; i < Number(existingLoanApplication.loan_tenor_in_months - 1); i++) {
    let repaymentOrder = 1 + i + 1;
    let nextInterestPayment = parseFloat((parseFloat(monthlyInterest) / 100) * (parseFloat(postOutstandingLoanAmount)));
    let nextPrincipalPayment = parseFloat(parseFloat(monthlyRepayment) - parseFloat(nextInterestPayment));
    let nextTotalPaymentAmount = parseFloat(parseFloat(nextPrincipalPayment) + parseFloat(nextInterestPayment) + parseFloat(subsequentFee));
    preOutstandingLoanAmount = parseFloat(postOutstandingLoanAmount);
    postOutstandingLoanAmount = parseFloat(parseFloat(preOutstandingLoanAmount) - parseFloat(nextPrincipalPayment));
    const nextRepaymentDetails = {
      loan_id: existingLoanApplication.loan_id,
      user_id,
      repayment_order: parseFloat(parseFloat(repaymentOrder).toFixed(1)),
      principal_payment: parseFloat(parseFloat(nextPrincipalPayment).toFixed(1)),
      interest_payment: parseFloat(parseFloat(nextInterestPayment).toFixed(1)),
      fees: parseFloat(parseFloat(subsequentFee).toFixed(1)),
      total_payment_amount: parseFloat(parseFloat(nextTotalPaymentAmount).toFixed(1)),
      pre_payment_outstanding_amount: parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(1)),
      post_payment_outstanding_amount: parseFloat(parseFloat(postOutstandingLoanAmount).toFixed(1)),
      proposed_payment_date: dayjs().add(30 * Number(repaymentOrder), 'days').format('YYYY-MM-DD')
    };
    repaymentArray.push(nextRepaymentDetails);
  }
  await Promise.all([ repaymentArray ]);
  return repaymentArray;
};
