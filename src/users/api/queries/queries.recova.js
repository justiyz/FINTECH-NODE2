export default {
  createLoanMandate: `
  INSERT INTO loan_mandate (loan_id, institution_code)
  VALUES ($1, $2);
  `
}
