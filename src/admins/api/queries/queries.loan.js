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
        to_char(DATE (created_at)::date, 'Mon DD YYYY') As application_date,
        rejection_reason,
        offer_letter_url
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

  updateAdminClusterLoanApprovalTrail: `
    INSERT INTO manual_cluster_loan_approval_trail(
        loan_id,
        member_loan_id,
        loan_applicant,
        decision,
        decided_by
    ) VALUES ($1, $2, $3, $4, $5)`,

  fetchClusterMemberLoanDetailsById: `
    SELECT 
        id,
        cluster_id,
        member_loan_id,
        loan_id,
        user_id,
        round(CAST(amount_requested AS NUMERIC), 2) AS amount_requested,
        cluster_name,
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
        is_loan_initiator,
        loan_decision,
        is_loan_disbursed,
        to_char(DATE(loan_disbursed_at)::date, 'Mon DD, YYYY') AS loan_disbursed_at,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') As application_date,
        rejection_reason,
        offer_letter_url
    FROM cluster_member_loans
    WHERE member_loan_id = $1`,

  updateClusterMemberLoanStatus: `
    UPDATE cluster_member_loans
    SET
        updated_at = NOW(),
        status = $2,
        rejection_reason = $3
    WHERE member_loan_id = $1
    RETURNING id, member_loan_id, loan_id, cluster_id, user_id, status`,

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
    personal_loans.id,
    personal_loans.loan_id,
    personal_loans.user_id,
    TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
    users.tier,
    personal_loans.amount_requested AS loan_amount,
    loan_tenor_in_months AS duration,
    to_char(DATE(personal_loans.loan_disbursed_at)::date, 'Mon DD, YYYY') AS loan_disbursed_at,
    to_char(DATE (personal_loans.created_at)::date, 'Mon DD YYYY') As application_date,
    personal_loans.status
  FROM personal_loans
  LEFT JOIN users
  ON personal_loans.user_id = users.user_id
  WHERE (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
    OR $1 IS NULL) 
  AND (personal_loans.status = $2 OR $2 IS NULL) 
  AND ((personal_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
  ORDER BY personal_loans.created_at DESC
  OFFSET $5
  LIMIT $6
   `,

  getLoansCount: `
    SELECT
       COUNT(loan_id) AS total_count
    FROM personal_loans
    LEFT JOIN users
    ON personal_loans.user_id = users.user_id
    WHERE (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
      OR $1 IS NULL) 
    AND (personal_loans.status = $2 OR $2 IS NULL) 
    AND ((personal_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
  `,

  fetchAllLoans: `
   SELECT
      personal_loans.id,
      personal_loans.loan_id,
      personal_loans.user_id,
      TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
      users.tier,
      personal_loans.amount_requested AS loan_amount,
      loan_tenor_in_months AS duration,
      to_char(DATE (personal_loans.created_at)::date, 'Mon DD YYYY') As application_date,
      to_char(DATE(personal_loans.loan_disbursed_at)::date, 'Mon DD, YYYY') AS loan_disbursed_at,
      personal_loans.status
  FROM personal_loans
  LEFT JOIN users
  ON personal_loans.user_id = users.user_id
  WHERE (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
    OR $1 IS NULL)
  AND (personal_loans.status = $2 OR $2 IS NULL) 
  AND ((personal_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
  ORDER BY personal_loans.created_at DESC
   `,
      
  fetchRepaidLoans: `
      SELECT 
          personal_loan_payment_schedules.id,
          personal_loan_payment_schedules.loan_repayment_id,
          personal_loan_payment_schedules.loan_id,
          personal_loan_payment_schedules.user_id,
          TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
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
      WHERE personal_loan_payment_schedules.status = 'paid' 
      AND (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
        OR $1 IS NULL)  
      AND ((personal_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL))
      ORDER BY personal_loan_payment_schedules.payment_at DESC
      OFFSET $4
      LIMIT $5
  `,

  getRepaidLoansCount: `
    SELECT
       COUNT(loan_id) AS total_count
    FROM personal_loan_payment_schedules
    LEFT JOIN users
    ON personal_loan_payment_schedules.user_id = users.user_id
    WHERE personal_loan_payment_schedules.status = 'paid' 
    AND ((TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1))
      OR $1 IS NULL)  
    AND ((personal_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL))
  `,
  
  fetchAllRepaidLoans: `
   SELECT 
      personal_loan_payment_schedules.id,
      personal_loan_payment_schedules.loan_repayment_id,
      personal_loan_payment_schedules.loan_id,
      personal_loan_payment_schedules.user_id,
      TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
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
  WHERE personal_loan_payment_schedules.status = 'paid' 
  AND personal_loans.loan_id = personal_loan_payment_schedules.loan_id 
  AND (((TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)))
    OR $1 IS NULL) 
  AND ((personal_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL))
  ORDER BY personal_loan_payment_schedules.payment_at DESC 
  `,

  fetchRescheduledLoans: `
      SELECT 
        personal_loans.id,
        personal_loans.loan_id,
        personal_loans.user_id,
        TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
        users.tier,
        personal_loans.amount_requested AS loan_amount,
        personal_loans.reschedule_extension_days AS loan_extention_duration,
        personal_loans.status 
      FROM personal_loans
      LEFT JOIN users 
      ON personal_loans.user_id = users.user_id
      WHERE personal_loans.reschedule_extension_days IS NOT NULL
      AND personal_loans.is_rescheduled = true
      AND(TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
        OR $1 IS NULL) 
      AND (personal_loans.status = $2 OR $2 IS NULL) 
      ORDER BY personal_loans.created_at DESC
      OFFSET $3
      LIMIT $4
  `,

  fetchRescheduledLoansCount: `
  SELECT
    COUNT(loan_id) AS total_count
  FROM personal_loans
  LEFT JOIN users
  ON personal_loans.user_id = users.user_id
  WHERE personal_loans.reschedule_extension_days IS NOT NULL
    AND personal_loans.is_rescheduled = true
    AND(TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
    OR $1 IS NULL) 
  AND (personal_loans.status = $2 OR $2 IS NULL) 
  `,

  fetchAllRescheduledLoans: `
    SELECT 
        personal_loans.id,
        personal_loans.loan_id,
        personal_loans.user_id,
        TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
        users.tier,
        personal_loans.amount_requested AS loan_amount,
        personal_loans.reschedule_extension_days AS loan_duration,
        personal_loans.status 
    FROM personal_loans
    LEFT JOIN users 
    ON personal_loans.user_id = users.user_id
    WHERE personal_loans.reschedule_extension_days IS NOT NULL
    AND personal_loans.is_rescheduled = true
    AND(TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
      OR $1 IS NULL) 
    AND (personal_loans.status = $2 OR $2 IS NULL) 
    ORDER BY personal_loans.created_at DESC 
  `,

  fetchSingleRescheduledLoanDetails: `
      SELECT 
          personal_loans.loan_id,
          personal_loans.user_id,      
          TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
          users.tier,
          users.status,
          personal_loans.amount_requested AS loan_amount,
          personal_loans.loan_reason,
          personal_loans.loan_tenor_in_months AS loan_duration,
          round(CAST(personal_loans.total_repayment_amount AS NUMERIC), 2) AS total_repayment_amount,
          round(CAST(personal_loans.total_interest_amount AS NUMERIC), 2) AS total_interest_amount,
          personal_loans.percentage_orr_score,
          personal_loans.percentage_pricing_band,
          round(CAST(personal_loans.monthly_interest AS NUMERIC), 2) AS monthly_interest,
          round(CAST(personal_loans.monthly_repayment AS NUMERIC), 2) AS monthly_repayment,
          round(CAST(personal_loans.total_outstanding_amount AS NUMERIC), 2) AS total_outstanding_amount,
          round(CAST(personal_loans.extra_interests AS NUMERIC), 2) AS extra_interests,
          personal_loans.status,
          personal_loans.loan_decision,
          personal_loans.is_loan_disbursed,
          to_char(DATE(personal_loans.loan_disbursed_at)::date, 'Mon DD, YYYY') AS loan_disbursed_at,
          to_char(DATE (personal_loans.created_at)::date, 'Mon DD YYYY') As application_date,
          personal_loans.reschedule_loan_tenor_in_months AS new_tenure,
          personal_loans.reschedule_extension_days AS reschedule_extension_days,
          personal_loans.is_rescheduled,
          personal_loans.reschedule_count,
          to_char(DATE(personal_loans.reschedule_at)::date, 'Mon DD, YYYY') AS loan_rescheduled_at
    FROM personal_loans
    LEFT JOIN users ON personal_loans.user_id = users.user_id
    WHERE personal_loans.loan_id = $1
  `,

  fetchNewRepaymentBreakdown: `
    SELECT 
        id,
        loan_repayment_id,
        loan_id,
        user_id,
        total_payment_amount AS repayment_amount,
        repayment_order AS repayment_schedule,
        to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
        to_char(DATE(payment_at)::date, 'Mon DD YYYY') As payment_at,
        status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    ORDER BY repayment_order
  `,

  fetchClusterLoans: `
      SELECT
      	cluster_loans.id,
        cluster_loans.loan_id,
        cluster_loans.cluster_id,      
        cluster_loans.cluster_name,
        cluster_loans.total_repayment_amount As Loan_amount,
        COUNT(cluster_member_loans.member_loan_id) As total_member,
        to_char(DATE(cluster_loans.loan_disbursed_at)::date, 'Mon DD, YYYY') AS date_received,
        cluster_loans.status,
        cluster_loans.loan_tenor_in_months As duration,
        cluster_loans.created_at
      FROM cluster_loans
      LEFT JOIN cluster_member_loans
      ON cluster_loans.loan_id = cluster_member_loans.loan_id
      WHERE cluster_loans.is_loan_disbursed = true
      AND (cluster_loans.cluster_name ILIKE TRIM($1) OR $1 IS NULL) AND (cluster_loans.status = $2 OR $2 IS NULL)
      AND ((cluster_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
      GROUP BY 1, 2, 3, 4, 5, 7, 8, 9
      ORDER BY cluster_loans.created_at DESC
      OFFSET $5
      LIMIT $6
`,

  fetchClusterLoanCount: `
    SELECT COUNT(cluster_id) AS total_count
    FROM cluster_loans
    WHERE cluster_loans.is_loan_disbursed = true 
    AND (cluster_loans.cluster_name ILIKE TRIM($1) OR $1 IS NULL) AND (cluster_loans.status = $2 OR $2 IS NULL)
    AND ((cluster_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))

`,

  fetchAllClusterLoans: `
      SELECT
        cluster_loans.id,
        cluster_loans.loan_id, 
        cluster_loans.cluster_id,
        cluster_loans.cluster_name,
        cluster_loans.total_repayment_amount As Loan_amount,
        COUNT(cluster_member_loans.member_loan_id) As total_member,
        to_char(DATE(cluster_loans.loan_disbursed_at)::date, 'Mon DD, YYYY') AS date_received,
        cluster_loans.status,
        cluster_loans.loan_tenor_in_months As duration,
        cluster_loans.created_at
      FROM cluster_loans
      LEFT JOIN cluster_member_loans
      ON cluster_loans.loan_id = cluster_member_loans.loan_id
      WHERE cluster_loans.is_loan_disbursed = true AND (cluster_loans.cluster_name ILIKE TRIM($1) OR $1 IS NULL) AND (cluster_loans.status = $2 OR $2 IS NULL)
      AND ((cluster_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
      GROUP BY 1, 2, 3, 4, 5, 7, 8, 9
      ORDER BY cluster_loans.created_at DESC
`,

  fetchMembersDetailsOfAClusterLoan: `
        SELECT 
            users.id,
            users.user_id,
            users.tier,
            CONCAT(users.first_name,' ', users.middle_name, ' ',  users.last_name) As name,
            users.status As users_status,
            cluster_member_loans.loan_id,
            cluster_member_loans.member_loan_id,
            cluster_member_loans.amount_requested As loan_amount,
            cluster_member_loans.monthly_interest As interest_rate,
            round(CAST(cluster_member_loans.total_repayment_amount AS NUMERIC), 2) AS total_repayment_amount,
            cluster_member_loans.loan_disbursed_at As date_received,
            cluster_member_loans.total_outstanding_amount As loan_amount_remaining,
            cluster_member_loans.loan_tenor_in_months As duration,
            cluster_member_loans.status As loan_status,
            CONCAT(cluster_member_loans.cluster_name, ' ', 'group loan') As loan_reason
        FROM cluster_member_loans
        LEFT JOIN users
        ON cluster_member_loans.user_id = users.user_id
        WHERE cluster_member_loans.loan_id = $1
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
`,

  fetchClusterLoanRepaymentBreakdown: `
      SELECT DISTINCT
            TRIM(CONCAT(users.first_name, ' ', users.last_name)),
            cluster_member_loan_payment_schedules.id,
            cluster_member_loan_payment_schedules.loan_repayment_id,
            cluster_member_loan_payment_schedules.loan_id,
            cluster_member_loan_payment_schedules.cluster_id,
            cluster_member_loan_payment_schedules.member_loan_id,
            cluster_member_loan_payment_schedules.user_id,
            cluster_loans.cluster_name,
            cluster_member_loan_payment_schedules.total_payment_amount AS repayment_amount,
            cluster_member_loan_payment_schedules.repayment_order AS repayment_schedule,
            cluster_loans.loan_tenor_in_months AS loan_duration,
            to_char(DATE(cluster_member_loan_payment_schedules.payment_at)::date, 'Mon DD YYYY') AS repayment_date,
            cluster_member_loan_payment_schedules.status
      FROM cluster_member_loan_payment_schedules
      LEFT JOIN cluster_loans ON cluster_member_loan_payment_schedules.loan_id = cluster_loans.loan_id
      LEFT JOIN users ON cluster_member_loan_payment_schedules.user_id = users.user_id
      WHERE cluster_member_loan_payment_schedules.status = 'paid' AND cluster_member_loan_payment_schedules.member_loan_id = $1
      ORDER BY cluster_member_loan_payment_schedules.repayment_order;
`,

  fetchClusterLoanDetailsById: `
      SELECT 
          id,
          loan_id,
          user_id,
          round(CAST(amount_requested AS NUMERIC), 2) AS amount_requested,
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
          to_char(DATE (created_at)::date, 'Mon DD YYYY') As application_date,
          rejection_reason,
          offer_letter_url
      FROM cluster_member_loans
      WHERE loan_id = $1
`,
  fetchClusterLoanDetailsOfEachUser: `
      SELECT 
          id,
          loan_id,
          user_id,
          member_loan_id,
          round(CAST(amount_requested AS NUMERIC), 2) AS amount_requested,
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
          to_char(DATE (created_at)::date, 'Mon DD YYYY') As application_date,
          rejection_reason,
          offer_letter_url
      FROM cluster_member_loans
      WHERE member_loan_id = $1
`,

  fetchInReviewClusterLoans: `
    SELECT
            users.id,
            users.user_id,
            users.tier,
            CONCAT(users.first_name,' ', users.middle_name, ' ',  users.last_name) As name,
            cluster_member_loans.loan_id,
            cluster_member_loans.member_loan_id,
            cluster_member_loans.amount_requested As loan_amount,
            cluster_member_loans.loan_tenor_in_months AS loan_duration,
            cluster_member_loans.loan_disbursed_at As date_received,
            cluster_member_loans.status As loan_status,
            cluster_member_loans.cluster_name
    FROM cluster_member_loans
    LEFT JOIN users
    ON cluster_member_loans.user_id = users.user_id
    WHERE cluster_member_loans.status = 'in review' 
        AND (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
        OR $1 IS NULL)
        AND (cluster_member_loans.cluster_name ILIKE TRIM($1) OR $1 IS NULL) AND (cluster_member_loans.status = $2 OR $2 IS NULL)
        AND ((cluster_member_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
        ORDER BY cluster_member_loans.created_at DESC
        OFFSET $5
        LIMIT $6
   `,

  fetchInReviewClusterLoanCount: `
    SELECT COUNT(cluster_id) AS total_count
    FROM cluster_member_loans
    LEFT JOIN users
    ON cluster_member_loans.user_id = users.user_id
    WHERE cluster_member_loans.status = 'in review'
    AND (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
    OR $1 IS NULL)
    AND (cluster_member_loans.cluster_name ILIKE TRIM($1) OR $1 IS NULL) AND (cluster_member_loans.status = $2 OR $2 IS NULL)
    AND ((cluster_member_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
`,

  fetchAllInReviewClusterLoans: `
          SELECT
              users.id,
              users.user_id,
              users.tier,
              CONCAT(users.first_name,' ', users.middle_name, ' ',  users.last_name) As name,
              cluster_member_loans.loan_id,
              cluster_member_loans.member_loan_id,
              cluster_member_loans.amount_requested As loan_amount,
              cluster_member_loans.loan_tenor_in_months AS loan_duration,
              cluster_member_loans.loan_disbursed_at As date_received,
              cluster_member_loans.status As loan_status,
              cluster_member_loans.cluster_name
        FROM cluster_member_loans
        LEFT JOIN users
        ON cluster_member_loans.user_id = users.user_id
        WHERE cluster_member_loans.status = 'in review' 
        AND (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
        OR $1 IS NULL)
        AND (cluster_member_loans.cluster_name ILIKE TRIM($1) OR $1 IS NULL) AND (cluster_member_loans.status = $2 OR $2 IS NULL)
        AND ((cluster_member_loans.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
        ORDER BY cluster_member_loans.created_at DESC
  `,


  fetchAClusterInReviewLoanMemberDetails: `
          SELECT 
              users.id,
              users.user_id,
              users.tier,
              users.status As users_status,
              cluster_member_loans.loan_id,
              cluster_member_loans.member_loan_id,
              CONCAT(users.first_name,' ', users.middle_name, ' ',  users.last_name) As name,
              cluster_member_loans.amount_requested As loan_amount,
              cluster_member_loans.monthly_interest As interest_rate,
              round(CAST(cluster_member_loans.total_repayment_amount AS NUMERIC), 2) AS total_repayment_amount,
              cluster_member_loans.loan_disbursed_at As date_received,
              cluster_member_loans.total_outstanding_amount As loan_amount_remaining,
              cluster_member_loans.status As loan_status,
        CONCAT(cluster_member_loans.cluster_name, ' ', 'group loan') As loan_reason
        FROM cluster_member_loans
        LEFT JOIN users
        ON cluster_member_loans.user_id = users.user_id
        WHERE cluster_member_loans.member_loan_id = $1
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13

 `,

  fetchAllClusterLoanRepaymentBreakdown: `
      SELECT DISTINCT
          TRIM(CONCAT(users.first_name, ' ', users.last_name)) As name,
          cluster_member_loan_payment_schedules.id,
          cluster_member_loan_payment_schedules.loan_repayment_id,
          cluster_member_loan_payment_schedules.loan_id,
          cluster_member_loan_payment_schedules.cluster_id,
          cluster_member_loan_payment_schedules.member_loan_id,
          cluster_member_loan_payment_schedules.user_id,
          cluster_loans.cluster_name,
          cluster_member_loan_payment_schedules.total_payment_amount AS repayment_amount,
          cluster_member_loan_payment_schedules.repayment_order AS repayment_schedule,
          cluster_loans.loan_tenor_in_months AS loan_duration,
          to_char(DATE(cluster_member_loan_payment_schedules.payment_at)::date, 'Mon DD YYYY') AS repayment_date,
          cluster_member_loan_payment_schedules.status
      FROM cluster_member_loan_payment_schedules
      LEFT JOIN cluster_loans ON cluster_member_loan_payment_schedules.loan_id = cluster_loans.loan_id
      LEFT JOIN users ON cluster_member_loan_payment_schedules.user_id = users.user_id
      WHERE cluster_member_loan_payment_schedules.status = 'paid'
      ORDER BY cluster_member_loan_payment_schedules.repayment_order;
 `,

  fetchRescheduledClusterLoans: `
        SELECT 
          cluster_member_loans.id,
          cluster_member_loans.loan_id,
          cluster_member_loans.user_id,
          cluster_member_loans.member_loan_id,
          TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) AS name,
          cluster_member_loans.cluster_name,
          cluster_member_loans.amount_requested AS loan_amount,
          cluster_member_loans.reschedule_extension_days AS loan_extention_duration,
          cluster_member_loans.status 
        FROM cluster_member_loans
        LEFT JOIN users 
        ON  cluster_member_loans.user_id = users.user_id
        WHERE cluster_member_loans.reschedule_extension_days IS NOT NULL
        AND  cluster_member_loans.is_rescheduled = true
        AND(TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
        OR $1 IS NULL) 
        AND ( cluster_member_loans.status = $2 OR $2 IS NULL) 
        ORDER BY cluster_member_loans.created_at DESC
        OFFSET $3
        LIMIT $4
 `,

  rescheduledClusterLoansCount: `
    SELECT COUNT(loan_id) AS total_count
    FROM cluster_member_loans
    LEFT JOIN users 
    ON  cluster_member_loans.user_id = users.user_id
    WHERE cluster_member_loans.reschedule_extension_days IS NOT NULL
        AND  cluster_member_loans.is_rescheduled = true
        AND(TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
        OR $1 IS NULL) 
        AND ( cluster_member_loans.status = $2 OR $2 IS NULL) 
 `,

  fetchAllClusterRescheduledLoans: `
      SELECT 
          cluster_member_loans.id,
          cluster_member_loans.loan_id,
          cluster_member_loans.user_id,
          cluster_member_loans.member_loan_id,
          TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) AS name,
          cluster_member_loans.cluster_name,
          cluster_member_loans.amount_requested AS loan_amount,
          cluster_member_loans.reschedule_extension_days AS loan_extention_duration,
          cluster_member_loans.status 
    FROM cluster_member_loans
    LEFT JOIN users 
    ON  cluster_member_loans.user_id = users.user_id
    WHERE cluster_member_loans.reschedule_extension_days IS NOT NULL
    AND  cluster_member_loans.is_rescheduled = true
    AND(TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
    OR $1 IS NULL) 
    AND ( cluster_member_loans.status = $2 OR $2 IS NULL) 
    ORDER BY cluster_member_loans.created_at DESC      
`,

  fetchSingleRescheduledClusterLoanDetails: `
      SELECT 
          cluster_member_loans.loan_id,
          cluster_member_loans.user_id,
          cluster_member_loans.member_loan_id,      
          TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
          users.tier,
          users.status,
          cluster_member_loans.amount_requested AS loan_amount,
          CONCAT(cluster_member_loans.cluster_name, ' ', 'group loan'),
          cluster_member_loans.loan_tenor_in_months AS loan_duration,
          round(CAST(cluster_member_loans.total_repayment_amount AS NUMERIC), 2) AS total_repayment_amount,
          round(CAST(cluster_member_loans.total_interest_amount AS NUMERIC), 2) AS total_interest_amount,
          cluster_member_loans.percentage_orr_score,
          cluster_member_loans.percentage_pricing_band,
          round(CAST(cluster_member_loans.monthly_interest AS NUMERIC), 2) AS monthly_interest,
          round(CAST(cluster_member_loans.monthly_repayment AS NUMERIC), 2) AS monthly_repayment,
          round(CAST(cluster_member_loans.total_outstanding_amount AS NUMERIC), 2) AS total_outstanding_amount,
          round(CAST(cluster_member_loans.extra_interests AS NUMERIC), 2) AS extra_interests,
          cluster_member_loans.status,
          cluster_member_loans.loan_decision,
          cluster_member_loans.is_loan_disbursed,
          to_char(DATE(cluster_member_loans.loan_disbursed_at)::date, 'Mon DD, YYYY') AS loan_disbursed_at,
          to_char(DATE (cluster_member_loans.created_at)::date, 'Mon DD YYYY') As application_date,
          cluster_member_loans.reschedule_loan_tenor_in_months AS new_tenure,
          cluster_member_loans.reschedule_extension_days AS reschedule_extension_days,
          cluster_member_loans.is_rescheduled,
          cluster_member_loans.reschedule_count,
          to_char(DATE(cluster_member_loans.reschedule_at)::date, 'Mon DD, YYYY') AS loan_rescheduled_at
      FROM cluster_member_loans
      LEFT JOIN users ON cluster_member_loans.user_id = users.user_id
      WHERE cluster_member_loans.member_loan_id = $1
`,

  fetchNewClusterRepaymentBreakdown: `
    SELECT 
        id,
        loan_repayment_id,
        loan_id,
        user_id,
        member_loan_id,
        total_payment_amount AS repayment_amount,
        repayment_order AS repayment_schedule,
        to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
        to_char(DATE(payment_at)::date, 'Mon DD YYYY') As payment_at,
        status
    FROM cluster_member_loan_payment_schedules
    WHERE member_loan_id = $1
    ORDER BY repayment_order
  `,

  fetchClusterLoanRepayments: `
      SELECT DISTINCT
          TRIM(CONCAT(users.first_name, ' ', users.last_name)) As name,
          cluster_member_loan_payment_schedules.id,
          cluster_member_loan_payment_schedules.loan_repayment_id,
          cluster_member_loan_payment_schedules.loan_id,
          cluster_member_loan_payment_schedules.cluster_id,
          cluster_member_loan_payment_schedules.member_loan_id,
          cluster_member_loan_payment_schedules.user_id,
          cluster_loans.cluster_name,
          cluster_member_loan_payment_schedules.total_payment_amount AS repayment_amount,
          cluster_member_loan_payment_schedules.repayment_order AS repayment_schedule,
          cluster_loans.loan_tenor_in_months AS loan_duration,
          to_char(DATE(cluster_member_loan_payment_schedules.payment_at)::date, 'Mon DD YYYY') AS repayment_date,
          cluster_member_loan_payment_schedules.status
      FROM cluster_member_loan_payment_schedules
      LEFT JOIN cluster_loans ON cluster_member_loan_payment_schedules.loan_id = cluster_loans.loan_id
      LEFT JOIN users ON cluster_member_loan_payment_schedules.user_id = users.user_id
      WHERE cluster_member_loan_payment_schedules.status = 'paid' AND 
      (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
      OR $1 IS NULL)
      AND ((cluster_member_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL)) 
      ORDER BY cluster_member_loan_payment_schedules.repayment_order
      OFFSET $4
      LIMIT $5
`,

  fetchClusterLoanRepaymentCount: `
      SELECT COUNT(loan_repayment_id) As total_count
      FROM cluster_member_loan_payment_schedules
      LEFT JOIN cluster_loans ON cluster_member_loan_payment_schedules.loan_id = cluster_loans.loan_id
      LEFT JOIN users ON cluster_member_loan_payment_schedules.user_id = users.user_id
      WHERE cluster_member_loan_payment_schedules.status = 'paid' AND 
      (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
      OR $1 IS NULL) 
      AND ((cluster_member_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL)) 
`,

  fetchAllClusterLoanRepayment: `
        SELECT DISTINCT
            TRIM(CONCAT(users.first_name, ' ', users.last_name)) As name,
            cluster_member_loan_payment_schedules.id,
            cluster_member_loan_payment_schedules.loan_repayment_id,
            cluster_member_loan_payment_schedules.loan_id,
            cluster_member_loan_payment_schedules.cluster_id,
            cluster_member_loan_payment_schedules.member_loan_id,
            cluster_member_loan_payment_schedules.user_id,
            cluster_loans.cluster_name,
            cluster_member_loan_payment_schedules.total_payment_amount AS repayment_amount,
            cluster_member_loan_payment_schedules.repayment_order AS repayment_schedule,
            cluster_loans.loan_tenor_in_months AS loan_duration,
            to_char(DATE(cluster_member_loan_payment_schedules.payment_at)::date, 'Mon DD YYYY') AS repayment_date,
            cluster_member_loan_payment_schedules.status
            FROM cluster_member_loan_payment_schedules
            LEFT JOIN cluster_loans ON cluster_member_loan_payment_schedules.loan_id = cluster_loans.loan_id
            LEFT JOIN users ON cluster_member_loan_payment_schedules.user_id = users.user_id
        WHERE cluster_member_loan_payment_schedules.status = 'paid' AND 
        (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
        OR $1 IS NULL) 
        AND ((cluster_member_loan_payment_schedules.payment_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL)) 
        ORDER BY cluster_member_loan_payment_schedules.repayment_order
`
};

  
