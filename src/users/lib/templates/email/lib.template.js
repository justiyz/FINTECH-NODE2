import config from '../../../config/index';
import * as Hash from '../../utils/lib.util.hash';

export const forgotPassword = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
      Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
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
    Hi ${data.first_name},
    </h2>
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td>
    <span style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      Your ticket for ${data.ticket_name} has been booked!<br />
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
      <b>Event Title:</b> ${data.ticket_name}, <br />
      <img src="${data.ticket_image_url}">
      <b>Date:</b> ${data.event_date}, <br />
      ${data.ticket_description}
    </span>
  </td>
</tr>
`;

export const eventBooking = (data) => `
<html lang="en">
    <head>
        <style>
            body {
                padding: 50px;
                display: flex;
                flex-direction: column;
                gap: 50px;
                font-family: "Roboto", sans-serif;
            }
            .gray {
                color: #84868c;
            }
            .bold {
                font-weight: bold;
            }
            .greetings {
                display: flex;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .size_24 {
                font-size: 24px;
            }
            .w-60 {
                width: 60%;
            }
            a {
                color: blue;
                text-decoration: underline;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <header>
            <img
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI1IiBoZWlnaHQ9IjIzIiB2aWV3Qm94PSIwIDAgMTI1IDIzIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHBhdGggZD0iTTQ3LjcyNDEgOS44NzYzM0w0NS4xNDI4IDkuMjQ1OTRDNDQuMjYyIDkuMDI1OTIgNDMuNTY2OSA4LjcwMTAzIDQzLjA1NjggOC4yNzAzOUM0Mi41NDY3IDcuODQwNDggNDIuMjkxNSA3LjIzNDkgNDIuMjkxNSA2LjQ1NDM5QzQyLjI5MTUgNS40OTQwNSA0Mi42MTY2IDQuNzQzNiA0My4yNjcxIDQuMjAzNEM0My45MTcgMy42NjMwMiA0NC44MTI5IDMuMzkyODMgNDUuOTUzNCAzLjM5MjgzQzQ3LjA1MzcgMy4zOTI4MyA0Ny45NzQ0IDMuNjUzMDYgNDguNzE0OSA0LjE3MzM0QzQ5LjQ1NSA0LjY5Mzk4IDQ5Ljk3NTcgNS4zNTQwNyA1MC4yNzU3IDYuMTU0MzJMNTMuNjM3NCA1LjA3Mzc0QzUzLjMxNyA0LjE3MzM0IDUyLjgyNyAzLjM2ODAyIDUyLjE2NjcgMi42NTc0MUM1MS41MDYzIDEuOTQ3MzQgNTAuNjcwNSAxLjM4Njg2IDQ5LjY2MDQgMC45NzY1MDJDNDguNjQ5NyAwLjU2NjY4OCA0Ny40NzQgMC4zNjEzMjggNDYuMTMzNiAwLjM2MTMyOEM0My43NTIgMC4zNjEzMjggNDEuOTIxMiAwLjkwNjc4MSA0MC42NDA3IDEuOTk3MTRDMzkuMzU5OCAzLjA4ODA1IDM4LjcxOTYgNC42MTM3NiAzOC43MTk2IDYuNTc0NDZDMzguNzE5NiA3LjYxNTIgMzguOTQ0NyA4LjUxNTc4IDM5LjM5NDkgOS4yNzYwMUMzOS44NDUxIDEwLjAzNjggNDAuNDY1MiAxMC42NjcyIDQxLjI1NTggMTEuMTY3QzQyLjA0NjEgMTEuNjY3MyA0Mi45MzE1IDEyLjA0NzggNDMuOTEyMSAxMi4zMDc1TDQ2LjQ5MzYgMTIuOTY4QzQ3LjU3NCAxMy4yNDgzIDQ4LjQzNDQgMTMuNjQzNCA0OS4wNzQ5IDE0LjE1MzZDNDkuNzE1MSAxNC42NjM5IDUwLjAzNTQgMTUuMzE5NCA1MC4wMzU0IDE2LjExOTVDNTAuMDM1NCAxNy4wMDA0IDQ5LjY1NTEgMTcuNzEwMiA0OC44OTQ5IDE4LjI1MDZDNDguMTM0MSAxOC43OTEgNDcuMTAzNyAxOS4wNjEyIDQ1LjgwMzMgMTkuMDYxMkM0NC42ODI1IDE5LjA0MTUgNDMuNzQyMSAxOC43NTEyIDQyLjk4MTggMTguMTkwN0M0Mi4yMjExIDE3LjYzMDcgNDEuNzEwOSAxNi45ODAzIDQxLjQ1MTEgMTYuMjM5NkwzOC4wMjkzIDE3LjI5MDNDMzguMjA5MyAxNy45MTA3IDM4LjUyNDYgMTguNTA1OCAzOC45NzQ4IDE5LjA3NjJDMzkuNDI1IDE5LjY0NjUgMzkuOTk1MiAyMC4xNjE5IDQwLjY4NTYgMjAuNjIyQzQxLjM3NTkgMjEuMDgyNiA0Mi4xNzYgMjEuNDQyOCA0My4wODY3IDIxLjcwMjRDNDMuOTk3IDIxLjk2MjMgNDUuMDAyNyAyMi4wOTI3IDQ2LjEwMzMgMjIuMDkyN0M0Ny43MjQxIDIyLjA5MjcgNDkuMDk5NyAyMS44MzI1IDUwLjIzMDUgMjEuMzEyMkM1MS4zNjA3IDIwLjc5MjEgNTIuMjE2MSAyMC4wNzE3IDUyLjc5NjcgMTkuMTUxMkM1My4zNzY5IDE4LjIzMTEgNTMuNjY3MiAxNy4xNzAyIDUzLjY2NzIgMTUuOTY5NEM1My42NjcyIDE0LjYwODggNTMuMTQ2NiAxMy4zNjg0IDUyLjEwNjQgMTIuMjQ3NEM1MS4wNjU2IDExLjEyNyA0OS42MDQ4IDEwLjMzNjggNDcuNzI0MSA5Ljg3NjMzWiIgZmlsbD0iIzJBODg1MSIvPg0KPHBhdGggZD0iTTY4LjAzMDcgMTUuMDQwOEg2OS44MDE2QzY5LjgwMTYgMTMuMjM5OCA2OS40ODEyIDExLjY4OTMgNjguODQxMSAxMC4zODgzQzY4LjIwMDQgOS4wODc4NiA2Ny4zNDUgOC4wOTIyMSA2Ni4yNzQ4IDcuNDAxODhDNjUuMjA0IDYuNzExMzcgNjMuOTk4MSA2LjM2NjIxIDYyLjY1OCA2LjM2NjIxQzYxLjE3NjggNi4zNjYyMSA1OS44NjE0IDYuNzAxNiA1OC43MTA5IDcuMzcxODJDNTcuNTU5OSA4LjA0MjQxIDU2LjY1NDggOC45Njc4IDU1Ljk5NDUgMTAuMTQ4MkM1NS4zMzQyIDExLjMyOTEgNTUuMDAzOSAxMi42ODk2IDU1LjAwMzkgMTQuMjMwNEM1NS4wMDM5IDE1Ljc3MTEgNTUuMzI5IDE3LjEzMiA1NS45Nzk1IDE4LjMxMjZDNTYuNjI5NCAxOS40OTM1IDU3LjUyIDIwLjQxODkgNTguNjUwOCAyMS4wODkxQzU5Ljc4MSAyMS43NTkxIDYxLjA3NjkgMjIuMDk0NSA2Mi41Mzc3IDIyLjA5NDVDNjMuNjc4MyAyMi4wOTQ1IDY0LjY5MzcgMjEuOTM0MyA2NS41ODQzIDIxLjYxNDNDNjYuNDc0MyAyMS4yOTQ0IDY3LjI0NTEgMjAuODMzOSA2Ny44OTU2IDIwLjIzMzZDNjguNTQ1NSAxOS42MzMzIDY5LjA4MTIgMTguOTMzMiA2OS41MDEzIDE4LjEzMjZMNjYuNDA5NyAxNi44MTE4QzY2LjA4OTMgMTcuNDUyNiA2NS42MzkxIDE3Ljk3NzcgNjUuMDU4OSAxOC4zODc3QzY0LjQ3ODMgMTguNzk4MSA2My43MzgyIDE5LjAwMzEgNjIuODM4IDE5LjAwMzFDNjIuMDE3MyAxOS4wMDMxIDYxLjI3MjEgMTguODE4MiA2MC42MDE5IDE4LjQ0NzdDNTkuOTMxMyAxOC4wNzc1IDU5LjQwMTIgMTcuNTQyNiA1OS4wMTExIDE2Ljg0MTlDNTguNzIwMSAxNi4zMTk2IDU4LjUzNzkgMTUuNzE5MyA1OC40NjM5IDE1LjA0MDlINjguMDMwN1YxNS4wNDA4Wk01OC42NDA0IDEyLjM2OTNDNTguNzExNiAxMi4wODQyIDU4Ljc5OTEgMTEuODE3OCA1OC45MDU5IDExLjU3MzlDNTkuMjI1NyAxMC44NDM2IDU5LjY5NiAxMC4yODgzIDYwLjMxNjYgOS45MDgwM0M2MC45MzY3IDkuNTI4MSA2MS42NzcyIDkuMzM3NzcgNjIuNTM3NyA5LjMzNzc3QzYzLjM1NzkgOS4zMzc3NyA2NC4wNTM1IDkuNTQzMTMgNjQuNjIzOCA5Ljk1MzEyQzY1LjE5NCAxMC4zNjM1IDY1LjYzMzkgMTAuOTg4NiA2NS45NDQ1IDExLjgyOTFDNjYuMDA3MSAxMS45OTg5IDY2LjA2MTYgMTIuMTgwNiA2Ni4xMTE2IDEyLjM2OTNINTguNjQwM0g1OC42NDA0WiIgZmlsbD0iIzJBODg1MSIvPg0KPHBhdGggZD0iTTgzLjUzMDggMTUuMDQwOEg4NS4zMDE2Qzg1LjMwMTYgMTMuMjM5OCA4NC45ODEyIDExLjY4OTMgODQuMzQxMSAxMC4zODgzQzgzLjcwMDQgOS4wODc4NiA4Mi44NDUgOC4wOTIyMSA4MS43NzQ4IDcuNDAxODhDODAuNzA0MiA2LjcxMTM3IDc5LjQ5ODMgNi4zNjYyMSA3OC4xNTggNi4zNjYyMUM3Ni42NzY4IDYuMzY2MjEgNzUuMzYxNCA2LjcwMTYgNzQuMjEwOSA3LjM3MTgyQzczLjA1OTkgOC4wNDI0MSA3Mi4xNTQ4IDguOTY3OCA3MS40OTQ1IDEwLjE0ODJDNzAuODM0IDExLjMyOTEgNzAuNTAzOSAxMi42ODk2IDcwLjUwMzkgMTQuMjMwNEM3MC41MDM5IDE1Ljc3MTEgNzAuODI5IDE3LjEzMiA3MS40Nzk1IDE4LjMxMjZDNzIuMTI5NCAxOS40OTM1IDczLjAyIDIwLjQxODkgNzQuMTUwOCAyMS4wODkxQzc1LjI4MSAyMS43NTkxIDc2LjU3NjkgMjIuMDk0NSA3OC4wMzc3IDIyLjA5NDVDNzkuMTc4NSAyMi4wOTQ1IDgwLjE5MzggMjEuOTM0MyA4MS4wODQ1IDIxLjYxNDNDODEuOTc0NCAyMS4yOTQ0IDgyLjc0NTEgMjAuODMzOSA4My4zOTU2IDIwLjIzMzZDODQuMDQ1NyAxOS42MzMzIDg0LjU4MTIgMTguOTMzMiA4NS4wMDEzIDE4LjEzMjZMODEuOTA5NyAxNi44MTE4QzgxLjU4OTMgMTcuNDUyNiA4MS4xMzkxIDE3Ljk3NzcgODAuNTU5MSAxOC4zODc3Qzc5Ljk3ODUgMTguNzk4MSA3OS4yMzg0IDE5LjAwMzEgNzguMzM4IDE5LjAwMzFDNzcuNTE3MyAxOS4wMDMxIDc2Ljc3MjEgMTguODE4MiA3Ni4xMDE5IDE4LjQ0NzdDNzUuNDMxMyAxOC4wNzc1IDc0LjkwMTIgMTcuNTQyNiA3NC41MTExIDE2Ljg0MTlDNzQuMjIwMSAxNi4zMTk2IDc0LjAzNzkgMTUuNzE5MyA3My45NjM5IDE1LjA0MDlIODMuNTMwOFYxNS4wNDA4Wk03NC4xNDA0IDEyLjM2OTNDNzQuMjExNiAxMi4wODQyIDc0LjI5OTEgMTEuODE3OCA3NC40MDU5IDExLjU3MzlDNzQuNzI1OSAxMC44NDM2IDc1LjE5NiAxMC4yODgzIDc1LjgxNjYgOS45MDgwM0M3Ni40MzY3IDkuNTI4MSA3Ny4xNzcyIDkuMzM3NzcgNzguMDM3NyA5LjMzNzc3Qzc4Ljg1ODEgOS4zMzc3NyA3OS41NTM1IDkuNTQzMTMgODAuMTIzOCA5Ljk1MzEyQzgwLjY5NCAxMC4zNjM1IDgxLjEzMzkgMTAuOTg4NiA4MS40NDQ1IDExLjgyOTFDODEuNTA3MSAxMS45OTg5IDgxLjU2MTYgMTIuMTgwNiA4MS42MTE4IDEyLjM2OTNINzQuMTQwNFoiIGZpbGw9IiMyQTg4NTEiLz4NCjxwYXRoIGQ9Ik05Ny41Mjc4IDguOTE2ODNDOTcuMTIwNyA4LjI4NTM2IDk2LjYyNjIgNy43NTk2NSA5Ni4wNDIxIDcuMzQyMjNDOTUuMTMxNCA2LjY5MjI5IDk0LjA0NjEgNi4zNjY2OCA5Mi43ODU1IDYuMzY2NjhDOTEuNDI0NCA2LjM2NjY4IDkwLjIzOSA2LjY5MjI5IDg5LjIyODcgNy4zNDIyM0M4OC4yMTggNy45OTI3MiA4Ny40Mjc3IDguOTAzMDcgODYuODU3NCAxMC4wNzM1Qzg2LjI4NzIgMTEuMjQ0MiA4Ni4wMDIgMTIuNjMgODYuMDAyIDE0LjIzMDdDODYuMDAyIDE1LjgxMTggODYuMjg3MiAxNy4xOTI0IDg2Ljg1NzQgMTguMzcyOEM4Ny40Mjc3IDE5LjU1MzcgODguMjE4IDIwLjQ2OTEgODkuMjI4NyAyMS4xMTkzQzkwLjIzODggMjEuNzY5MiA5MS40MjQ0IDIyLjA5NDYgOTIuNzg1NSAyMi4wOTQ2Qzk0LjA0NjEgMjIuMDk0NiA5NS4xMzE0IDIxLjc2OTIgOTYuMDQyMSAyMS4xMTkzQzk2LjY0MDYgMjAuNjkxNyA5Ny4xNDQ2IDIwLjE0NzIgOTcuNTU3MyAxOS40OUw5Ny42Nzc5IDIxLjczNDRIMTAwLjg2VjAuNzIzNjMzSDk3LjUyNzhWOC45MTY4M1pNOTUuNjUxOSAxOC40MTc5Qzk1LjA2MTMgMTguODI4MiA5NC4zODYyIDE5LjAzMzIgOTMuNjI1OCAxOS4wMzMyQzkyLjgyNTQgMTkuMDMzMiA5Mi4xMSAxOC44MjgyIDkxLjQ3OTggMTguNDE3OUM5MC44NDk1IDE4LjAwODEgOTAuMzU4OSAxNy40NDI1IDkwLjAwOSAxNi43MjJDODkuNjU4NiAxNi4wMDE2IDg5LjQ3MzUgMTUuMTcxNCA4OS40NTM4IDE0LjIzMDdDODkuNDczMyAxMy4yOTA0IDg5LjY1ODYgMTIuNDU5NyA5MC4wMDkgMTEuNzM5NUM5MC4zNTkxIDExLjAxOTEgOTAuODQ0NCAxMC40NTkyIDkxLjQ2NDggMTAuMDU4NEM5Mi4wODQ3IDkuNjU4NDEgOTIuNzk1MyA5LjQ1ODMgOTMuNTk1NyA5LjQ1ODNDOTQuMzc2MiA5LjQ1ODMgOTUuMDYxMyA5LjY1ODU5IDk1LjY1MTkgMTAuMDU4NEM5Ni4yNDIgMTAuNDU5IDk2LjcwMjYgMTEuMDE5IDk3LjAzMjcgMTEuNzM5NUM5Ny4zNjI3IDEyLjQ1OTcgOTcuNTI3OCAxMy4yOTA0IDk3LjUyNzggMTQuMjMwN0M5Ny41Mjc4IDE1LjE3MDkgOTcuMzYyNyAxNi4wMDE2IDk3LjAzMjcgMTYuNzIyQzk2LjcwMjYgMTcuNDQyMyA5Ni4yNDIgMTguMDA3OSA5NS42NTE5IDE4LjQxNzlaIiBmaWxsPSIjMkE4ODUxIi8+DQo8cGF0aCBkPSJNMTA5LjM3NiAzLjkwNTQ0SDExOC45NzNMMTE5LjQ4MyAwLjcyMzYzM0gxMDkuOTA4SDEwOS4zMDdIMTA2LjQyNkwxMDIuOTE0IDIxLjczNDZIMTA2LjM5NkwxMDcuODYxIDEyLjk3MDFIMTE2LjAzMUwxMTYuNTcxIDkuNzg4NDRIMTA4LjM5MkwxMDkuMzc2IDMuOTA1NDRaIiBmaWxsPSIjMkE4ODUxIi8+DQo8cGF0aCBkPSJNMTE3Ljk2MSAyMS43MzI0SDEyMS4yOTNMMTIzLjg0NCA2LjcyNDYxSDEyMC41MTJMMTE3Ljk2MSAyMS43MzI0WiIgZmlsbD0iIzJBODg1MSIvPg0KPHBhdGggZD0iTTEyNC4zNjkgMC41NzAyNjNDMTIzLjk3OSAwLjE5MDMyOSAxMjMuNTE0IDAgMTIyLjk3MyAwQzEyMi40NTMgMCAxMjEuOTkyIDAuMTkwNTEgMTIxLjU5MyAwLjU3MDI2M0MxMjEuMTkyIDAuOTUwNTU4IDEyMC45OTIgMS40MTA1MyAxMjAuOTkyIDEuOTUwOTJDMTIwLjk5MiAyLjQ3MTU2IDEyMS4xOTIgMi45MzE3MiAxMjEuNTkzIDMuMzMxNTdDMTIxLjk5MyAzLjczMTk3IDEyMi40NTMgMy45MzE5IDEyMi45NzMgMy45MzE5QzEyMy41MTQgMy45MzE5IDEyMy45NzkgMy43MzE5NyAxMjQuMzY5IDMuMzMxNTdDMTI0Ljc1OSAyLjkzMTU0IDEyNC45NTQgMi40NzEzOCAxMjQuOTU0IDEuOTUwOTJDMTI0Ljk1NCAxLjQxMDUzIDEyNC43NTkgMC45NTA1NTggMTI0LjM2OSAwLjU3MDI2M1oiIGZpbGw9IiMyQTg4NTEiLz4NCjxwYXRoIGQ9Ik0yMS43MzEyIDExLjIyNzlDMjEuNzMxMiA1LjIyNzAxIDE2Ljg2NjUgMC4zNjIzMDUgMTAuODY1NiAwLjM2MjMwNUM0Ljg2NDcxIDAuMzYyMzA1IDAgNS4yMjcwMSAwIDExLjIyNzlWMjIuMDkzNUgxMC44NjU2QzE2Ljg2NjUgMjIuMDkzNSAyMS43MzEyIDE3LjIyODggMjEuNzMxMiAxMS4yMjc5WiIgZmlsbD0iIzJBODg1MSIvPg0KPHBhdGggZD0iTTMyLjU5NjEgMTEuMjI3OUMzMi41OTYxIDUuMjI3MDEgMjcuNzMxNCAwLjM2MjMwNSAyMS43MzA1IDAuMzYyMzA1VjIyLjA5MzVDMjcuNzMxNCAyMi4wOTM1IDMyLjU5NjEgMTcuMjI4OCAzMi41OTYxIDExLjIyNzlaIiBmaWxsPSIjMkE4ODUxIi8+DQo8L3N2Zz4NCg=="
            />
        </header>
        <div class="greetings"><span class="gray">Hi ${data.first_name}</span> <span class="size_24">Thank You for Booking Your Event Ticket with Us!</span></div>
        <div class="gray bold">Your ticket is attached to this email. Please keep it handy for a seamless entry on the day of the event.</div>

        ${data.ticket_urls}
        <span class="gray w-60 bold">If you have any questions or need further assistance, feel free to reach out to our dedicated support team at hello@theseedfi.com. We're here to ensure you have an amazing experience!</span>
        <span class="gray">You are receiving this email because you opt in via our website.</span>
        <span class="gray">© 2023 SeedFi. All rights reserved.You received this email because you signed up for an app that helps you create your emails.</span>
    </body>
</html>
`;
