import config from '../../../config/index';
import * as Hash from '../../utils/lib.util.hash';

export const forgotPassword = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
      Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr>
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
        Kindly reset your password using the OTP below,
        OTP expires by ${data.expirationTime} if not used. <br><br>
        Please do not share this code with anyone.
    </p>
  </td>
</tr>

<tr border="0" cellspacing="0" cellpadding="0" width="100%">
  <td style=" background-color:#f2faf1;padding: 12px 35px;width: 100%;height: 35px;border-radius: 8px;"
  align="center">
    <span style=" text-decoration: none; display: inline-block;font-family: 'Figtree';font-style: normal;font-weight: 700;
      font-size: 20px;line-height: 24px;text-align: center;color: #1a201d;letter-spacing: 3px;">
      ${data.otp}
    </span>
  </td>
</tr>

<tr>
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      If you didn't request a password reset, you can ignore this email.
    </p>
  </td>
</tr>`;

export const resetPassword = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr>
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    Your password has been successfully updated.
    </p>
  </td>
</tr>

<tr border="0" cellspacing="0" cellpadding="0" width="100%">

<tr>
  <td style="padding-bottom: 40px">
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    if you didn’t initiate password reset, kindly reach out to support.
    </p>
  </td>
</tr>`;

export const changePassword = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr>
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    Your password has been changed successfully.
    </p>
  </td>
</tr>

<tr border="0" cellspacing="0" cellpadding="0" width="100%">

<tr>
  <td style="padding-bottom: 40px">
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    if you didn’t initiate change password, kindly reach out to support.
    </p>
  </td>
</tr>`;

export const changePin = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr>
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    Your pin has been changed successfully.
    </p>
  </td>
</tr>

<tr border="0" cellspacing="0" cellpadding="0" width="100%">

<tr>
  <td style="padding-bottom: 40px">
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    if you didn’t initiate change password, kindly reach out to support.
    </p>
  </td>
</tr>`;


export const resetPin = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr>
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    Your pin has been successfully updated.
    </p>
  </td>
</tr>

<tr border="0" cellspacing="0" cellpadding="0" width="100%">

<tr>
  <td style="padding-bottom: 40px">
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    if you didn’t initiate pin reset, kindly reach out to support.
    </p>
  </td>
</tr>`;

export const verifyEmail = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr>
  <td>
   <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      Thanks for signing up on SeedFi.<br />
      We welcome you to this great lending platform. <br><br>
      Kindly sign in to verify your email.
   </p>
  </td>
</tr>
<tr>
  <td
      bgcolor="#2a8851"
      style="
        padding: 12px 35px;
        width: 180px;
        height: 35px;
        border-radius: 8px;
      "
        align="center"
    >
    <a
      href="${config.SEEDFI_BACKEND_BASE_URL}/api/v1/user/verify-email?verifyValue=${data.otp}"
        target="_blank"
        style="
          text-decoration: none;
          display: inline-block;
          font-family: 'Figtree';
          font-style: normal;
          font-weight: 700;
          font-size: 16px;
          line-height: 24px;
          text-align: center;
          color: #ffffff;
        ">
        Click here to sign in
    </a>
  </td>
</tr>
`;

export const requestVerifyEmail = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>


<tr>
  <td>
    <span style="cfont-family: 'Figtree';cfont-style: normal;cfont-weight: 400;cfont-size: 16px;cline-height: 36px;color: #84868c;">
    Below is the link to complete your
    email verification. The verification link below is valid for ${data.otpDuration}.<br><br>

    Kindly click <a href="${config.SEEDFI_BACKEND_BASE_URL}/api/v1/user/verify-email?verifyValue=${data.otp}">here</a> to verify your email.
    </span>
  </td>
</tr>`;

export const rejectedDebitCard = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      Thanks for adding your card details on SeedFi.<br />
      however, it has been rejected because the card will expire soon.<br />
      Kindly add a card that will not expire in about three months time.
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">card details</p><br />
    <span
      style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      <b>Last 4 Digits:</b> ${data.last4Digits}, <br />
      <b>Card Type:</b> ${data.cardType}
    </span>
  </td>
</tr>`;

export const loanDisbursement = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td style="padding-bottom: 20px">
    <span
      style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;"
      >Your loan application has been approved and disbursement made.
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td style="padding-bottom: 20px">
    <p>Below is a breakdown of the loan;</p><br />
      <span>
        <b>Requested Amount:</b> ${data.loanAmount} <br />
        <b>Loan Duration In Months:</b> ${data.loanDuration} <br />
        <b>Loan Purpose:</b> ${data.loanPurpose} <br />
        <b>Interest Rate:</b> ${data.pricingBand} <br />
        <b>Monthly Interest:</b>  ${data.monthlyInterest} <br />
        <b>Total Interest Amount:</b> ${data.totalInterestAmount} <br />
        <b>Insurance Fee:</b> ${data.insuranceFee} <br />
        <b>Processing Fee:</b> ${data.processingFee} <br />
        <b>Advisory Fee:</b> ${data.advisoryFee} <br />
        <b>Total Repayment Amount:</b> ${data.totalRepaymentAmount} <br />
        <b>Monthly Repayment:</b> ${data.monthlyRepayment} <br />
      </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td style="padding-bottom: 20px">
    <span>click this <a href="${data.offerLetterUrl}">link</a>to view and download a copy of your loan offer letter</span>
  </td>
</tr>`;

export const loanClusterInvite = (data) => `
<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span
      style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;"
      >You have been invited to join a cluster.
    </span>
  </td>
</tr>
<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span
      style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      ${data.inviter_first_name} ${data.inviter_last_name} is inviting you to join ${data.cluster_name} Cluster. <br />
      Kindly click <a href="${data.join_url}">here</a> to join.
    </span>
  </td>
