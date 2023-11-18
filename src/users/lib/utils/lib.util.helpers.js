import Crypto from 'crypto';
import dayjs from 'dayjs';
import puppeteer from 'puppeteer';
import { processOneOrNoneData, processAnyData } from '../../api/services/services.db';
import userQueries from '../../api/queries/queries.user';
import { offerLetterTemplate } from '../templates/offerLetter';
import * as S3 from '../../api/services/services.s3';
import config from '../../config';

export const generateOtp = () => Crypto.randomInt(0, 1000000).toString().padStart(6, '0');
export const generateReferralCode = (size) => {
  try {
    return Crypto.randomBytes(size).toString('hex').toUpperCase();
  } catch (error) {
    return error;
  }
};

export const generateElevenDigits = () => Crypto.randomInt(0, 10000000000).toString().padStart(11, '22');

export const generateLoanRepaymentScheduleForShop = async(existingLoanApplication, user_id, activationCharge, monthly_installment) => {
  let activationChargePlusCharges = parseFloat(activationCharge) + 100;
  let repaymentOrder = 1;
  let preOutstandingLoanAmount = parseFloat(existingLoanApplication.amount_requested) - activationCharge;
  let immediateOutstanding = parseFloat(activationCharge) + parseFloat(preOutstandingLoanAmount);

  let repaymentArray = [
    {
      loan_id: existingLoanApplication.member_loan_id ? existingLoanApplication.member_loan_id : existingLoanApplication.loan_id,
      user_id,
      repayment_order: repaymentOrder,
      principal_payment: parseFloat(parseFloat(activationCharge).toFixed(2)),
      interest_payment: 0,
      fees: 100.00,
      pre_payment_outstanding_amount: immediateOutstanding, // parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(1)),
      total_payment_amount: activationChargePlusCharges, // parseFloat(activationCharge + 100).toFixed(2),
      post_payment_outstanding_amount: parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(2)),
      proposed_payment_date: dayjs().format('YYYY-MM-DD')
    }
  ];

  let prePaymentOutstandingAmount = immediateOutstanding - activationCharge;
  let postPaymentOutstandingAmount = prePaymentOutstandingAmount - monthly_installment;
  for (let i = 1; i <= Number(existingLoanApplication.loan_tenor_in_months); i++) {
    let newRepaymentOrder = repaymentOrder + i;
    let nextInterestPayment = 0;
    const nextRepaymentDetails = {
      loan_id: existingLoanApplication.member_loan_id ? existingLoanApplication.member_loan_id : existingLoanApplication.loan_id,
      user_id,
      repayment_order: newRepaymentOrder,
      principal_payment: parseFloat(parseFloat(monthly_installment).toFixed(2)),
      interest_payment: parseFloat(parseFloat(nextInterestPayment).toFixed(2)),
      fees: 0,
      pre_payment_outstanding_amount: parseFloat(prePaymentOutstandingAmount.toFixed(2)), // parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(1)),
      total_payment_amount: parseFloat(parseFloat(monthly_installment).toFixed(2)),
      post_payment_outstanding_amount: parseFloat(postPaymentOutstandingAmount.toFixed(2)), // parseFloat(parseFloat(postOutstandingLoanAmount).toFixed(1)),
      proposed_payment_date: dayjs().add(newRepaymentOrder, 'month').format('YYYY-MM-DD')  // dayjs().add((additionalMonth * (i + 1)) * Number(repaymentOrder), 'days').format('YYYY-MM-DD')
    };
    prePaymentOutstandingAmount = postPaymentOutstandingAmount;
    postPaymentOutstandingAmount = postPaymentOutstandingAmount - monthly_installment;
    repaymentArray.push(nextRepaymentDetails);
  }
  await Promise.all([ repaymentArray ]);
  return repaymentArray;
};

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
      loan_id: existingLoanApplication.member_loan_id ? existingLoanApplication.member_loan_id : existingLoanApplication.loan_id,
      user_id,
      repayment_order: 1,
      principal_payment: parseFloat(parseFloat(firstPrincipalPayment).toFixed(2)),
      interest_payment: parseFloat(parseFloat(firstRepaymentInterest).toFixed(2)),
      fees: parseFloat(parseFloat(totalFee).toFixed(2)),
      total_payment_amount: parseFloat(parseFloat(firstRepaymentDue).toFixed(2)),
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
      loan_id: existingLoanApplication.member_loan_id ? existingLoanApplication.member_loan_id : existingLoanApplication.loan_id,
      user_id,
      repayment_order: parseFloat(parseFloat(repaymentOrder).toFixed(2)),
      principal_payment: parseFloat(parseFloat(nextPrincipalPayment).toFixed(2)),
      interest_payment: parseFloat(parseFloat(nextInterestPayment).toFixed(2)),
      fees: parseFloat(parseFloat(subsequentFee).toFixed(2)),
      total_payment_amount: parseFloat(parseFloat(nextTotalPaymentAmount).toFixed(2)),
      pre_payment_outstanding_amount: parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(1)),
      post_payment_outstanding_amount: parseFloat(parseFloat(postOutstandingLoanAmount).toFixed(1)),
      proposed_payment_date: dayjs().add(30 * Number(repaymentOrder), 'days').format('YYYY-MM-DD')
    };
    repaymentArray.push(nextRepaymentDetails);
  }
  await Promise.all([ repaymentArray ]);
  return repaymentArray;
};

