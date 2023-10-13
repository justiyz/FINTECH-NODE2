/* eslint-disable no-irregular-whitespace */
/* eslint-disable max-len */
import dayjs from 'dayjs';
import { decrypt } from '../../utils/lib.util.hash';

export const offerLetterTemplate = async(loanDetails, userOfferLetterDetail, genderType, loanType, loanPurposeType, houseAddressStreet, houseAddressState) => {
  return `
    <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <title>OFFER LETTER REVISED</title>
</head>

<body style="padding: 40px; font-family: Montserrat, sans-serif; font-size: 14px;">
  <div style="margin-bottom: 40px;">
    <p>${dayjs().format('MMMM D, YYYY')}</p>
    <p>${houseAddressStreet}</p>
    <p>${houseAddressState}</p>
  </div>

  <div>
    <p style="margin-bottom: 40px;">Dear ${genderType},</p>

    <h4 style="margin-bottom: 40px;">RE: OFFER LETTER – ${loanType.toUpperCase()} LOAN</h4>

    <p>
      Further to your request for the subject facility, we are pleased to inform you that the facility has been approved under the following terms and conditions:
    </p>
  </div>

  <table width="80%" cell-spacing="0" cell-padding="0">
    <tr>
      <td width="30%" height="40px">Facility Type:</td>
      <td>${loanType} Loan.</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Lender:</td>
      <td>SeedFi</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Borrower:</td>
      <td>${userOfferLetterDetail.full_name} (“Borrower”)</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Bank Verification Number:</td>
      <td>${await decrypt(decodeURIComponent(userOfferLetterDetail.bvn))}</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Amount:</td>
      <td>₦${parseFloat(loanDetails.amount_requested).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ( Naira only)</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Tenor:</td>
      <td>${Number(loanDetails.loan_tenor_in_months)} months</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Purpose:</td>
      <td>${loanPurposeType}</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Interest Rate:</td>
      <td>${loanDetails.percentage_pricing_band}% p.a. (floating)</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Annual Percentage Rate:</td>
      <td>${parseFloat(loanDetails.percentage_pricing_band  + loanDetails.percentage_processing_fee + loanDetails.percentage_advisory_fee + loanDetails.percentage_insurance_fee).toFixed(2)}%</td>
    </tr>
    <tr>
      <td width="30%" height="40px" style="vertical-align: top;">Rate Review:</td>
      <td>These rates are subject to review/change in line with money market conditions at any time or SeedFi’s discretion. SeedFi will send a notification via email or Short Message Service (SMS) or written letter in advance of the application of the new rate. However, SeedFi has the right to implement the changes at the end of the notice period if there is no response to the notice.</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Repayment:</td>
      <td>Equal Monthly repayment of ₦${parseFloat(loanDetails.monthly_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Repayment Source:</td>
      <td>The facility will be repaid from the Borrower’s business proceeds and other cashflow sources available to the Borrower </td>
    </tr>
    <tr>
      <td width="30%" height="40px">Repayment Mode:</td>
      <td>Interest and principal repayments shall be repaid monthly</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Processing Fee:</td>
      <td>${parseFloat(loanDetails.percentage_processing_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Advisory Fee:</td>
      <td>${parseFloat(loanDetails.percentage_advisory_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat</td>
    </tr>
    <tr>
      <td width="30%" height="40px">Insurance Fee:</td>
      <td>${parseFloat(loanDetails.percentage_insurance_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% per annum payable upfront</td>
    </tr>
  </table>

  <div>
    <h4 style="margin-bottom: 20px;">CONDITIONS PRECEDENT TO DRAWDOWN</h4>

    <ol style="padding-left: 15px;">
      <li>Submission of request for the facility.
      </li>
      <li>Execution of offer letter in acceptance of the facility.</li>
      <li>Acceptance of terms and conditions. </li>
    </ol>

<div>
      <h4 style="margin-bottom: 20px;">TRANSACTION DYNAMICS</h4>

  <ol style="padding-left: 15px;">
    <li>The Borrower executes offer letter, accepts terms and condition, and any other required document</li>
    <li>Loan is booked for approved tenor.</li>
    <li>Borrower’s account is debited monthly for loan repayment</li>
  </ol>

  <ol type="A" style="padding-left: 15px;">
        <li>
          <h4>Other Conditions</h4>
          <ol style="padding-left: 0px;">
            <li>This offer letter shall not be binding unless it is accepted unconditionally within 30 days from the date hereof. Upon acceptance, it shall remain valid for a period of 90 days, after which it is deemed to have elapsed if the facility is not utilized.</li>
            <li>Without prejudice to the foregoing, SeedFi reserves the right to vary, alter or amend any of the terms and conditions of the facility as and when the need arises.</li>
            <li>All expenses incurred in the arrangement, documentation, and enforcement of payments under the facility, including all professional, valuation, legal and monitoring fees, taxes and commissions (if any) would be borne by the Borrower and SeedFi shall be entitled to debit the Borrower’s account immediately for such expenses.</li>
            <li>Utilization of the facility or any part thereof shall be at SeedFi’s discretion and is subject to satisfactory documentation and regulation of the Central Bank of Nigeria (CBN) as may be laid down from time to time.</li>
            <li>The Borrower hereby agrees to indemnify SeedFi against any loss howsoever occurring that they may incur, because of any misrepresentation, irregularity, or incompleteness in the information contained in any document submitted to SeedFi.</li>
            <li>Where there is a turnover covenant, and there is the default in the turnover covenant which exceeds a continuous period of three (3) months and extends up to six (6) months, in addition to the increase in the interest rate pricing mentioned above, the approved limit for the facility shall be reduced to match the level of the turnover achieved.</li>
            <li>Funds received into the account when the principal and/or interest are past due will be applied first to the overdue interest before the outstanding principal amount.</li>
            <li>The facility shall terminate and all sums due to SeedFi hereunder shall become immediately due and payable if the Borrower commits any breach or defaults under the terms of this facility or any other credit facility granted to the Borrower by SeedFi or any other bank.</li>
            <li>SeedFi reserves the right to cancel its commitment unconditionally if the facility remains undrawn or if, in SeedFi’s opinion, there is any deterioration in the Borrower’s creditworthiness and the Borrower shall thereafter be notified of such cancellation.</li>
          </ol>
        </li>

        <li>
          <h4>Covenants</h4>
          <ol style="padding-left: 0px;" type="i">
            <p>The Borrower undertakes that during the validity of the facility while there are any outstanding thereon, it shall: </p>
            <li>
Not, without SeedFi’s prior written consent, make any offer of employment or engage either directly or indirectly any staff of SeedFi that is involved in providing advisory or relationship management services in respect of the facility, during the tenor of the facility or within twelve (12) months of the liquidation/repayment of the facility.</li>
            <li>At any time and from time to time, upon the written request of SeedFi promptly and duly execute and deliver such further instruments and documents and take such further actions as SeedFi reasonably may request to obtain or preserve the full benefits of this facility and the rights and powers herein granted.</li>
          </ol>
        </li>
    <li>
      <ol style="padding-left: 0px;">
        <h4>Voluntary Prepayment</h4>
       <p>The Borrower may repay the whole or any part of the loan upon giving the Lender 7 (seven) business days prior notice. Any amount prepaid may not be redrawn (and shall be applied against scheduled repayments in inverse order of maturity. Any amount prepaid shall include interest and any pro rata amount of fees that become due and payable on the immediately succeeding due date for such fees. This is provided, however, that the Borrower may be charged a fee if the Borrower pays off the loan before maturity. </p>
      </ol>
    </li>

    <li>
      <h4>Assignment</h4>
      <p>The Borrower hereby acknowledges that SeedFi may sell, transfer, assign, novate or otherwise dispose of all or part of its rights or obligations (including by granting of participations) under this Agreement to its lending partner (Sterling Bank) or another bank, financial institution, to a trust, fund, or any other entity which is engaged in or established to make, purchase or investing in loans, securities or other financial assets. The Borrower hereby agrees to execute all documents and take all such steps as may reasonably be required by SeedFi to give effect to such an assignment or transfer.</p>
    </li>

    <li>
      <h4>Cooling Off Period:</h4>
      <p>The Borrower may cancel this loan contract within 3 days after signing without any penalty or charges, however, the Borrower reserves the right to waive this option by notifying SeedFi in writing. </p>
    </li>
      </ol>
</div>

  </div>

  <div>
    <p style="margin-bottom: 40px;">
      Yours Sincerely,  <br />
      For: SeedFi.
    </p>

    <p>
      Pelumi Alli <br />
      CEO
    </p>
  </div>
</body>

</html>`;
};