</tr>`;


export const failedCardDebit = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">>
  <td>
    <span>Your card could not be debited for the loan repayment of ₦${parseFloat(data.total_payment_amount).toFixed(2)}</span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p>Card Details</p><br />
    <span>
      <b>Last 4 Digits:</b> ${Hash.decrypt(decodeURIComponent(data.last_4_digits))}, <br />
      <b>Card Type:</b> ${data.card_type}
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>Kindly fund your account or contact your bank if need be to resolve the issue, or login to seedfi application to do manual repayment</span>
  </td>
</tr>`;

export const failedChargePayment = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>Your payment of ₦${parseFloat(data.amount_paid).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} on seedfi was not successful</span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p>Card Details</p><br />
    <span>
      <b>Last 4 Digits:</b> ${data.last4Digits}, <br />
      <b>Card Type:</b> ${data.cardType}, <br />
      <b>Bank:</b> ${data.bank}
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td style="padding-bottom: 20px">
    <span>Kindly try again or reach out to your bank if need be.</span>
  </td>
</tr>`;

export const successfulRepayment = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>Seedfi received your payment of ₦${parseFloat(data.amount_paid).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      as a loan repayment of your existing loan facility
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p>Payment Details</p><br />
    <span>
      <b>Total Loan Amount:</b> ₦${parseFloat(data.total_loan_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
      <b>Amount Repaid:</b> ₦${parseFloat(data.amount_paid).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>Thank you for being loyal and keeping to your promise of loan facility repayment</span>
  </td>
</tr>`;

export const completedRepayment = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>You successfully repaid your ${data.loan_reason}, below is the loan breakdown</span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p>Payment Details</p><br />
    <span>
      <b>Loan Purpose:</b> ${data.loan_reason}<br />
      <b>Loan Amount:</b> ₦${parseFloat(data.total_loan_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
      <b>Loan Duration:</b> ${parseFloat(data.loan_duration)}<br />
      <b>Interest Rate:</b> ${parseFloat(data.interest_rate)}%<br />
      <b>Total Repayment:</b> ₦${parseFloat(data.total_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
      <b>Monthly Repayment</b>: ₦${parseFloat(data.monthly_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    </span>
  </td>
</tr>`;

export const failedAddressVerification = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>your address verification processing FAILED for address with the following details:</span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p>Address Details</p><br />
    <span>
      <b>House Number:</b> ${data.landmark},  <br />
        <b>Landmark:</b> ${data.house_number},  <br />
        <b>Street:</b> ${data.street},  <br />
        <b>City:</b> ${data.city},  <br />
        <b>State:</b> ${data.state}
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td style="padding-bottom: 20px">
    <span>kindly update your valid address details.</span>
  </td>
</tr>`;

export const successfulAddressVerification = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>your address verification processing is SUCCESSFUL for address with the following details:</span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p>Address Details</p><br />
    <span>
      <b>House Number:</b> ${data.house_number},  <br />
      <b>Landmark:</b> ${data.landmark},  <br />
      <b>Street:</b> ${data.street},  <br />
      <b>City:</b> ${data.city},  <br />
      <b>State:</b> ${data.state}
    </span>
  </td>
</tr>`;

export const loanRescheduled = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>You successfully Rescheduled your ${data.loan_reason}, below is the loan breakdown</span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p>Payment Details</p><br />
    <span>
      <b>Loan Purpose:</b> ${data.loan_reason}<br />
      <b>Loan Amount:</b> ₦${parseFloat(data.amount_requested).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
      <b>Monthly Repayment:</b> ₦${parseFloat(data.monthly_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
      <b>Initial Loan Duration:</b> ${data.initial_loan_duration} months<br />
      <b>Reschedule Extension Day:</b> ${data.reschedule_extension_days} days<br />
      <b>Current Loan Duration:</b> ${data.current_loan_duration}<br />
      <b>Next Loan Repayment Date:</b> ${data.next_repayment_date}
    </span>
  </td>
</tr>`;

export const rewardPointsClaiming = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span>You have successfully claimed ${data.just_claimed_points} points and you now have a total claimed points of ${data.claimed_points}</span>
  </td>
</tr>`;

export const rejectedDebitCardNotUsersCard = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      Thanks for adding your card details on SeedFi.<br />
      however, this added card does not bear your registered name on SeedFi.<br />
      Kindly add a card that bears your registered name.
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">card details</p><br />
    <span
      style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      <b>Last 4 Digits:</b> ${data.last4Digits}, <br />
      <b>Card Type:</b> ${data.cardType}
    </span>
  </td>
</tr>`;

export const ticketBookedForYou = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi <span style="text-transform: capitalize">${data.first_name}</span>,
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      Your ticket for ${data['ticket_name']} has been booked!<br />
      however, this added card does not bear your registered name on SeedFi.<br />
      Kindly add a card that bears your registered name.
    </span>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">card details</p><br />
    <span
      style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      <b>Event Title:</b> ${data['ticket_name']}, <br />
      <img src="${data['ticket_image_url']}">
      <b>Date:</b> ${data['event_date']}, <br />
      ${data['ticket_description']}
    </span>
  </td>
</tr>
`;

export const eventBooking = (data) => `
<tr>
    <td style="font-size: 17px;">Thank You for Booking Your Event Ticket with Us!</td>
</tr>
<tr>
    <td style="color: #84868c; padding-top: 15px;">Your ticket is attached to this email. Please keep it handy for a seamless entry on the day of the event.</td>
</tr>
<tr>
    <td style="padding-top: 15px;">${data['ticket_urls']}</td>
</tr>
`;
