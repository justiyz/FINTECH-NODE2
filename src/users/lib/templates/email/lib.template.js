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
If you didn't request a reset password, you can ignore this email.
</p>
</td>
</tr>
`;

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
  email verification. this email is valid for 30 minutes. <br><br>

  Kindly click <a href="${config.SEEDFI_BACKEND_BASE_URL}/api/v1/user/verify-email?verifyValue=${data.otp}">here</a> to verify your email.
  </span>
</td>
</tr>
`;

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
              Kindly add a card that will not expire in about three months time. </span>  
        </td>
    </tr>

    <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
        <td>
          <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">card details</p><br />
          <span
          style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
            Last 4 digits: ${data.last4Digits}, <br />
            Card Type: ${data.cardType}
          </span>  
        </td>
    </tr>
  `;

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
           >Your loan application has been approved and disbursement made.</span>  
        </td>
    </tr>

    <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
        <td style="padding-bottom: 20px">
          <p>Below is a breakdown of the loan;</p><br />
          <span>
            <b>requested amount:</b> ${data.loanAmount} <br />
            <b>loan duration in months:</b> ${data.loanDuration} <br />
            <b>loan purpose:</b> ${data.loanPurpose} <br />
            <b>Interest rate:</b> ${data.pricingBand} <br />
            <b>monthly interest:</b>  ${data.monthlyInterest} <br />
            <b>total interest amount:</b> ${data.totalInterestAmount} <br />
            <b>insurance fee:</b> ${data.insuranceFee} <br />
            <b>processing fee:</b> ${data.processingFee} <br />
            <b>advisory fee:</b> ${data.advisoryFee} <br />
            <b>total repayment amount:</b> ${data.totalRepaymentAmount} <br />
            <b>monthly_repayment:</b> ${data.monthlyRepayment} <br />
          </span>  
        </td>
    </tr>

    <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
        <td style="padding-bottom: 20px">
           <span>click this <a href="${data.offerLetterUrl}">link</a>to view and download a copy of your loan offer letter</span>
        </td>
    </tr>
  `;

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
           style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;"
           ${data.inviter_first_name} ${data.inviter_last_name}  is inviting you to join ${data.cluster_name} Cluster loan group<br />
           Kindly click <a href="${data.join_url}">here</a> to join cluster.
           </span>  
        </td>
    </tr>
`;


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
          <p>card details</p><br />
          <span>
            Last 4 digits: ${Hash.decrypt(decodeURIComponent(data.last_4_digits))}, <br />
            Card Type: ${data.card_type}
          </span>  
        </td>
    </tr>

  <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
    <td>
      <span>Kindly fund your account or contact your bank if need be to resolve the issue, or login to seedfi application to do manual repayment</span>  
    </td>
  </tr>
`;

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
          <p>card details</p><br />
          <span>
            Last 4 digits: ${data.last4Digits}, <br />
            Card Type: ${data.cardType}, <br />
            bank: ${data.bank}
          </span>  
        </td>
  </tr>

  <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
    <td style="padding-bottom: 20px">
      <span>Kindly try again or reach out to your bank if need be.</span>  
    </td>
  </tr>
`;

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
       as a loan repayment of your existing loan facility</span>  
    </td>
  </tr>

  <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
        <td>
          <p>payment details</p><br />
          <span>
            Total Loan amount: ₦${parseFloat(data.total_loan_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
            Amount repaid: ₦${parseFloat(data.amount_paid).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </span>  
        </td>
    </tr>

  <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
    <td>
      <span>Thank you for being loyal and keeping to your promise of loan facility repayment</span>  
    </td>
  </tr>
`;

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
          <p>payment details</p><br />
          <span>
            Loan purpose: ${data.loan_reason}<br />
            Loan amount: ₦${parseFloat(data.total_loan_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
            Loan duration: ${parseFloat(data.loan_duration)}<br />
            Interest rate: ${parseFloat(data.interest_rate)}%<br />
            Total repayment: ₦${parseFloat(data.total_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
            Monthly repayment: ₦${parseFloat(data.monthly_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </span>  
        </td>
    </tr>
`;

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
          <p>card details</p><br />
          <span>
            house_number: ${data.landmark},  <br />
            landmark: ${data.house_number},  <br />
            street: ${data.street},  <br />
            city: ${data.city},  <br />
            state: ${data.state}
          </span>  
        </td>
  </tr>

  <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
    <td style="padding-bottom: 20px">
      <span>kindly update your valid address details. Thank you</span>  
    </td>
  </tr>
`;

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
          <p>card details</p><br />
          <span>
            house_number: ${data.landmark},  <br />
            landmark: ${data.house_number},  <br />
            street: ${data.street},  <br />
            city: ${data.city},  <br />
            state: ${data.state}
          </span>  
        </td>
  </tr>

  <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
    <td style="padding-bottom: 20px">
      <span>Thank you</span>  
    </td>
  </tr>
`;
