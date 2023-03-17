import config from '../../../config/index';
import * as Hash from '../../utils/lib.util.hash';

export const forgotPassword = (data) => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hi ${data.first_name},
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <h1>${data.otp}</h1>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
          If you didn't request a password reset, you can ignore this email. Your password will not be changed.
        </td>
    </tr>
    <tr>
        <td>
          <span style="line-height: 40px">Thanks</span> <br />
          <span style="line-height: 40px">Yours Credibly</span> <br />
          <span style="font-weight: 600; display: block;">SeedFi</span>
          <span style="display: block;">Email: ask@seedfi.com</span>
          <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;

export const verifyEmail = (data) => `
    <tr>
        <td style="padding-bottom: 20px">
          <span>
            <span>Hi ${data.first_name},</span> <br />
          </span>
        </td>
    </tr>

    <tr>
        <td style="padding-bottom: 20px">
           <span>
              Thanks for signing up on SeedFi.<br />
              we welcome you to this great lending platform. 
              click <a href="${config.SEEDFI_BACKEND_BASE_URL}/api/v1/user/verify-email?verifyValue=${data.otp}">here</a> to verify your email.
            </span>
        </td>
    </tr>

    <tr>
      <td>
        <span style="line-height: 40px">Thanks</span> <br />
        <span style="line-height: 40px">Yours Credibly</span> <br />
        <span style="font-weight: 600; display: block;">SeedFi</span>
        <span style="display: block;">Email: ask@seedfi.com</span>
        <span style="display: block;">Call: +234 814 650 7035</span>
      </td>
    </tr>`;

export const requestVerifyEmail = (data) => `
    <tr>
        <td style="padding-bottom: 20px">
          <span>
            <span>Hi ${data.first_name},</span> <br />
          </span>
        </td>
    </tr>

    <tr>
        <td style="padding-bottom: 20px">
           <span>
              Thanks for signing up on SeedFi.<br />
              to verify your email, kindly click <a href="${config.SEEDFI_BACKEND_BASE_URL}/api/v1/user/verify-email?verifyValue=${data.otp}">here</a> to verify your email.
            </span>
        </td>
    </tr>
  
    <tr>
      <td>
        <span style="line-height: 40px">Thanks</span> <br />
        <span style="line-height: 40px">Yours Credibly</span> <br />
        <span style="font-weight: 600; display: block;">SeedFi</span>
        <span style="display: block;">Email: ask@seedfi.com</span>
        <span style="display: block;">Call: +234 814 650 7035</span>
      </td>
    </tr>`;

export const rejectedDebitCard = (data) => `
    <tr>
        <td style="padding-bottom: 20px">
          <span>
            <span>Hi ${data.first_name},</span> <br />
          </span>
        </td>
    </tr>

    <tr>
        <td style="padding-bottom: 20px">
           <span>
              Thanks for adding your card details on SeedFi.<br />
              however, it has been rejected because the card will expire soon.<br /> 
              Kindly add a card that will not expire in about three months time. </span>  
        </td>
    </tr>

    <tr>
        <td style="padding-bottom: 20px">
          <p>card details</p><br />
          <span>
            Last 4 digits: ${data.last4Digits}, <br />
            Card Type: ${data.cardType}
          </span>  
        </td>
    </tr>
  
    <tr>
      <td>
        <span style="line-height: 40px">Thanks</span> <br />
        <span style="line-height: 40px">Yours Credibly</span> <br />
        <span style="font-weight: 600; display: block;">SeedFi</span>
        <span style="display: block;">Email: ask@seedfi.com</span>
        <span style="display: block;">Call: +234 814 650 7035</span>
      </td>
    </tr>`;

export const loanDisbursement = (data) => `
    <tr>
        <td style="padding-bottom: 20px">
          <span>
            <span>Hi ${data.firstName},</span> <br />
          </span>
        </td>
    </tr>

    <tr>
        <td style="padding-bottom: 20px">
           <span>Your loan application has been approved and disbursement made.</span>  
        </td>
    </tr>

    <tr>
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
  
    <tr>
      <td>
        <span style="line-height: 40px">Thanks</span> <br />
        <span style="line-height: 40px">Yours Credibly</span> <br />
        <span style="font-weight: 600; display: block;">SeedFi</span>
        <span style="display: block;">Email: ask@seedfi.com</span>
        <span style="display: block;">Call: +234 814 650 7035</span>
      </td>
    </tr>`;

