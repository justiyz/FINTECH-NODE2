import dayjs from 'dayjs';
import { PDFDocument, StandardFonts, PageSizes } from 'pdf-lib';
import * as S3 from '../../../api/services/services.s3';
import userQueries from '../../../api/queries/queries.user';
import { decrypt } from '../../utils/lib.util.hash';
import { processAnyData } from '../../../api/services/services.db';
import config from '../../../config';

export const generateOfferLetter = async(user, loanDetails) => {
  const [ userOfferLetterDetail ] = await processAnyData(userQueries.userOfferLetterDetails, [ user.user_id ]);
  const genderType = userOfferLetterDetail.gender === 'male' ? 'sir' : 'ma';
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page = pdfDoc.addPage(PageSizes.Letter);
  // eslint-disable-next-line no-unused-vars
  const { width, height } = page.getSize();
  const fontSize = 11.5;
  page.drawText(`
${dayjs().format('MMMM D, YYYY')}

SeedFi Avenue  
Lagos Mainland
Lagos State. 

Dear ${genderType},

RE: OFFER LETTER – …………………………………… LOAN 
Further to your request for the subject facility, we are pleased to inform you that the facility has been
approved under the following terms and conditions:   

Facility Type:      Loan 
Lender:     SeedFi
Borrower:     ${userOfferLetterDetail.full_name} (“Borrower”)
Bank Verification Number:	      ${await decrypt(decodeURIComponent(userOfferLetterDetail.bvn))}
Amount:     N${parseFloat(loanDetails.amount_requested).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} (naira)
Tenor:      ${Number(loanDetails.loan_tenor_in_months)} months
Purpose:      ${loanDetails.loan_reason}
Interest Rate:      ${loanDetails.percentage_pricing_band}% p.a. (floating) 
Annual Percentage Rate:     ${parseFloat(loanDetails.monthly_interest * 12).toFixed(2)}%
Rate Review:      These rates are subject to review/change in line with money market conditions at any time 
                  or SeedFi’s discretion. SeedFi will send a notification via email or Short Message Service
                  (SMS) or written letter in advance of the application of the new rate. However, SeedFi has 
                  the right to implement the changes at the end of the notice period if there is no response
                  to the notice.
Repayment:      Equal Monthly repayment of N${parseFloat(loanDetails.monthly_repayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} (naira)
Repayment Source:     The facility will be repaid from the Borrower’s business proceeds and other cashflow
                      sources available to the Borrower
Repayment Mode:	Interest and principal repayments shall be repaid via debit cards or bank accounts.`, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });	

  const secondPage = pdfDoc.addPage(PageSizes.Letter);
  secondPage.drawText(`
Processing Fee:     ${parseFloat(loanDetails.percentage_processing_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat
Insurance Fee:      ${parseFloat(loanDetails.percentage_insurance_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat
Advisory Fee:     ${parseFloat(loanDetails.percentage_advisory_fee).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}% flat
Security

CONDITIONS PRECEDENT TO DRAWDOWN
1.  Submission of request for the facility. 
2.  Execution of offer letter in acceptance of the facility.
3.  Acceptance of terms and conditions.
4.  Payment of upfront fees.

TRANSACTION DYNAMICS
1.  The Borrower executes offer letter, accepts terms and condition, and any other required document
2.  Borrower funds the account for upfront fees which are debited upon receipt of documents. 
3.  Loan is booked for approved tenor.
4.  Borrower’s account is debited monthly for loan repayment 

A.  Other Conditions
1.  This Offer letter shall not be binding unless it is accepted unconditionally and returned to SeedFi within 
    30 days from the date hereof. Upon acceptance, it shall remain valid for a period of 90 days, after which 
    it is deemed to have elapsed if the facility is not utilized.
2.  Without prejudice to the foregoing, SeedFi reserves the right to vary, alter or amend any of the terms and 
    conditions of the facility as and when the need arises.
3.  All expenses incurred in the arrangement, documentation, and enforcement of payments under the facility, 
    including all professional, valuation, legal fees, monitoring, taxes, and commissions (if any) would 
    be borne by the Borrower and SeedFi shall be entitled to debit the Borrower’s account immediately for 
    such expenses.
4.  Utilization of the facility or any part thereof shall be at SeedFi’s discretion and is subject to 
    satisfactory documentation and regulation of the Central Bank of Nigeria (CBN) as may be laid down 
    from time to time.`, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const thirdPage = pdfDoc.addPage(PageSizes.Letter);
  thirdPage.drawText(`
5.  The Borrower acknowledges that SeedFi is a financial institution regulated by CBN.
6.  The Borrower hereby agrees to indemnify SeedFi against any loss howsoever occurring that they may incur, 
    because of any misrepresentation, irregularity, or incompleteness in the information contained in any 
    document submitted to SeedFi.
7.  Where there is a turnover covenant, and there is the default in the turnover covenant which exceeds a
    continuous period of three (3) months and extends up to six (6) months, in addition to the increase in 
    the interest rate pricing mentioned above, the approved limit for the facility shall be reduced, to match 
    the level of the turnover achieved.
8.  Funds received into the account when the principal and/or interest are past due, will be applied first to 
    the overdue interest before the outstanding principal amount. 
9.  The facility shall terminate and all sums due to SeedFi hereunder shall become immediately due and 
    payable if the Borrower commits any breach or defaults under the terms of this facility or any other credit
    facility granted to the Borrower by SeedFi or any other bank. 
10. SeedFi reserves the right to cancel its commitment unconditionally if the facility remains undrawn or if, 
    in SeedFi’s opinion, there is any deterioration in the Borrower’s creditworthiness and the Borrower shall 
    thereafter be notified of such cancellation.
11. Where it is necessary to ensure any or all parts of the facility or security pledged, SeedFi shall use 
    any of the Insurance companies in the table below, please indicate your choice from the available options.
    - Leadway Assurance Company Limited
    - Custodian & Allied Insurance Limited
    - NEM Insurance Plc
    - AIICO Insurance plc
    - Prestige Assurance plc
    - Sovereign Insurance plc
    - Axa Mansard Insurance Plc
    - Saham Unitrust Insurance
12. Please insert any other applicable conditions as stated by Credit or delete if there is none.`, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const fourthPage = pdfDoc.addPage(PageSizes.Letter);
  fourthPage.drawText(`
B.  Events of Default
    The occurrence of any of the following events shall cause all outstanding under the facility to be 
    immediately repayable:
    i.  If the Borrower fails to pay monthly interest as and when due or the Borrower fails to pay the 
        outstanding principal sum at maturity of the facility; or
   ii.  If the Borrower fails to settle, when due, any outstanding amount owed to and advised by SeedFi; or
  iii.  If the Borrower defaults in the performance or observance of any other term, condition, or covenant 
        herein and such breach or default shall continue unremedied after ten (10) days notice shall have 
        been given to the Borrower or If an order is made; or
   iv.  If a distress or execution is levied upon or issued against the Borrower’s property and is not 
        discharged within five (5) days or an encumbrancer takes possession of all or any part of the 
        Borrower’s undertaking an asset; or
    v.  If the Borrower ceases or threatens to cease to carry on business or if in the opinion of SeedFi, 
        there shall be any material adverse change whatsoever in the business, assets, financial condition, 
        and operation of the Borrower; or
   vi.  If the Borrower is unable to pay any of the Borrower’s debts to any other party; or
  vii.  If the Borrower does not comply with Environmental and Social (E&S) Laws (where applicable).

C.  Covenants 
    The Borrower undertakes that during the validity of the facility while there are any outstanding 
    thereon, it shall:
    i.  Not, without SeedFi’s prior written consent, make any offer of employment or engage either directly or 
        indirectly any staff of SeedFi that is involved in providing advisory or relationship management 
        services in respect of the facility, during the tenor of the facility or within twelve (12) months 
        of the liquidation/repayment of the facility.
   ii.  At any time and from time to time, upon the written request of SeedFi promptly and duly execute and 
        deliver such further instruments and documents and take such further actions as SeedFi reasonably may 
        request to obtain or preserve the full benefits of this facility and the rights and powers herein granted.
  `, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const fifthPage = pdfDoc.addPage(PageSizes.Letter);
  fifthPage.drawText(`
D.  Representations and Warranties 
    The Borrower represents and warrants to SeedFi as follows:
    i.  The Borrower has the power and authority to take up this facility upon the terms and conditions outlined 
        and to observe and perform the Borrower’s obligations hereunder
   ii.  That all information relating to the Borrower or otherwise relevant to matters contemplated herein as 
        supplied by the Borrower to SeedFi is true and correct in all material respects.
  iii.  There is no pending or threatened action, litigation, arbitration, or administrative proceedings before 
        any court, arbitral body, or agency that may materially adversely affect the Borrower’s financial condition, 
        or business or affect the Borrower as a going concern and impact the Borrower’s ability to repay the loan or
        which may affect the validity or enforceability of this contract. However, if there are pending litigations, 
        the Borrower shall so disclose them.
  
E.  Default Interest
a)  If the Borrower fails to pay any amount payable by the Borrower under this facility on its due date, interest 
    shall accrue on the overdue amount from the due date up to the date of actual payment at a rate which, subject 
    to paragraph (c) below, is 1.00% per month in addition to the rate which would have been payable if the overdue 
    amount had, during the period of non-payment, constituted a Loan in the currency of the overdue amount for 
    successive Interest Periods.   
b)  SeedFi shall notify the Borrower within 3 days from the first day of default that a default charge would be 
    applied to the account 7 days from the date the obligation becomes due.
c)  If any overdue amount consists of all or part of a Loan which became due on a day which was not the last day 
    of an Interest Period relating to that Loan:
      i.  the first Interest Period for that overdue amount shall have a duration equal to the unexpired portion of 
          the current Interest Period relating to that Loan; and
     ii.  the rate of interest applying to the overdue amount during that first Interest Period shall be 1.00% per 
          month in addition to the rate which would have applied if the overdue amount had not become due
d)  Default interest (if unpaid) arising on an overdue amount shall be compounded with the overdue amount at the 
    end of each Interest Period applicable to that overdue amount and will remain immediately due and payable
  `, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const sixthPage = pdfDoc.addPage(PageSizes.Letter);
  sixthPage.drawText(`
F.  Facility Review
    It is SeedFi’s policy to review facilities from time to time, in the light of changing market conditions and 
    or financial conditions of the Borrower. SeedFi reserves the right to change, vary, or cancel at any time, 
    with adequate notice to the Borrower, the nature and amount of the facility as well as the underlying terms, 
    conditions, and security arrangement. Therefore, notwithstanding anything in this Offer to the contrary, 
    this facility is regarded as payable at any time at the option of SeedFi.
  
G.  Voluntary Prepayment 
    The Borrower may repay the whole or any part of the loan upon giving the Lender 7 (seven) Business days prior 
    notice. Any amount prepaid may not be redrawn (and shall be applied against scheduled repayments in 
    (inverse order of maturity). Any amount prepaid shall include interest and any pro rata amount of fees that 
    become due and payable on the immediately succeeding due date for such fees. Provided, however, that the 
    Borrower may be charged a fee if the Borrower pays off the loan before maturity.

H.  Consent to Disclose Credit Information to Credit Bureaus 
a)  The Borrower hereby consents that SeedFi may collect, use and disclose our transaction/ information to the 
    appointed Credit Bureau and that the Credit bureau may use the information for any approved business purposes 
    as may from time to time be prescribed by the Central Bank of Nigeria and/ or any relevant statute.
b)  The Borrower also authorizes SeedFi to conduct previous/current credit information checks on us/me from other 
    financial institutions through any relevant means/ agency.

I.  Right of Set-Off
i.  The Borrower covenants to repay the loan as and when due. In the event that the Borrower fails to repay the 
    loan as agreed, and the loan becomes delinquent, SeedFi shall have the right to report the delinquent loan 
    to the Central Bank of Nigeria (CBN) through the Credit Risk Management System (CRMS) or by any 
    other means, and request the CBN to exercise its regulatory power to direct all banks and other 
    financial institutions under its regulatory purview to set off the Borrower’s indebtedness from any 
    money standing to the Borrower’s credit in any other bank account and from any other financial assets 
    they may be holding for the Borrower’s benefit.
  `, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const seventhPage = pdfDoc.addPage(PageSizes.Letter);
  seventhPage.drawText(`
ii.  The Borrower covenants and warrants that SeedFi shall have the power to set off the Borrower’s indebtedness 
    under this loan agreement from all such monies and funds standing to the Borrower’s credit/benefit 
    in all such accounts or from any other financial assets belonging to the Borrower and in the 
    custody of any such bank.
iii.  The Borrower hereby waives any right of confidentiality whether arising under common law or statute or 
    in any other manner whatsoever and irrevocably agrees that the Borrower shall not argue to the contrary 
    before any court of law, tribunal, administrative authority, or any other body acting in any 
    judicial or quasi-judicial capacity.

J.  Lien
    The Borrower hereby grants SeedFi an irrevocable and unconditional right of lien over the Borrower’s 
    assets. The lien shall remain in force for as long as any part of the facility is outstanding.

K.  Assignment 
    The Borrower hereby acknowledges that SeedFi may sell, transfer, assign, novate or otherwise dispose 
    of all or part of its rights or obligations (including by granting of participations) under this 
    Agreement to another bank or financial institution or to a trust, fund, or any other entity which 
    is engaged in or established to make, purchase or investing in loans, securities or other financial 
    assets. The Borrower hereby agrees to execute all documents and take all such steps as may reasonably 
    be required by SeedFi to give effect to such an assignment or transfer.

L.  Material Adverse Event
    This Facility shall be withdrawn or terminated if a situation, change, or default occurs or threatens 
    to occur which in the opinion of SeedFi would adversely affect the ability of the Borrower to perform 
    the Borrower’s obligations as outlined in this offer letter.  In the event of any such termination,
     any fees paid by the Borrower to SeedFi shall not be refunded. 
  `, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const eightPage = pdfDoc.addPage(PageSizes.Letter);
  eightPage.drawText(`
M.  Waiver
    No failure or delay by SeedFi in exercising any remedy, power, or right hereunder shall operate as a 
    waiver or impairment thereof nor shall it affect or impair any such remedies, powers, or rights 
    in respect of any subsequent default.

N.  GLOBAL STANDING INSTRUCTION MANDATE
    By signing this offer letter/facility agreement and by drawing the facility, you covenant to repay 
    the facility as and when due. 
    In the event that you fail to repay the facility as agreed, and the facility becomes delinquent, 
    SeedFi shall have the right to report the delinquent facility to the CBN through the Credit Risk 
    Management System (CRMS) or by any other means, and request the CBN to exercise its regulatory 
    power to direct all banks and other financial institutions under its regulatory purview to set-off 
    your indebtedness from any money standing to your credit in any bank account and from any other 
    financial assets they may be held for your benefit.
    You covenant and warrant that SeedFi shall have the power to set off your indebtedness under this 
    facility agreement from all such monies and funds standing to your credit/benefit in any and all 
    such accounts or from any other financial assets belonging to you and in the custody of any such bank.
    You hereby waive any right of confidentiality whether arising under common law or statute or in any 
    other manner whatsoever and irrevocably agree that you shall not argue to the contrary before any 
    court of law, tribunal, administrative authority, or any other body acting in any judicial 
    or quasi-judicial capacity.

O.  Notices and Complaints
i.  All notices, consents, requests, demands, and other communications required hereunder or given under 
    this Facility shall be in writing addressed to that Party at its respective address and delivered 
    personally or sent by SMS, post, courier, or email.
  `, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const ninthPage = pdfDoc.addPage(PageSizes.Letter);
  ninthPage.drawText(`
ii. Any complaint arising from this facility shall be made in writing and delivered to SeedFi personally 
    or sent by post, courier, or email at the address set out below or at such other current address as 
    is specified by SeedFi to the Borrower by notice;
    To: SeedFi
    Address: SeedFi Office Address
    Attention: COO
    Email: seedfi@gmail.com (all values to be properly updated)
    Phone no: +23490********
iii.  Where necessary, the Borrower may escalate to CBN using the following information. 
    To: Consumer Protection Department
    Central Bank of Nigeria
    P.M.B 0187
    CBD, Abuja
    Email: cpd@cbn.gov.ng 
  
P.  Cooling Off Period: 
    The Borrower may cancel this loan contract within 3 days after signing without any penalty or charges, 
    however, the Borrower reserves the right to waive this option by notifying SeedFi in writing.

    Please indicate your acceptance of these terms in the space provided below.

Yours faithfully,
For: XXXXX.

INSERT NAME							                                              INSERT NAME				
Business Manager						                                          Business Executive
  `, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const tenthPage = pdfDoc.addPage(PageSizes.Letter);
  tenthPage.drawText(`
MEMORANDUM OF ACCEPTANCE AND UNDERTAKING

I, ${userOfferLetterDetail.full_name}. hereby accept the terms and conditions contained in this offer 
letter dated ${dayjs().format('MMMM D, YYYY')}.

Signature: 
Date: 

In the presence of:

Name:	
Address:		
Occupation: 
Signature:		
Date:		
  `, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont
  });

  const pdfBytes = await pdfDoc.save();

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

  // upload to Amazon s3
  const url = `files/user-documents/${user.user_id}/loan-offer-letter/${loanDetails.loan_id}.pdf`;
  const payload = Buffer.from(pdfBytes, 'binary');
  const data  = await S3.uploadFile(url, payload, 'application/pdf');
  return data;
};

