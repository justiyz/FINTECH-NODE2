/* eslint-disable max-len */
import dayjs from 'dayjs';
import { decrypt } from '../../utils/lib.util.hash';

export const offerLetterTemplate = async(loanDetails, userOfferLetterDetail, genderType) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OFFER LETTER</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,600;1,700&display=swap"
        rel="stylesheet"
        />
        <style>
        body {
            padding: 40px 20px;
            font-family: 'Poppins', sans-serif;
            font-size: 87.5%;
        }

        ol {
            padding-left: 15px;
        }

        li {
            line-height: 25px;
            margin-bottom: 10px;
        }

        .font-bold {
            font-weight: bold;
        }

        .font-normal {
            font-weight: normal;
        }

        .mb-1 {
            margin-bottom: 10px;
        }

        .mb-2 {
            margin-bottom: 20px;
        }

        .mt-2 {
            margin-top: 20px;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p {
            margin: 0;
        }

        p {
            font-weight: normal;
        }

        .header__date {
            margin-bottom: 20px;
        }

        .header__address {
            margin-bottom: 20px;
        }

        .table__row {
            width: 100%;
        }

        .table__row > * {
            padding: 10px 0px;
        }

        .table__row > *:nth-child(1) {
            width: 20%;
            display: flex;
            white-space: nowrap;
            align-self: flex-start;
        }

        .table__row > *:nth-child(2) {
            width: 80%;
        }

        .table th,
        .table td {
            border: 1px solid #000;
            border-collapse: collapse;
        }

        .table__data-spaced {
            padding: 5px 10px;
        }

        .text-underline {
            text-decoration: underline;
        }
        </style>
    </head>
    <body>
        <header>
        <h4 class="header__date">${dayjs().format('MMMM D, YYYY')}</h4>
        <p class="mb-2">
            SeedFi Avenue <br />
            Lagos Mainland <br />
            Lagos State. <br />
        </p>
        <p class="mb-2">Dear ${genderType},</p>
        </header>

        <section class="mb-2">
        <h3 class="mb-2">RE: OFFER LETTER – INDIVIDUAL LOAN</h3>
        <p class="mb-2">
            Further to your request for the subject facility, we are pleased to inform you that the
            facility has been approved under the following terms and conditions:
        </p>

        <table width="100%">
            <tbody>
            <tr class="table__row">
                <td class="font-bold">Facility Type:</td>
                <td>Loan</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Lender:</td>
                <td class="font-bold">SeedFi</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Borrower:</td>
                <td>${userOfferLetterDetail.full_name} <span class="font-bold">(“Borrower”)</span></td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Bank Verification Number:</td>
                <td>${await decrypt(decodeURIComponent(userOfferLetterDetail.bvn))}</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Amount:</td>
                <td>₦${parseFloat(loanDetails.amount_requested).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} (Naira only)</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Tenor:</td>
                <td>${Number(loanDetails.loan_tenor_in_months)} months</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Purpose:</td>
                <td>${loanDetails.loan_reason}</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Interest Rate:</td>
                <td>${loanDetails.percentage_pricing_band}% p.a. (floating)</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Annual Percentage Rate:</td>
                <td>${parseFloat(loanDetails.monthly_interest * 12).toFixed(2)}%</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Rate Review:</td>
                <td>
                These rates are subject to review/change in line with money market conditions at any
                time or SeedFi’s discretion. SeedFi will send a notification via email or Short
                Message Service (SMS) or written letter in advance of the application of the new rate.
                However, SeedFi has the right to implement the changes at the end of the notice period
                if there is no response to the notice.
                </td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Repayment:</td>
                <td>Equal Monthly repayment of ₦${parseFloat(loanDetails.monthly_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Repayment Source:</td>
                <td>
                The facility will be repaid from the Borrower’s business proceeds and other cashflow
                sources available to the Borrower
                </td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Repayment Mode:</td>
                <td>Interest and principal repayments shall be repaid via users debit cards and/or bank accounts.</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Processing Fee:</td>
                <td> ${parseFloat(loanDetails.percentage_processing_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Insurance Fee:</td>
                <td>${parseFloat(loanDetails.percentage_insurance_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat</td>
            </tr>
            <tr class="table__row">
                <td class="font-bold">Advisory Fee:</td>
                <td>${parseFloat(loanDetails.percentage_advisory_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat</td>
            </tr>
            </tbody>
        </table>
        </section>
        <section>
        <div>
            <h4>CONDITIONS PRECEDENT TO DRAWDOWN</h4>
            <ol>
            <li>Submission of request for the facility.</li>
            <li>Execution of offer letter in acceptance of the facility.</li>
            <li>Acceptance of terms and conditions.</li>
            <li>Payment of upfront fees.</li>
            </ol>
        </div>
        <div>
            <h4>TRANSACTION DYNAMICS</h4>
            <ol>
            <li>
                The Borrower executes offer letter, accepts terms and condition, and any other required
                document.
            </li>
            <li>
                Borrower funds the account for upfront fees which are debited upon receipt of documents.
            </li>
            <li>Loan is booked for approved tenor.</li>
            <li>Borrower’s account is debited monthly for loan repayment.</li>
            </ol>
        </div>
        <ol type="A" class="font-bold">
            <li>Other Conditions</li>
            <ol class="font-normal" style="padding-left: 0px">
            <li>
                This Offer letter shall not be binding unless it is accepted unconditionally and
                returned to SeedFi within 30 days from the date hereof. Upon acceptance, it shall remain
                valid for a period of 90 days, after which it is deemed to have elapsed if the facility
                is not utilized.
            </li>
            <li>
                Without prejudice to the foregoing, SeedFi reserves the right to vary, alter or amend
                any of the terms and conditions of the facility as and when the need arises.
            </li>
            <li>
                All expenses incurred in the arrangement, documentation, and enforcement of payments
                under the facility, including all professional, valuation, legal fees, monitoring,
                taxes, and commissions (if any) would be borne by the Borrower and SeedFi shall be
                entitled to debit the Borrower’s account immediately for such expenses.
            </li>
            <li>
                Utilization of the facility or any part thereof shall be at SeedFi’s discretion and is
                subject to satisfactory documentation and regulation of the Central Bank of Nigeria
                (CBN) as may be laid down from time to time.
            </li>
            <li>
                The Borrower acknowledges that SeedFi is a financial institution regulated by CBN.
            </li>
            <li>
                The Borrower hereby agrees to indemnify SeedFi against any loss howsoever occurring that
                they may incur, because of any misrepresentation, irregularity, or incompleteness in the
                information contained in any document submitted to SeedFi.
            </li>
            <li>
                Where there is a turnover covenant, and there is the default in the turnover covenant
                which exceeds a continuous period of three (3) months and extends up to six (6) months,
                in addition to the increase in the interest rate pricing mentioned above, the approved
                limit for the facility shall be reduced, to match the level of the turnover achieved.
            </li>
            <li>
                Funds received into the account when the principal and/or interest are past due, will be
                applied first to the overdue interest before the outstanding principal amount.
            </li>
            <li>
                The facility shall terminate and all sums due to SeedFi hereunder shall become
                immediately due and payable if the Borrower commits any breach or defaults under the
                terms of this facility or any other credit facility granted to the Borrower by SeedFi or
                any other bank.
            </li>
            <li>
                SeedFi reserves the right to cancel its commitment unconditionally if the facility
                remains undrawn or if, in SeedFi’s opinion, there is any deterioration in the Borrower’s
                creditworthiness and the Borrower shall thereafter be notified of such cancellation.
            </li>
            <li>
                <p>
                Where it is necessary to ensure any or all parts of the facility or security pledged,
                SeedFi shall use any of the Insurance companies in the table below, please indicate
                your choice from the available options.
                </p>
                <table width="100%" class="table mb-2 mt-2" cellspacing="0" cellpadding="0">
                <thead>
                    <tr>
                    <th style="padding: 5px 10px">Insurance Companies</th>
                    <th style="padding: 5px 10px">Select any of the options</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td class="table__data-spaced">Leadway Assurance Company Limited</td>
                    <td class="table__data-spaced"></td>
                    </tr>
                    <tr>
                    <td class="table__data-spaced">Custodian & Allied Insurance Limited</td>
                    <td class="table__data-spaced"></td>
                    </tr>
                    <tr>
                    <td class="table__data-spaced">NEM Insurance Plc</td>
                    <td class="table__data-spaced"></td>
                    </tr>
                    <tr>
                    <td class="table__data-spaced">AIICO Insurance plc</td>
                    <td class="table__data-spaced"></td>
                    </tr>
                    <tr>
                    <td class="table__data-spaced">Prestige Assurance plc</td>
                    <td class="table__data-spaced"></td>
                    </tr>
                    <tr>
                    <td class="table__data-spaced">Sovereign Insurance plc</td>
                    <td class="table__data-spaced"></td>
                    </tr>
                    <tr>
                    <td class="table__data-spaced">Axa Mansard Insurance Plc</td>
                    <td class="table__data-spaced"></td>
                    </tr>
                    <tr>
                    <td class="table__data-spaced">Saham Unitrust Insurance</td>
                    <td class="table__data-spaced"></td>
                    </tr>
                </tbody>
                </table>
            </li>
            <li>
                Please insert any other applicable conditions as stated by Credit or delete if there is
                none.
            </li>
            </ol>

            <li>
            <span>Events of Default</span>
            <p class="font-normal">
                The occurrence of any of the following events shall cause all outstanding under the
                facility to be immediately repayable:
            </p>
            <ol type="i" class="font-normal">
                <li>
                If the Borrower fails to pay monthly interest as and when due or the Borrower fails to
                pay the outstanding principal sum at maturity of the facility; or
                </li>
                <li>
                If the Borrower fails to settle, when due, any outstanding amount owed to and advised
                by SeedFi; or
                </li>
                <li>
                If the Borrower defaults in the performance or observance of any other term,
                condition, or covenant herein and such breach or default shall continue unremedied
                after ten (10) days notice shall have been given to the Borrower or If an order is
                made; or
                </li>
                <li>
                If a distress or execution is levied upon or issued against the Borrower’s property
                and is not discharged within five (5) days or an encumbrancer takes possession of all
                or any part of the Borrower’s undertaking an asset; or
                </li>
                <li>
                If the Borrower ceases or threatens to cease to carry on business or if in the opinion
                of SeedFi, there shall be any material adverse change whatsoever in the business,
                assets, financial condition, and operation of the Borrower; or
                </li>
                <li>
                If the Borrower ceases or threatens to cease to carry on business or if in the opinion
                of SeedFi, there shall be any material adverse change whatsoever in the business,
                assets, financial condition, and operation of the Borrower; or
                </li>
                <li>
                If the Borrower is unable to pay any of the Borrower’s debts to any other party; or
                </li>
                <li>
                If the Borrower does not comply with Environmental and Social (E&S) Laws (where
                applicable).
                </li>
            </ol>
            </li>

            <li>
            <span>Covenants</span>
            <p class="font-normal">
                The Borrower undertakes that during the validity of the facility while there are any
                outstanding thereon, it shall:
            </p>
            <ol type="i" class="font-normal">
                <li>
                Not, without SeedFi’s prior written consent, make any offer of employment or engage
                either directly or indirectly any staff of SeedFi that is involved in providing
                advisory or relationship management services in respect of the facility, during the
                tenor of the facility or within twelve (12) months of the liquidation/repayment of the
                facility.
                </li>
                <li>
                At any time and from time to time, upon the written request of SeedFi promptly and
                duly execute and deliver such further instruments and documents and take such further
                actions as SeedFi reasonably may request to obtain or preserve the full benefits of
                this facility and the rights and powers herein granted.
                </li>
            </ol>
            </li>

            <li>
            <span>Representations and Warranties</span>
            <p class="font-normal">The Borrower represents and warrants to SeedFi as follows:</p>
            <ol type="i" class="font-normal">
                <li>
                The Borrower has the power and authority to take up this facility upon the terms and
                conditions outlined and to observe and perform the Borrower’s obligations hereunder
                </li>
                <li>
                That all information relating to the Borrower or otherwise relevant to matters
                contemplated herein as supplied by the Borrower to SeedFi is true and correct in all
                material respects.
                </li>
                <li>
                There is no pending or threatened action, litigation, arbitration, or administrative
                proceedings before any court, arbitral body, or agency that may materially adversely
                affect the Borrower’s financial condition, or business or affect the Borrower as a
                going concern and impact the Borrower’s ability to repay the loan or which may affect
                the validity or enforceability of this contract. However, if there are pending
                litigations, the Borrower shall so disclose them.
                </li>
            </ol>
            </li>

            <li>
            <span>Default Interest</span>
            <ol type="a" class="font-normal">
                <li>
                If the Borrower fails to pay any amount payable by the Borrower under this facility on
                its due date, interest shall accrue on the overdue amount from the due date up to the
                date of actual payment at a rate which, subject to paragraph (c) below, is 1.00% per
                month in addition to the rate which would have been payable if the overdue amount had,
                during the period of non-payment, constituted a Loan in the currency of the overdue
                amount for successive Interest Periods.
                </li>
                <li>
                SeedFi shall notify the Borrower within 3 days from the first day of default that a
                default charge would be applied to the account 7 days from the date the obligation
                becomes due.
                </li>
                <li>
                <span
                    >If any overdue amount consists of all or part of a Loan which became due on a day
                    which was not the last day of an Interest Period relating to that Loan:</span
                >
                <ol type="i" class="font-normal">
                    <li>
                    the first Interest Period for that overdue amount shall have a duration equal to
                    the unexpired portion of the current Interest Period relating to that Loan; and
                    </li>
                    <li>
                    the rate of interest applying to the overdue amount during that first Interest
                    Period shall be 1.00% per month in addition to the rate which would have applied
                    if the overdue amount had not become due
                    </li>
                </ol>
                </li>
                <li>
                Default interest (if unpaid) arising on an overdue amount shall be compounded with the
                overdue amount at the end of each Interest Period applicable to that overdue amount
                and will remain immediately due and payable
                </li>
            </ol>
            </li>

            <li>
            <span>Facility Review</span>
            <p class="font-normal">
                It is SeedFi’s policy to review facilities from time to time, in the light of changing
                market conditions and or financial conditions of the Borrower. SeedFi reserves the right
                to change, vary, or cancel at any time, with adequate notice to the Borrower, the nature
                and amount of the facility as well as the underlying terms, conditions, and security
                arrangement. Therefore, notwithstanding anything in this Offer to the contrary, this
                facility is regarded as payable at any time at the option of SeedFi.
            </p>
            </li>

            <li>
            <span>Voluntary Prepayment</span>
            <p class="font-normal">
                The Borrower may repay the whole or any part of the loan upon giving the Lender 7
                (seven) Business days prior notice. Any amount prepaid may not be redrawn (and shall be
                applied against scheduled repayments in (inverse order of maturity). Any amount prepaid
                shall include interest and any pro rata amount of fees that become due and payable on
                the immediately succeeding due date for such fees. Provided, however, that the Borrower
                may be charged a fee if the Borrower pays off the loan before maturity.
            </p>
            </li>

            <li>
            <span>Consent to Disclose Credit Information to Credit Bureaus</span>
            <ol type="a" class="font-normal">
                <li>
                The Borrower hereby consents that SeedFi may collect, use and disclose our
                transaction/ information to the appointed Credit Bureau and that the Credit bureau may
                use the information for any approved business purposes as may from time to time be
                prescribed by the Central Bank of Nigeria and/ or any relevant statute.
                </li>
                <li>
                The Borrower also authorizes SeedFi to conduct previous/current credit information
                checks on us/me from other financial institutions through any relevant means/ agency.
                </li>
            </ol>
            </li>

            <li>
            <span>Right of Set-Off</span>
            <ol type="i" class="font-normal">
                <li>
                The Borrower covenants to repay the loan as and when due. In the event that the
                Borrower fails to repay the loan as agreed, and the loan becomes delinquent, SeedFi
                shall have the right to report the delinquent loan to the Central Bank of Nigeria
                (CBN) through the Credit Risk Management System (CRMS) or by any other means, and
                request the CBN to exercise its regulatory power to direct all banks and other
                financial institutions under its regulatory purview to set off the Borrower’s
                indebtedness from any money standing to the Borrower’s credit in any other bank
                account and from any other financial assets they may be holding for the Borrower’s
                benefit.
                </li>
                <li>
                The Borrower covenants and warrants that SeedFi shall have the power to set off the
                Borrower’s indebtedness under this loan agreement from all such monies and funds
                standing to the Borrower’s credit/benefit in all such accounts or from any other
                financial assets belonging to the Borrower and in the custody of any such bank.
                </li>
                <li>
                The Borrower hereby waives any right of confidentiality whether arising under common
                law or statute or in any other manner whatsoever and irrevocably agrees that the
                Borrower shall not argue to the contrary before any court of law, tribunal,
                administrative authority, or any other body acting in any judicial or quasi-judicial
                capacity.
                </li>
            </ol>
            </li>

            <li>
            <span>Lien</span>
            <p class="font-normal">
                The Borrower hereby grants <span class="font-bold">SeedFi</span> an irrevocable and
                unconditional right of lien over the Borrower’s assets. The lien shall remain in force
                for as long as any part of the facility is outstanding.
            </p>
            </li>

            <li>
            <span>Assignment</span>
            <p class="font-normal">
                The Borrower hereby acknowledges that SeedFi may sell, transfer, assign, novate or
                otherwise dispose of all or part of its rights or obligations (including by granting of
                participations) under this Agreement to another bank or financial institution or to a
                trust, fund, or any other entity which is engaged in or established to make, purchase or
                investing in loans, securities or other financial assets. The Borrower hereby agrees to
                execute all documents and take all such steps as may reasonably be required by SeedFi to
                give effect to such an assignment or transfer.
            </p>
            </li>

            <li>
            <span>Material Adverse Event</span>
            <p class="font-normal">
                This Facility shall be withdrawn or terminated if a situation, change, or default occurs
                or threatens to occur which in the opinion of SeedFi would adversely affect the ability
                of the Borrower to perform the Borrower’s obligations as outlined in this offer letter.
                In the event of any such termination, any fees paid by the Borrower to SeedFi shall not
                be refunded.
            </p>
            </li>

            <li>
            <span>Waiver</span>
            <p>
                No failure or delay by SeedFi in exercising any remedy, power, or right hereunder shall
                operate as a waiver or impairment thereof nor shall it affect or impair any such
                remedies, powers, or rights in respect of any subsequent default.
            </p>
            </li>

            <li>
            <span class="text-underline">GLOBAL STANDING INSTRUCTION MANDATE</span>
            <p>
                By signing this offer letter/facility agreement and by drawing the facility, you
                covenant to repay the facility as and when due. In the event that you fail to repay the
                facility as agreed, and the facility becomes delinquent, SeedFi shall have the right to
                report the delinquent facility to the CBN through the Credit Risk Management System
                (CRMS) or by any other means, and request the CBN to exercise its regulatory power to
                direct all banks and other financial institutions under its regulatory purview to
                set-off your indebtedness from any money standing to your credit in any bank account and
                from any other financial assets they may be held for your benefit. You covenant and
                warrant that SeedFi shall have the power to set off your indebtedness under this
                facility agreement from all such monies and funds standing to your credit/benefit in any
                and all such accounts or from any other financial assets belonging to you and in the
                custody of any such bank. You hereby waive any right of confidentiality whether arising
                under common law or statute or in any other manner whatsoever and irrevocably agree that
                you shall not argue to the contrary before any court of law, tribunal, administrative
                authority, or any other body acting in any judicial or quasi-judicial capacity.
            </p>
            </li>

            <li>
            <span>Notices and Complaints</span>
            <ol type="i" class="font-normal">
                <li>
                All notices, consents, requests, demands, and other communications required hereunder
                or given under this Facility shall be in writing addressed to that Party at its
                respective address and delivered personally or sent by SMS, post, courier, or email.
                </li>
                <li>
                <p class="mb-2">
                    Any complaint arising from this facility shall be made in writing and delivered to
                    SeedFi personally or sent by post, courier, or email at the address set out below or
                    at such other current address as is specified by SeedFi to the Borrower by notice;
                </p>
                To: <br />
                Address: <br />
                Attention: <br />
                Email: <br />
                Phone no: <br />
                </li>

                <li>
                <p class="mb-2">
                    Where necessary, the Borrower may escalate to CBN using the following information
                </p>
                To: Consumer Protection Department <br />
                Central Bank of Nigeria <br />
                P.M.B 0187 <br />
                CBD, Abuja <br />
                Email: cpd@cbn.gov.ng <br />
                </li>
            </ol>
            </li>

            <li>
            <span>Cooling Off Period:</span>
            <p>
                The Borrower may cancel this loan contract within 3 days after signing without any
                penalty or charges, however, the Borrower reserves the right to waive this option by
                notifying SeedFi in writing.
            </p>
            </li>
        </ol>
        </section>

        <section style="margin-top: 40px">
        <p class="mb-2">
            Please indicate your acceptance of these terms in the space provided below.
        </p>

        <div class="mb-2">
            Yours faithfully, <br />
            For: <span class="font-bold">XXXXX.</span>
        </div>

        <table width="100%" class="mb-2">
            <tbody>
            <tr class="font-bold">
                <td>INSERT NAME</td>
                <td>INSERT NAME</td>
            </tr>
            <tr class="font-bold">
                <td>Business Manager</td>
                <td>Business Executive</td>
            </tr>
            </tbody>
        </table>

        <div style="margin-top: 40px">
            <h4 class="mb-1">MEMORANDUM OF ACCEPTANCE AND UNDERTAKING</h4>
            <p class="mb-2">
            I, ${userOfferLetterDetail.full_name}. hereby accept the terms and conditions
            contained in this offer letter dated ${dayjs().format('MMMM D, YYYY')}.
            </p>
            <p class="font-bold" style="line-height: 30px">
            Signature: <br />
            Date: <br />
            In the presence of: <br />
            Name: <br />
            Address: <br />
            Occupation: <br />
            Signature: <br />
            Date: <br />
            </p>
        </div>
        </section>
    </body>
    </html>`;
};

