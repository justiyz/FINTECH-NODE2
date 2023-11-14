export default {
  fetchUserDefaultBankAccount: `
    SELECT
      id,
      user_id,
      bank_name,
      bank_code,
      account_number,
      account_name,
      is_default,
      is_disbursement_account,
      created_at,
      mono_account_id
    FROM user_bank_accounts
    WHERE user_id = $1
    AND is_default = true
    LIMIT 1`,

  fetchUserDefaultDebitCard: `
    SELECT
      id,
      user_id,
      card_attached_bank,
      card_holder_name,
      is_default,
      created_at
    FROM user_debit_cards
    WHERE user_id = $1
    AND is_default = true
    LIMIT 1`,

  checkIfUserHasPreviouslyDefaultedInLoanRepayment: `
    SELECT
      COUNT(DISTINCT(loan_repayment_id))
    FROM non_performing_loan_trail
    WHERE user_id = $1`,

  initiatePersonalLoanApplication: `
    INSERT INTO personal_loans(
        user_id, amount_requested, initial_amount_requested, loan_reason, loan_tenor_in_months, initial_loan_tenor_in_months, reschedule_count, renegotiation_count
    ) VALUES ($1, $2, $3, $4, $5, $6, 0, 0)
    RETURNING *`,

  initiatePersonalLoanApplicationWithReturn: `
    INSERT INTO personal_loans(
        user_id, amount_requested, initial_amount_requested, loan_reason, loan_tenor_in_months, initial_loan_tenor_in_months, reschedule_count, renegotiation_count
    ) VALUES ($1, $2, $3, $4, $5, $6, 0, 0)
    RETURNING user_id, loan_id, amount_requested, initial_amount_requested, loan_reason, loan_tenor_in_months, initial_loan_tenor_in_months`,

  initiatePersonalLoanApplicationV2: `
    INSERT INTO personal_loans(
        user_id,
        amount_requested,
        initial_amount_requested,
        loan_reason,
        loan_tenor_in_months,
        initial_loan_tenor_in_months,
        reschedule_count,
        renegotiation_count,
        total_repayment_amount
    ) VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7)
    RETURNING *`,

  deleteInitiatedLoanApplication: `
    DELETE FROM personal_loans
    WHERE loan_id = $1
    AND user_id = $2`,

  fetchUserBvn: `
    SELECT bvn
    FROM users
    WHERE user_id = $1`,

  fetchAllBlackListedBvnsBlacklistedBvn: `
     SELECT
        id,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        bvn
      FROM blacklisted_bvns`,

  updateUserDeclinedDecisionLoanApplication: `
    UPDATE personal_loans
    SET
        updated_at = NOW(),
        percentage_orr_score = $2,
        status = $3,
        loan_decision = $4,
        rejection_reason = $5,
        used_previous_eligibility_details = $6
    WHERE loan_id = $1
    RETURNING id, loan_id, user_id, status`,

  updateUserManualOrApprovedDecisionLoanApplication: `
    UPDATE personal_loans
    SET
        updated_at = NOW(),
        total_repayment_amount = $2,
        total_interest_amount = $3,
        percentage_orr_score = $4,
        percentage_pricing_band = $5,
        percentage_processing_fee = $6,
        percentage_insurance_fee = $7,
        percentage_advisory_fee = $8,
        monthly_interest = $9,
        processing_fee = $10,
        insurance_fee = $11,
        advisory_fee = $12,
        monthly_repayment = $13,
        status = $14,
        loan_decision = $15,
        total_outstanding_amount = $16,
        max_possible_approval = $17,
        amount_requested = $18,
        used_previous_eligibility_details = $19
    WHERE loan_id = $1
    RETURNING *`,

  fetchUserLoanDetailsByLoanId: `
    SELECT
      id,
      loan_id,
      user_id,
      amount_requested,
      initial_amount_requested,
      loan_reason,
      loan_tenor_in_months,
      total_repayment_amount,
      total_interest_amount,
      percentage_orr_score,
      percentage_pricing_band,
      monthly_interest,
      processing_fee,
      insurance_fee,
      advisory_fee,
      monthly_repayment,
      total_outstanding_amount,
      extra_interests,
      status,
      loan_decision,
      is_loan_disbursed,
      loan_disbursed_at,
      offer_letter_url,
      max_possible_approval,
      is_rescheduled,
      is_renegotiated,
      reschedule_extension_days,
      reschedule_count,
      renegotiation_count,
      reschedule_loan_tenor_in_months,
      reschedule_at,
      completed_at
    FROM personal_loans
    WHERE loan_id = $1
    AND user_id = $2`,

  updateDisbursedLoanRepaymentSchedule: `
    INSERT INTO personal_loan_payment_schedules(
      loan_id, user_id, repayment_order, principal_payment, interest_payment, fees,
      total_payment_amount, pre_payment_outstanding_amount, post_payment_outstanding_amount,
      proposed_payment_date, pre_reschedule_proposed_payment_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,

  fetchLoanRepaymentSchedule: `
    SELECT
      id,
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      proposed_payment_date,
      pre_reschedule_proposed_payment_date,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      to_char(DATE(pre_reschedule_proposed_payment_date)::date, 'Mon DD, YYYY') AS pre_reschedule_repayment_date,
      to_char(DATE(payment_at)::date, 'Mon DD, YYYY') AS actual_payment_date,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    ORDER BY repayment_order ASC`,

  fetchLoanNextRepaymentDetails: `
    SELECT
      id,
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      proposed_payment_date,
      pre_reschedule_proposed_payment_date,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      to_char(DATE(pre_reschedule_proposed_payment_date)::date, 'Mon DD, YYYY') AS pre_reschedule_repayment_date,
      to_char(DATE(payment_at)::date, 'Mon DD, YYYY') AS actual_payment_date,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL
    ORDER BY proposed_payment_date ASC
    LIMIT 1`,

  fetchUserUnpaidRepayments: `
    SELECT
      id,
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      proposed_payment_date,
      pre_reschedule_proposed_payment_date,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL
    ORDER BY proposed_payment_date ASC`,

  updateNextLoanRepayment: `
    UPDATE personal_loan_payment_schedules
    SET
      updated_at = NOW(),
      payment_at = Now(),
      status = 'paid'
    WHERE loan_repayment_id = $1`,

  updateAllLoanRepaymentOnFullPayment: `
    UPDATE personal_loan_payment_schedules
    SET
      updated_at = NOW(),
      payment_at = Now(),
      status = 'paid'
    WHERE loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL`,

  existingUnpaidRepayments: `
    SELECT
      COUNT(id)
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL`,

  updateLoanWithRepayment: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = $3,
      total_outstanding_amount = total_outstanding_amount - $4::FLOAT,
      completed_at = $5
    WHERE loan_id = $1
    AND user_id = $2`,

  checkUserOnClusterLoan: `
    SELECT
      id,
      user_id,
      cluster_id,
      loan_status
    FROM cluster_members
    WHERE user_id = $1
    AND is_left = FALSE
    AND loan_status != 'inactive'
    LIMIT 1`,

  checkUserOnPersonalLoan: `
    SELECT
      id,
      user_id,
      loan_id,
      amount_requested,
      status
    FROM personal_loans
    WHERE user_id = $1
    AND (status = 'ongoing' OR status = 'over due')
    LIMIT 1`,

  updateProcessingLoanDetails: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'processing'
    WHERE loan_id = $1
    RETURNING id, user_id, loan_id, status, loan_decision`,

  updateActivatedLoanDetails: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'ongoing',
      is_loan_disbursed = true,
      loan_disbursed_at = NOW()
    WHERE loan_id = $1
    RETURNING id, user_id, loan_id, status, loan_decision`,

  fetchUserDisbursementAccount: `
    SELECT
      id,
      user_id,
      bank_name,
      bank_code,
      account_number,
      account_name,
      is_default,
      is_disbursement_account
    FROM user_bank_accounts
    WHERE user_id = $1
    AND (is_disbursement_account = TRUE OR is_default = TRUE)
    ORDER BY created_at DESC
    LIMIT 1`,

  initializeBankTransferPayment: `
    INSERT INTO paystack_payment_histories (
        user_id,
        amount,
        payment_platform,
        transaction_reference,
        payment_type,
        payment_status,
        refund_status,
        transaction_type,
        payment_reason,
        loan_id
    ) VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', 'debit', $6, $7)`,

  updateUserLoanStatus: `
    UPDATE users
    SET
      updated_at = NOW(),
      loan_status = $2
    WHERE user_id = $1`,

  cancelUserLoanApplication: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'cancelled'
    WHERE loan_id = $1
    AND user_id = $2
    RETURNING id, user_id, loan_id, status, loan_decision`,

  fetchUserActivePersonalLoans: `
    SELECT
      id,
      loan_id,
      user_id,
      amount_requested,
      loan_reason,
      loan_tenor_in_months,
      status,
      loan_decision
    FROM personal_loans
    WHERE user_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'in review' OR status = 'approved')
    LIMIT 1`,

  fetchAdminSetEnvDetails: `
    SELECT
      id,
      env_id,
      name,
      value
    FROM admin_env_values_settings
    WHERE name = $1`,

  fetchUserCurrentPersonalLoans: `
    SELECT
      id,
      loan_id,
      user_id,
      amount_requested,
      loan_reason,
      loan_tenor_in_months,
      status,
      loan_decision,
      to_char(DATE (loan_disbursed_at)::date, 'DDth Mon, YYYY') AS loan_start_date
    FROM personal_loans
    WHERE user_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'in review' OR status = 'approved')
    ORDER BY created_at DESC`,

  fetchUserCurrentClusterLoans: `
    SELECT
      id,
      loan_id,
      member_loan_id,
      user_id,
      cluster_id,
      cluster_name,
      amount_requested,
      loan_tenor_in_months,
      status,
      loan_decision,
      to_char(DATE (loan_disbursed_at)::date, 'DDth Mon, YYYY') AS loan_start_date
    FROM cluster_member_loans
    WHERE user_id = $1
    AND (status = 'pending' OR status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'in review' OR status = 'approved')
    ORDER BY created_at DESC`,

  updateLoanDisbursementTable: `
    INSERT INTO personal_loan_disbursements(
      user_id,
      loan_id,
      amount,
      payment_id,
      account_number,
      account_name,
      bank_name,
      bank_code,
      recipient_id,
      transfer_code,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,

  updatePersonalLoanPaymentTable: `
    INSERT INTO personal_loan_payments(
      user_id,
      loan_id,
      amount,
      transaction_type,
      loan_purpose,
      payment_description,
      payment_means
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,

  fetchUserPersonalLoanPayments: `
    SELECT
      id,
      payment_id,
      loan_id,
      user_id,
      amount,
      transaction_type,
      loan_purpose,
      status,
      payment_description,
      payment_means,
      to_char(DATE (created_at)::date, 'Mon DDth, YYYY') AS payment_date
    FROM personal_loan_payments
    WHERE user_id = $1
    ORDER BY created_at DESC`,

  fetchUserClusterLoanPayments: `
    SELECT
      id,
      payment_id,
      loan_id,
      member_loan_id,
      user_id,
      cluster_id,
      amount,
      transaction_type,
      loan_purpose,
      status,
      payment_description,
      payment_means,
      to_char(DATE (created_at)::date, 'Mon DDth, YYYY') AS payment_date
    FROM cluster_member_loan_payments
    WHERE user_id = $1
    ORDER BY created_at DESC`,

  fetchUserPersonalLoanPaymentDetails: `
    SELECT
      id,
      payment_id,
      loan_id,
      user_id,
      amount,
      transaction_type,
      loan_purpose,
      status,
      payment_description,
      to_char(DATE (created_at)::date, 'Mon DDth, YYYY') AS payment_date
    FROM personal_loan_payments
    WHERE payment_id = $1
    AND user_id = $2`,

  fetchUserClusterLoanPaymentDetails: `
    SELECT
      id,
      payment_id,
      cluster_id,
      member_loan_id,
      loan_id,
      user_id,
      amount,
      transaction_type,
      loan_purpose,
      status,
      payment_description,
      to_char(DATE (created_at)::date, 'Mon DDth, YYYY') AS payment_date
    FROM cluster_member_loan_payments
    WHERE payment_id = $1
    AND user_id = $2`,

  updateOfferLetter: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      offer_letter_url = $3
    WHERE loan_id = $1
    AND user_id = $2`,

  fetchUserPreviousPersonalLoanCounts: `
    SELECT
      COUNT(user_id)
    FROM personal_loans
    WHERE user_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'completed')`,

  fetchUserPreviousClusterLoanCounts: `
    SELECT
      COUNT(user_id)
    FROM cluster_member_loans
    WHERE user_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'completed')`,

  fetchIndividualLoanReschedulingDurations: `
    SELECT
      id,
      extension_in_days,
      created_at,
      updated_at
    FROM personal_loan_rescheduling_extension`,

  fetchIndividualLoanReschedulingDurationById: `
    SELECT
      id,
      extension_in_days,
      created_at,
      updated_at
    FROM personal_loan_rescheduling_extension
    WHERE id = $1`,

  createRescheduleRequest: `
    INSERT INTO personal_rescheduled_loan(
      loan_id, user_id, extension_in_days
    ) VALUES ($1, $2, $3)
    RETURNING *`,

  fetchLoanRescheduleRequest: `
    SELECT
      id,
      reschedule_id,
      loan_id,
      user_id,
      extension_in_days,
      is_accepted
    FROM personal_rescheduled_loan
    WHERE reschedule_id = $1
    AND loan_id = $2`,

  updateNewRepaymentDate: `
    UPDATE personal_loan_payment_schedules
    SET
      updated_at = NOW(),
      proposed_payment_date = $2,
      status = 'not due'
    WHERE id = $1`,

  updateLoanWithRescheduleDetails: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      is_rescheduled = TRUE,
      reschedule_extension_days = $2,
      reschedule_count = $3,
      reschedule_loan_tenor_in_months = $4,
      total_reschedule_extension_days = $5,
      reschedule_at = NOW()
    WHERE loan_id = $1`,

  updateRescheduleRequestAccepted: `
    UPDATE personal_rescheduled_loan
    SET
      updated_at = NOW(),
      is_accepted = TRUE
    WHERE reschedule_id = $1`,

  createRenegotiationDetails: `
    INSERT INTO personal_renegotiated_loan(
      loan_id, user_id, previous_loan_amount, renegotiating_loan_amount, previous_loan_tenor_in_months, renegotiating_loan_tenor_in_month,
      pricing_band, monthly_interest, monthly_repayment, processing_fee, advisory_fee, insurance_fee
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,

  updateLoanApplicationWithRenegotiation: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      is_renegotiated = TRUE,
      percentage_pricing_band = $2,
      monthly_interest = $3,
      monthly_repayment = $4,
      processing_fee = $5,
      insurance_fee = $6,
      advisory_fee = $7,
      percentage_processing_fee = $8,
      percentage_insurance_fee = $9,
      percentage_advisory_fee = $10,
      amount_requested = $11,
      loan_tenor_in_months = $12,
      total_repayment_amount = $13,
      total_interest_amount = $14,
      total_outstanding_amount = $15,
      renegotiation_count = $16
    WHERE loan_id = $1
    RETURNING *`,

  userAdminCreatedCluster: `
    SELECT
      clusters.id,
      clusters.cluster_id,
      clusters.name,
      clusters.type,
      clusters.status,
      clusters.loan_status,
      clusters.is_created_by_admin,
      clusters.company_name,
      clusters.interest_type,
      clusters.percentage_interest_type_value,
      cluster_members.user_id,
      cluster_members.is_admin,
      cluster_members.is_left
    FROM cluster_members
    LEFT JOIN clusters
    ON clusters.cluster_id = cluster_members.cluster_id
    WHERE cluster_members.user_id = $1
    AND cluster_members.is_left = false
    AND clusters.is_created_by_admin = true
    LIMIT 1`,

  userNonAdminCreatedCluster: `
    SELECT
      clusters.id,
      clusters.cluster_id,
      clusters.name,
      clusters.type,
      clusters.status,
      clusters.loan_status,
      clusters.is_created_by_admin,
      clusters.company_name,
      clusters.interest_type,
      clusters.percentage_interest_type_value,
      cluster_members.user_id,
      cluster_members.is_admin,
      cluster_members.is_left
    FROM cluster_members
    LEFT JOIN clusters
    ON clusters.cluster_id = cluster_members.cluster_id
    WHERE cluster_members.user_id = $1
    AND cluster_members.is_left = false
    AND clusters.type = $2
    AND clusters.is_created_by_admin = false
    LIMIT 1`,

  updateTicketLoanStatus: `
    UPDATE personal_loans
    SET
        is_loan_disbursed = true,
        loan_disbursed_at = NOW(),
        is_renegotiated = false,
        updated_at = NOW(),
        status = 'ongoing',
        loan_decision = 'MANUAL',
        is_rescheduled = false,
        reschedule_count = 0,
        used_previous_eligibility_details = false
    WHERE
        loan_id = $1
    AND
        user_id = $2
    RETURNING *
  `
};