export const collateUsersFcmTokens = async(users) => {
  const tokens = [];
  await Promise.all(users.map(async(user) => {
    const userFcmToken = await processOneOrNoneData(userQueries.fetchUserFcmTOken);
    if (userFcmToken?.fcm_token) {
      tokens.push(userFcmToken.fcm_token);
    }
    return user;
  }));
  await Promise.all([ tokens ]);
  return tokens;
};

export const collateUsersFcmTokensExceptAuthenticatedUser = async(users, user_id) => {
  const otherClusterMembers = await users.filter(user => user.user_id != user_id);
  const tokens = [];
  await Promise.all(otherClusterMembers.map(async(user) => {
    const userFcmToken = await processOneOrNoneData(userQueries.fetchUserFcmTOken);
    if (userFcmToken?.fcm_token) {
      tokens.push(userFcmToken.fcm_token);
    }
    return user;
  }));
  await Promise.all([ tokens ]);
  return [ tokens, otherClusterMembers ];
};

export const generateOfferLetterPDF = async(user, loanDetails) => {
  const [ userOfferLetterDetail ] = await processAnyData(userQueries.userOfferLetterDetails, [ user.user_id ]);
  const [ userOfferLetterAddressDetail ] = await processAnyData(userQueries.fetchUserOfferLetterAddressDetails, [ user.user_id ]);
  const genderType = userOfferLetterDetail.gender === 'male' ? 'Sir' : 'Ma';
  if (config.SEEDFI_NODE_ENV === 'test' || config.SEEDFI_NODE_ENV === 'development') {
    userOfferLetterDetail.bvn = '12345678910'
  }
  const loanType = loanDetails.member_loan_id ? 'Cluster' : 'Individual';
  const loanPurposeType = loanDetails.cluster_name ? `${loanDetails.cluster_name} cluster loan` : loanDetails.loan_reason;
  const houseAddressStreet = !userOfferLetterAddressDetail ? '' : `${userOfferLetterAddressDetail.house_number} ${userOfferLetterAddressDetail.street} Street,` || '';
  const houseAddressState = !userOfferLetterAddressDetail ? '' : `${userOfferLetterAddressDetail.state} State.` || '';
  const html = await offerLetterTemplate(loanDetails, userOfferLetterDetail, genderType, loanType, loanPurposeType, houseAddressStreet, houseAddressState);
  if (config.SEEDFI_NODE_ENV === 'test') {
    const data = {
      ETag: '"68bec848a3eea33f3ccfad41c1242691"',
      ServerSideEncryption: 'AES256',
      Location: 'https://photow-profile-images.s3.us-west-2.amazonaws.com/files/user-documents/user-af4921b85068ed/loan-offer-letter/pers-loan-72c4918cc7ee1c30.pdf',
      key: 'files/user-documents/user-af4922be97ef11edb0660fd1b85068ed/loan-offer-letter/pers-loan-72c4918cc7ee11eda5b8432fe1971c30.pdf',
      Key: 'files/user-documents/user-af4922be97ef11edb0660fd1b85068ed/loan-offer-letter/pers-loan-72c4918cc7ee11eda5b8432fe1971c30.pdf',
      Bucket: 'p-prof-img'
    };
    return data;
  }

  if (config.SEEDFI_NODE_ENV === 'development') {
    const data = {
      ETag: '"68bec848a3eea33f3ccfad41c1242691"',
      ServerSideEncryption: 'AES256',
      Location: 'https://photow-profile-images.s3.us-west-2.amazonaws.com/files/user-documents/user-af4921b85068ed/loan-offer-letter/pers-loan-72c4918cc7ee1c30.pdf',
      key: 'files/user-documents/user-af4922be97ef11edb0660fd1b85068ed/loan-offer-letter/pers-loan-72c4918cc7ee11eda5b8432fe1971c30.pdf',
      Key: 'files/user-documents/user-af4922be97ef11edb0660fd1b85068ed/loan-offer-letter/pers-loan-72c4918cc7ee11eda5b8432fe1971c30.pdf',
      Bucket: 'p-prof-img'
    };
    return data;
  }

  const browser = config.SEEDFI_NODE_ENV === 'production' ? await puppeteer.connect({ browserWSEndpoint: 'ws://seedfibrowser:3000'}) : await puppeteer.launch();

  const page = await browser.newPage();
  await page.setContent(html);
  await page.emulateMediaType('screen');

  const document = await page.pdf({
    format: 'a4',
    scale: 0.5,
    printBackground: true
  });

  // upload to Amazon s3
  const url = `files/user-documents/${user.user_id}/loan-offer-letter/${loanDetails.loan_id}.pdf`;
  const payload = Buffer.from(document, 'binary');
  const data  = await S3.uploadFile(url, payload, 'application/pdf');
  return data;
};

