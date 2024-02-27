export default {
  initiateLoanMandate: `
  INSERT INTO loan_mandate (loan_id, institution_code, request_status, consent_confirmation_url)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  `,

  updateLoanMandateRequestStatus: `
    UPDATE loan_mandate
    SET request_status = $1
    WHERE loan_id = $2;
  `
};
