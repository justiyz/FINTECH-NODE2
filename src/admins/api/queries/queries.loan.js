export default {
  fetchLoanDetailsById: `
    SELECT 
        id,
        loan_id,
        user_id,
        round(CAST(amount_requested AS NUMERIC), 2) AS amount_requested,
        loan_reason,
        loan_tenor_in_months,
        round(CAST(total_repayment_amount AS NUMERIC), 2) AS total_repayment_amount,
        round(CAST(total_interest_amount AS NUMERIC), 2) AS total_interest_amount,
        percentage_orr_score,
        percentage_pricing_band,
        round(CAST(monthly_interest AS NUMERIC), 2) AS monthly_interest,
        round(CAST(monthly_repayment AS NUMERIC), 2) AS monthly_repayment,
        round(CAST(total_outstanding_amount AS NUMERIC), 2) AS total_outstanding_amount,
        round(CAST(extra_interests AS NUMERIC), 2) AS extra_interests,
        status,
        loan_decision,
        is_loan_disbursed,
        to_char(DATE(loan_disbursed_at)::date, 'Mon DD, YYYY') AS loan_disbursed_at,
        rejection_reason
    FROM personal_loans
    WHERE loan_id = $1`,

  updateLoanStatus: `
    UPDATE personal_loans
    SET
        updated_at = NOW(),
        status = $2,
        rejection_reason = $3
    WHERE loan_id = $1
    RETURNING id, loan_id, status`,

  updateAdminLoanApprovalTrail: `
    INSERT INTO manual_personal_loan_approval_trail(
        loan_id,
        loan_applicant,
        decision,
        decided_by
    ) VALUES ($1, $2, $3, $4)`,

  fetchLoanRepaymentBreakdown: `
    SELECT 
      id,
      loan_id,
      user_id,
      repayment_order,
      round(CAST(total_payment_amount AS NUMERIC), 2) AS total_payment_amount,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      to_char(DATE(payment_at)::date, 'Mon DD, YYYY') AS payment_at,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    ORDER BY repayment_order ASC
    `,

  fetchLoans: `
   SELECT
    personal_loans.loan_id,
    personal_loans.user_id,
    CONCAT(first_name, ' ', last_name) AS name,
    users.tier,
    personal_loans.amount_requested AS loan_amount,
    loan_tenor_in_months AS duration,
    to_char(DATE (personal_loans.created_at)::date, 'Mon DD YYYY') As date,
    personal_loans.status
  FROM personal_loans
  LEFT JOIN users
  ON personal_loans.user_id = users.user_id
  WHERE (CONCAT(first_name, ' ', last_name) ILIKE TRIM($1) OR $1 IS NULL) AND (personal_loans.status = $2 OR $2 IS NULL) AND 
    ((personal_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
  ORDER BY personal_loans.created_at DESC
  OFFSET $5
  LIMIT $6
   `,

  getLoansCount:`
    SELECT
       COUNT(loan_id) AS total_count
    FROM personal_loans
    LEFT JOIN users
  ON personal_loans.user_id = users.user_id
    WHERE (CONCAT(users.first_name, ' ', users.last_name) ILIKE TRIM($1) OR $1 IS NULL) AND (personal_loans.status = $2 OR $2 IS NULL) AND 
    ((personal_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
  `,

  fetchAllLoans:`
   SELECT
      personal_loans.loan_id,
      personal_loans.user_id,
      CONCAT(first_name, ' ', last_name) AS name,
      users.tier,
      personal_loans.amount_requested AS loan_amount,
      loan_tenor_in_months AS duration,
      to_char(DATE (personal_loans.created_at)::date, 'Mon DD YYYY') As date,
      personal_loans.status
  FROM personal_loans
  LEFT JOIN users
  ON personal_loans.user_id = users.user_id
  WHERE (CONCAT(first_name, ' ', last_name) ILIKE TRIM($1) OR $1 IS NULL) AND (personal_loans.status = $2 OR $2 IS NULL) AND 
   ((personal_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
   ORDER BY personal_loans.created_at DESC
   `,
      
  fetchRepaidLoans: `
      SELECT 
          personal_loan_payment_schedules.loan_id,
          personal_loan_payment_schedules.user_id,
          CONCAT(first_name, ' ', last_name) AS name,
          users.tier,
          personal_loan_payment_schedules.total_payment_amount AS repayment_amount,
          personal_loan_payment_schedules.repayment_order AS repayment_schedule,
          loan_tenor_in_months AS loan_duration,
          to_char(DATE (personal_loan_payment_schedules.payment_at)::date, 'Mon DD YYYY') As repayment_date,
          personal_loan_payment_schedules.status
      FROM personal_loan_payment_schedules
      LEFT JOIN users
      ON personal_loan_payment_schedules.user_id = users.user_id
      LEFT JOIN personal_loans
      ON personal_loan_payment_schedules.loan_id = personal_loans.loan_id
      WHERE personal_loan_payment_schedules.status = 'paid' AND (CONCAT(first_name, ' ', last_name) ILIKE TRIM($1) OR $1 IS NULL)  AND 
      ((personal_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL))
      ORDER BY personal_loan_payment_schedules.payment_at DESC
      OFFSET $4
      LIMIT $5
  `,

  getRepaidLoansCount:`
    SELECT
       COUNT(loan_id) AS total_count
    FROM personal_loan_payment_schedules
    LEFT JOIN users
    ON personal_loan_payment_schedules.user_id = users.user_id
    WHERE personal_loan_payment_schedules.status = 'paid' AND (CONCAT(first_name, ' ', last_name) ILIKE TRIM($1) OR $1 IS NULL)  AND 
    ((personal_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL))
  `,
  
  fetchAllRepaidLoans: `
   SELECT 
      personal_loan_payment_schedules.loan_id,
      personal_loan_payment_schedules.user_id,
      CONCAT(first_name, ' ', last_name) AS name,
      users.tier,
      personal_loan_payment_schedules.total_payment_amount AS repayment_amount,
      personal_loan_payment_schedules.repayment_order AS repayment_schedule,
      loan_tenor_in_months AS loan_duration,
      to_char(DATE (personal_loan_payment_schedules.payment_at)::date, 'Mon DD YYYY') As repayment_date,
      personal_loan_payment_schedules.status
  FROM personal_loan_payment_schedules
  LEFT JOIN users
  ON personal_loan_payment_schedules.user_id = users.user_id
  LEFT JOIN personal_loans
  ON personal_loan_payment_schedules.loan_id = personal_loans.loan_id
  WHERE personal_loan_payment_schedules.status = 'paid' AND personal_loans.loan_id = personal_loan_payment_schedules.loan_id AND (CONCAT(first_name, ' ', last_name) ILIKE TRIM($1) OR $1 IS NULL)  AND 
    ((personal_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL))
  ORDER BY personal_loan_payment_schedules.payment_at DESC 
  `
};
  
