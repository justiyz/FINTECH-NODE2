export default {
  initiateLoanMandate: `
  INSERT INTO loan_mandate (loan_id, institution_code, request_status, consent_approval_url)
  VALUES ($1, $2, $3, $4);
  `,

  updateLoanMandateRequestStatus: `
    UPDATE loan_mandate
    SET request_status = $1
    WHERE loan_id = $2;
  `
}