export const generateClusterLoanRepaymentSchedule = async(existingLoanApplication) => {
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
      cluster_id: existingLoanApplication.cluster_id,
      member_loan_id: existingLoanApplication.member_loan_id,
      loan_id: existingLoanApplication.loan_id,
      user_id: existingLoanApplication.user_id,
      repayment_order: 1,
      principal_payment: parseFloat(parseFloat(firstPrincipalPayment).toFixed(2)),
      interest_payment: parseFloat(parseFloat(firstRepaymentInterest).toFixed(2)),
      fees: parseFloat(parseFloat(totalFee).toFixed(2)),
      total_payment_amount: parseFloat(parseFloat(firstRepaymentDue).toFixed(2)),
      pre_payment_outstanding_amount: parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(1)),
      post_payment_outstanding_amount: parseFloat(parseFloat(postOutstandingLoanAmount).toFixed(1)),
      proposed_payment_date: dayjs().add(30, 'days').format('YYYY-MM-DD'),
      pre_reschedule_proposed_payment_date: dayjs().add(30, 'days').format('YYYY-MM-DD')
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
      cluster_id: existingLoanApplication.cluster_id,
      member_loan_id: existingLoanApplication.member_loan_id,
      loan_id: existingLoanApplication.loan_id,
      user_id: existingLoanApplication.user_id,
      repayment_order: parseFloat(parseFloat(repaymentOrder).toFixed(2)),
      principal_payment: parseFloat(parseFloat(nextPrincipalPayment).toFixed(2)),
      interest_payment: parseFloat(parseFloat(nextInterestPayment).toFixed(2)),
      fees: parseFloat(parseFloat(subsequentFee).toFixed(2)),
      total_payment_amount: parseFloat(parseFloat(nextTotalPaymentAmount).toFixed(2)),
      pre_payment_outstanding_amount: parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(1)),
      post_payment_outstanding_amount: parseFloat(parseFloat(postOutstandingLoanAmount).toFixed(1)),
      proposed_payment_date: dayjs().add(30 * Number(repaymentOrder), 'days').format('YYYY-MM-DD'),
      pre_reschedule_proposed_payment_date: dayjs().add(30 * Number(repaymentOrder), 'days').format('YYYY-MM-DD')
    };
    repaymentArray.push(nextRepaymentDetails);
  }
  await Promise.all([ repaymentArray ]);
  return repaymentArray;
};
