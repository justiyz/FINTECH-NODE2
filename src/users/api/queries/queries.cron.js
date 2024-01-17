export default {
  fetchAllOverdueLoanRepayments: `
    SELECT
        id,
        loan_repayment_id,
        loan_id,
        user_id,
        repayment_order,
        status,
        proposed_payment_date
    FROM personal_loan_payment_schedules
    WHERE proposed_payment_date::DATE <= NOW()::DATE
    AND status = 'not due'
    AND payment_at IS NULL`,

  fetchAllOverdueClusterLoanRepayments: `
    SELECT
        id,
        loan_repayment_id,
        loan_id,
        member_loan_id,
        cluster_id,
        user_id,
        repayment_order,
        status,
        proposed_payment_date
    FROM cluster_member_loan_payment_schedules
    WHERE proposed_payment_date::DATE <= NOW()::DATE
    AND status = 'not due'
    AND payment_at IS NULL`,

  fetchLoanNextRepayment: `
    SELECT
      id,
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    AND status = 'not due'
    AND payment_at IS NULL
    ORDER BY proposed_payment_date ASC
    LIMIT 1`,

  fetchClusterLoanNextRepayment: `
    SELECT
      id,
      loan_repayment_id,
      loan_id,
      member_loan_id,
      cluster_id,
      user_id,
      repayment_order,
      total_payment_amount,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      status
    FROM cluster_member_loan_payment_schedules
    WHERE member_loan_id = $1
    AND user_id = $2
    AND status = 'not due'
    AND payment_at IS NULL
    ORDER BY proposed_payment_date ASC
    LIMIT 1`,

  updateNextLoanRepaymentOverdue: `
    UPDATE personal_loan_payment_schedules
    SET
      updated_at = NOW(),
      status = 'over due'
    WHERE loan_repayment_id = $1`,

  updateNextClusterLoanRepaymentOverdue: `
    UPDATE cluster_member_loan_payment_schedules
    SET
      updated_at = NOW(),
      status = 'over due'
    WHERE loan_repayment_id = $1`,

  updateLoanWithOverDueStatus: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'over due'
    WHERE loan_id = $1
    AND user_id = $2`,

  updateClusterLoanWithOverDueStatus: `
    UPDATE cluster_member_loans
    SET
      updated_at = NOW(),
      status = 'over due'
    WHERE member_loan_id = $1
    AND user_id = $2`,

  updateUserLoanStatusOverDue: `
    UPDATE users
    SET
      updated_at = NOW(),
      loan_status = 'over due'
    WHERE user_id = $1`,

  updateClusterMemberClusterLoanStatusOverDue: `
    UPDATE cluster_members
    SET
      updated_at = NOW(),
      loan_status = 'over due'
    WHERE cluster_id = $1
    AND user_id = $2`,

  updateGeneralClusterLoanStatusOverDue: `
    UPDATE clusters
    SET
      updated_at = NOW(),
      loan_status = 'over due'
    WHERE cluster_id = $1`,

  fetchAllQualifiedClusterLoanRepayments: `
    SELECT
        id,
        loan_repayment_id,
        loan_id,
        user_id,
        cluster_id,
        member_loan_id,
        repayment_order,
        status,
        total_payment_amount,
        proposed_payment_date
    FROM cluster_member_loan_payment_schedules
    WHERE proposed_payment_date BETWEEN (NOW() - interval '$1 day')::DATE AND NOW()::DATE
    AND status != 'paid'
    AND payment_at IS NULL`,


  fetchAllQualifiedRepayments: `
    SELECT
        id,
        loan_repayment_id,
        loan_id,
        user_id,
        repayment_order,
        status,
        total_payment_amount,
        proposed_payment_date
    FROM personal_loan_payment_schedules
    WHERE proposed_payment_date BETWEEN (NOW() - interval '$1 day')::DATE AND NOW()::DATE
    AND status != 'paid'
    AND payment_at IS NULL`,

  fetchUserSavedDebitCardsToken: `
    SELECT
        id,
        user_id,
        is_default,
        last_4_digits,
        card_type,
        created_at,
        auth_token
    FROM user_debit_cards
    WHERE user_id = $1
    AND is_deleted = false
    ORDER BY is_default DESC
    LIMIT 1`,

  recordCronTrail: `
    INSERT INTO cron_job_trail(
      user_id,
      activity_type,
      details
    ) VALUES ($1, $2, $3)`,

  recordLoanDefaulting: `
    INSERT INTO loan_repayment_defaulters_trail(
      user_id,
      loan_id,
      loan_repayment_id,
      cluster_loan_id,
      type
    ) VALUES ($1, $2, $3, $4, $5)`,

  recordLoanAsNpl: `
    INSERT INTO non_performing_loan_trail(
      user_id,
      loan_id,
      loan_repayment_id,
      cluster_loan_id,
      type
    ) VALUES ($1, $2, $3, $4, $5)`,

  updatePromoStatusToActive: `
    UPDATE system_promos
    SET updated_at = NOW(),
        status = 'active'
    WHERE start_date::DATE = NOW()::DATE
    AND NOT is_deleted
    AND status = 'inactive'

    `,
  updatePromoStatusToEnded: `
    UPDATE system_promos
    SET updated_at = NOW(),
        status = 'ended'
    WHERE end_date::DATE = NOW()::DATE
    AND NOT is_deleted
    AND status = 'active'
    `,
  updateMerchantUserLoanStatusToOverdue: `
    UPDATE merchant_user_loans SET status = 'over due'
    WHERE user_id = $1 AND loan_id = $2
  `
};


