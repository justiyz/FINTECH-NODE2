import dayjs from 'dayjs';

export default {
  fetchLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.tier,
    query.loan_reason,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.tier,
    query.loan_reason
  ],

  fetchRepaidLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.start_date,
    query.end_date,
    query.tier,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllRepaidLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.start_date,
    query.end_date,
    query.tier
  ],

  fetchRepaidClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllRepaidClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.start_date,
    query.end_date
  ],

  fetchRescheduledLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.tier,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllRescheduledLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.tier
  ],

  fetchRescheduledClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllRescheduledClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date
  ],

  fetchClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date
  ],
  fetchInReviewClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllInReviewClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date
  ],

  createManualLoan: (body, totalRepayment, totalInterest, totalOutstandingAmount, monthlyInterest, processingFeeValue,
    insuranceFeeValue, advisoryFeeValue, monthlyRepayment) => [
    body.user_id, 
    body.loan_amount, 
    body.loan_reason, 
    body.loan_tenor, 
    totalRepayment, 
    totalInterest, 
    body.interest_rate,  // same as the price_band
    body.processing_fee, 
    body.insurance_fee, 
    body.advisory_fee, 
    monthlyInterest,
    processingFeeValue,
    insuranceFeeValue,
    advisoryFeeValue,
    monthlyRepayment,
    body.loan_decision,
    body.loan_disbursed,
    body.loan_disbursement_date,
    totalOutstandingAmount,
    body.loan_status,
    body.initial_amount_requested,
    body.initial_loan_tenor,
    body.loan_disbursement_date
  ],

  createPreApprovedLoan: (body, totalRepayment, totalInterest, totalOutstandingAmount, monthlyInterest, processingFeeValue, 
    insuranceFeeValue, advisoryFeeValue, monthlyRepayment) => [
    body.user_id, 
    body.loan_amount, 
    body.loan_reason, 
    body.loan_tenor, 
    totalRepayment, 
    totalInterest, 
    body.interest_rate,  // same as the price_band
    body.processing_fee, 
    body.insurance_fee, 
    body.advisory_fee, 
    monthlyInterest,
    processingFeeValue,
    insuranceFeeValue,
    advisoryFeeValue,
    monthlyRepayment,
    'manual',
    false,
    null,
    totalOutstandingAmount,
    'approved',
    body.loan_amount, 
    body.loan_tenor, 
    dayjs()
  ],

  recordLoanDisbursementPaymentHistory: (body, loan_id) => [
    body.user_id,
    body.loan_amount,
    'manual loan',
    null,
    'full loan disbursement',
    'loan disbursement',
    loan_id
  ],

  recordPersonalLoanDisbursement: (body, loan_id, payment_id, userName) => [
    body.user_id,
    loan_id,
    body.loan_amount,
    payment_id,
    null,
    userName,
    'manual loan',
    null,
    null,
    null,
    'success'
  ]
};