export const loanClusterInvite = (data) => `
    <tr>
        <td style="padding-bottom: 20px">
           <span>You have been invited to join a cluster, <br />
           ${data.inviter_first_name} ${data.inviter_last_name}  is inviting you to join ${data.cluster_name} Cluster loan group <br />
           Kindly click on <a href="${data.join_url}">link</a> to join cluster.
           </span>  
        </td>
    </tr>

    <tr>
      <td>
        <span style="line-height: 40px">Thanks</span> <br />
        <span style="line-height: 40px">Yours Credibly</span> <br />
        <span style="font-weight: 600; display: block;">SeedFi</span>
        <span style="display: block;">Email: ask@seedfi.com</span>
        <span style="display: block;">Call: +234 814 650 7035</span>
      </td>
    </tr>`;


export const failedCardDebit = async(data) => `
  <tr>
    <td style="padding-bottom: 20px">
      <span>
        <span>Hi ${data.first_name},</span> <br />
      </span>
    </td>
  </tr>

  <tr>
    <td style="padding-bottom: 20px">
      <span>Your card could not be debited for the loan repayment of ₦${parseFloat(data.total_payment_amount).toFixed(2)}</span>  
    </td>
  </tr>

  <tr>
        <td style="padding-bottom: 20px">
          <p>card details</p><br />
          <span>
            Last 4 digits: ${await Hash.decrypt(decodeURIComponent(data.last_4_digits))}, <br />
            Card Type: ${data.card_type}
          </span>  
        </td>
    </tr>

  <tr>
    <td style="padding-bottom: 20px">
      <span>Kindly fund your account or contact your bank if need be to resolve the issue, or login to seedfi application to do manual repayment</span>  
    </td>
  </tr>

  <tr>
    <td>
      <span style="line-height: 40px">Thanks</span> <br />
      <span style="line-height: 40px">Yours Credibly</span> <br />
      <span style="font-weight: 600; display: block;">SeedFi</span>
      <span style="display: block;">Email: ask@seedfi.com</span>
      <span style="display: block;">Call: +234 814 650 7035</span>
    </td>
  </tr>`;

export const failedChargePayment = (data) => `
  <tr>
    <td style="padding-bottom: 20px">
      <span>
        <span>Hi ${data.first_name},</span> <br />
      </span>
    </td>
  </tr>

  <tr>
    <td style="padding-bottom: 20px">
      <span>Your payment of ₦${parseFloat(data.amount_paid).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} on seedfi was not successful</span>  
    </td>
  </tr>

  <tr>
        <td style="padding-bottom: 20px">
          <p>card details</p><br />
          <span>
            Last 4 digits: ${data.last4Digits}, <br />
            Card Type: ${data.cardType}, <br />
            bank: ${data.bank}
          </span>  
        </td>
  </tr>

  <tr>
    <td style="padding-bottom: 20px">
      <span>Kindly try again or reach out to your bank if need be.</span>  
    </td>
  </tr>

  <tr>
    <td>
      <span style="line-height: 40px">Thanks</span> <br />
      <span style="line-height: 40px">Yours Credibly</span> <br />
      <span style="font-weight: 600; display: block;">SeedFi</span>
      <span style="display: block;">Email: ask@seedfi.com</span>
      <span style="display: block;">Call: +234 814 650 7035</span>
    </td>
  </tr>`;

export const successfulRepayment = (data) => `
  <tr>
    <td style="padding-bottom: 20px">
      <span>
        <span>Hi ${data.first_name},</span> <br />
      </span>
    </td>
  </tr>

  <tr>
    <td style="padding-bottom: 20px">
      <span>Seedfi received your payment of ₦${parseFloat(data.amount_paid).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} as a loan repayment of your existing loan facility</span>  
    </td>
  </tr>

  <tr>
        <td style="padding-bottom: 20px">
          <p>payment details</p><br />
          <span>
            Total Loan amount: ₦${parseFloat(data.total_loan_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}<br />
            Amount repaid: ₦${parseFloat(data.amount_paid).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </span>  
        </td>
    </tr>

  <tr>
    <td style="padding-bottom: 20px">
      <span>Thank you for being loyal and keeping to your promise of loan facility repayment</span>  
    </td>
  </tr>

  <tr>
    <td>
      <span style="line-height: 40px">Thanks</span> <br />
      <span style="line-height: 40px">Yours Credibly</span> <br />
      <span style="font-weight: 600; display: block;">SeedFi</span>
      <span style="display: block;">Email: ask@seedfi.com</span>
      <span style="display: block;">Call: +234 814 650 7035</span>
    </td>
  </tr>`;
