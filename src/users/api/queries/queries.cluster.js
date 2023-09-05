export default {
  checkIfClusterIsUnique: `
    SELECT 
        id,
        cluster_id,
        name,
        description, 
        type,
        unique_code,
        status,
        loan_status,
        is_deleted
    FROM clusters
    WHERE unique_code = $1`,

  checkIfClusterNameIsUnique: `
    SELECT 
        id,
        cluster_id,
        name,
        description, 
        type,
        unique_code,
        status,
        loan_status,
        is_deleted
    FROM clusters
    WHERE name = $1
    AND is_deleted = FALSE`,

  fetchClusterGraceOpenPeriod: `
    SELECT
        id,
        env_id,
        name,
        value
    FROM admin_env_values_settings
    WHERE name = $1`,

  createCluster: `
    INSERT INTO clusters(
        name,
        description,
        type,
        maximum_members,
        current_members,
        loan_goal_target,
        minimum_monthly_income,
        created_by,
        admin,
        unique_code
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,

  checkIfClusterExists: `
    SELECT 
        id,
        cluster_id,
        name,
        description, 
        type,
        maximum_members,
        current_members,
        loan_goal_target,
        minimum_monthly_income,
        admin,
        image_url,
        unique_code,
        status,
        loan_status,
        total_loan_obligation,
        is_created_by_admin,
        created_by,
        cluster_creator_received_membership_count_reward,
        is_deleted
    FROM clusters
    WHERE cluster_id = $1
    OR unique_code = $1`,

  fetchActiveClusterMembers: `
    SELECT 
      cluster_members.id,
      cluster_members.cluster_id,
      cluster_members.user_id,
      cluster_members.status,
      cluster_members.loan_status,
      cluster_members.loan_obligation,
      cluster_members.is_admin,
      users.email,
      users.user_id,
      users.phone_number,
      users.fcm_token,
      cluster_members.is_left
    FROM cluster_members
    LEFT JOIN users ON users.user_id = cluster_members.user_id
    WHERE cluster_id = $1
    AND is_left = FALSE`,

  fetchUserClusterType: `
    SELECT 
      cluster_members.id,
      cluster_members.user_id,
      cluster_members.status AS member_status,
      cluster_members.loan_status,
      cluster_members.loan_obligation,
      cluster_members.is_admin,
      cluster_members.is_left,
      clusters.cluster_id,
      clusters.type,
      clusters.is_created_by_admin,
      clusters.status AS cluster_status
    FROM cluster_members
    LEFT JOIN clusters 
    ON clusters.cluster_id = cluster_members.cluster_id
    WHERE cluster_members.user_id = $1
    AND cluster_members.is_left = FALSE
    AND clusters.type = $2
    AND clusters.is_created_by_admin = $3
    LIMIT 1`,

  fetchActiveClusterMemberDetails: `
    SELECT 
      id,
      cluster_id,
      user_id,
      status,
      loan_status,
      loan_obligation,
      is_admin,
      is_left
    FROM cluster_members
    WHERE cluster_id = $1
    AND user_id = $2
    AND is_left = FALSE`,

  fetchDeactivatedClusterMemberDetails: `
    SELECT 
      id,
      cluster_id,
      user_id,
      status,
      loan_status,
      loan_obligation,
      is_admin,
      is_left
    FROM cluster_members
    WHERE cluster_id = $1
    AND user_id = $2
    AND is_left = TRUE`,

  fetchClusterDecisionType: `
    SELECT 
      id,
      name,
      description
    FROM cluster_decision_types
    WHERE name = $1`,

  raiseClusterDecisionTicket: `
    INSERT INTO cluster_decision_tickets(
      cluster_id,
      type,
      message,
      ticket_raised_by,
      current_cluster_members
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING ticket_id`,

  fetchClusterDecisionTicketByTicketId: `
    SELECT 
      id,
      ticket_id,
      cluster_id,
      type,
      message,
      ticket_raised_by,
      current_cluster_members,
      is_concluded,
      suggested_cluster_admin
    FROM cluster_decision_tickets
    WHERE ticket_id = $1`,

  checkIfDecisionTicketPreviouslyRaisedAndStillOpened: `
    SELECT 
      id,
      ticket_id,
      cluster_id,
      type,
      message,
      ticket_raised_by,
      current_cluster_members,
      is_concluded
    FROM cluster_decision_tickets
    WHERE ticket_raised_by = $1
    AND cluster_id = $2
    AND type = $3
    AND is_concluded = FALSE`,

  updateRequestToJoinClusterTicketPreviouslyRaisedOnAcceptingClusterInvite: `
    UPDATE cluster_decision_tickets
    SET 
      updated_at = NOW(),
      is_concluded = TRUE
    WHERE ticket_raised_by = $1
    AND cluster_id = $2
    AND type = $3
    AND is_concluded = FALSE`,

  checkIfUserPreviouslyVoted: `
    SELECT 
      id,
      decision_ticket,
      cluster_id,
      is_cluster_admin,
      voter_id,
      vote
    FROM cluster_decision_votes
    WHERE decision_ticket = $1
    AND voter_id = $2`,

  incrementClusterMembersCount: `
    UPDATE clusters
    SET 
      updated_at = NOW(),
      current_members = current_members::int + 1
    WHERE cluster_id = $1`,

  decrementClusterMembersCount: `
    UPDATE clusters
    SET 
      updated_at = NOW(),
      current_members = current_members::int - 1
    WHERE cluster_id = $1`,

  fetchCurrentTicketVotes: `
    SELECT 
      COUNT(id)
    FROM cluster_decision_votes
    WHERE decision_ticket = $1`,

  fetchUserClusterInvitation: `
    SELECT
      id,
      cluster_id,
      inviter_id,
      invitee,
      invitation_mode,
      invitee_id,
      is_joined,
      is_declined,
      created_at
    FROM cluster_invitees
    WHERE invitee_id = $1
    AND cluster_id = $2
    AND is_joined = FALSE
    AND is_declined = FALSE
    ORDER BY created_at DESC
    LIMIT 1`,

  updateClusterCreatorReceivedMembershipRewardPoints: `
    UPDATE clusters
    SET 
      updated_at = NOW(),
      cluster_creator_received_membership_count_reward = true
    WHERE cluster_id = $1`,

  updateClusterInvitationStatus: `
    UPDATE cluster_invitees
    SET 
      updated_at = NOW(),
      is_joined = $3,
      is_declined = $4
    WHERE invitee_id = $1
    AND cluster_id = $2
    AND is_joined = FALSE
    AND is_declined = FALSE`,

  fetchCurrentTicketYesVotesByNonAdmins: `
    SELECT 
      COUNT(id)
    FROM cluster_decision_votes
    WHERE decision_ticket = $1
    AND vote = 'yes'
    AND is_cluster_admin = FALSE`,

  checkIfAdminHasVotedYes: `
    SELECT 
      id,
      decision_ticket,
      cluster_id,
      is_cluster_admin,
      voter_id,
      vote
    FROM cluster_decision_votes
    WHERE decision_ticket = $1
    AND is_cluster_admin = TRUE
    AND vote = 'yes'`,

  recordUserVoteDecision: `
    INSERT INTO cluster_decision_votes(
      decision_ticket,
      cluster_id,
      voter_id,
      is_cluster_admin,
      vote
    ) VALUES($1, $2, $3, $4, $5)`,

  updateDecisionTicketFulfillment: `
    UPDATE cluster_decision_tickets
    SET 
      updated_at = NOW(),
      is_concluded = TRUE
    WHERE ticket_id = $1`,

  reinstateClusterMember: `
    UPDATE cluster_members
    SET 
      updated_at = NOW(),
      status = 'active',
      loan_status = 'inactive',
      loan_obligation = 0,
      is_admin = FALSE,
      is_left = FALSE
    WHERE cluster_id = $1
    AND user_id = $2`,

  createClusterMember: `
    INSERT INTO cluster_members(
        cluster_id,
        user_id,
        is_admin
    ) VALUES ($1, $2, $3)
    RETURNING *`,

  fetchClusters: `
    SELECT
      id,
      cluster_id,
      name,
      type,
      loan_goal_target,
      maximum_members,
      current_members,
      description,
      image_url,
      minimum_monthly_income,
      created_at
    FROM clusters
    WHERE is_deleted = FALSE
    ORDER BY created_at DESC`,

  fetchUserClusters: `
    SELECT 
      clusters.id,
      clusters.cluster_id,
      clusters.name,
      clusters.type,
      clusters.loan_goal_target,
      clusters.maximum_members,
      clusters.current_members,
      clusters.description,
      clusters.image_url,
      clusters.minimum_monthly_income,
      clusters.created_at
    FROM clusters
    LEFT JOIN cluster_members
    ON clusters.cluster_id = cluster_members.cluster_id
    WHERE cluster_members.user_id = $1 
    AND clusters.is_deleted = FALSE
    AND cluster_members.is_left = FALSE
    ORDER BY clusters.loan_status DESC`,

  fetchActiveClusterUser: `
    SELECT
      cluster_id,
      user_id,
      is_left,
      is_admin
    FROM cluster_members
    WHERE user_id = $1 
    AND cluster_id = $2  
    AND is_left = FALSE`,

  fetchUserCreatedClusters: `
    SELECT 
      id,
      cluster_id,
      name,
      type,
      loan_goal_target,
      maximum_members,
      current_members,
      description,
      image_url,
      minimum_monthly_income,
      created_at
    FROM clusters
    WHERE created_by = $1 
    AND is_deleted = FALSE
    ORDER BY created_at DESC `,

  fetchClusterDetails: `
    SELECT 
      id,
      cluster_id,
      name,
      type,
      loan_goal_target,
      maximum_members,
      current_members,
      minimum_monthly_income,
      description,
      image_url,
      unique_code
    FROM clusters
    WHERE cluster_id = $1 
    AND is_deleted = FALSE`,
  selectClusterById: `
    SELECT 
        cluster_id,
        name,
        description, 
        type,
        unique_code,
        status,
        loan_status
    FROM clusters
    WHERE cluster_id = $1`,
  inviteClusterMember: `
    INSERT INTO cluster_invitees(
         cluster_id,
         inviter_id,
         invitee,
         invitation_mode,
         invitee_id
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING *
    `,

  checkIfClusterMemberAlreadyExist: `
    SELECT 
      *
    FROM cluster_members
    WHERE user_id = $1
    AND cluster_id = $2
    AND is_left = TRUE`,

  checkIfClusterMemberIsAdmin: `
      SELECT 
        cluster_id,
        user_id,
        loan_status,
        is_admin,
        status
      FROM cluster_members
      WHERE user_id = $1
      AND cluster_id = $2
      AND is_admin = TRUE`,
      
  fetchClusterMembers: `
    SELECT 
      cluster_members.user_id,
      INITCAP(TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name))) AS name,
      to_char(DATE(cluster_members.created_at)::date, 'MON DD YYYY') AS date_joined,
      cluster_members.is_admin,
      cluster_members.loan_status,
      clusters.status
	  FROM cluster_members
    LEFT JOIN users
	  ON cluster_members.user_id = users.user_id
	  LEFT JOIN clusters
	  ON cluster_members.cluster_id = clusters.cluster_id
	  WHERE cluster_members.cluster_id = $1
    AND clusters.is_deleted = false
	  AND cluster_members.is_left = false`,

  leaveCluster: `
      UPDATE 
         cluster_members
      SET 
      updated_at = NOW(),
      is_left = TRUE,
      status = 'inactive'
      WHERE user_id = $1 AND cluster_id = $2`,

  deleteAcluster: `
      UPDATE clusters
      SET 
        updated_at = NOW(),
        is_deleted = TRUE,
        status = 'inactive',
        current_members = '0'
      WHERE cluster_id = $1
  `,

  editCluster: `
      UPDATE clusters
      SET
        updated_at = NOW(),
        name = $2,
        description = $3,
        maximum_members = $4,
        loan_goal_target = $5,
        minimum_monthly_income = $6
      WHERE cluster_id = $1
      RETURNING name, description, maximum_members, loan_goal_target, minimum_monthly_income`,
      
  initiateDeleteCluster: `
      UPDATE clusters
      SET 
        updated_at = NOW(),
        deletion_reason = $2
      WHERE cluster_id = $1
  `,
  newAdmin: `
  UPDATE clusters
  SET 
    updated_at = NOW(),
    admin = $2
  WHERE cluster_id = $1
`,
  setAdmin: `
  UPDATE cluster_members
  SET 
    updated_at = NOW(),
    is_admin = TRUE
  WHERE cluster_id = $1 AND user_id = $2
`,
  removeAdmin: `
  UPDATE cluster_members
  SET 
  is_admin = FALSE,
    updated_at = NOW()
  WHERE cluster_id = $1 
  AND user_id = $2
`,
  removeClusterMembers: `
    UPDATE cluster_members
    SET 
      updated_at = NOW(),
      is_left = TRUE,
      status = 'inactive'
    WHERE cluster_id = $1`,

  suggestedAdmin: `
    INSERT INTO cluster_decision_tickets(
      cluster_id,
      type,
      message,
      ticket_raised_by,
      current_cluster_members,
      suggested_cluster_admin
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING ticket_id`,

  fetchUserActiveClusterLoans: `
    SELECT 
      id,
      member_loan_id,
      loan_id,
      user_id,
      cluster_id,
      cluster_name,
      amount_requested,
      loan_tenor_in_months,
      status,
      loan_decision
    FROM cluster_member_loans
    WHERE user_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'in review' OR status = 'approved')
    LIMIT 1`,

  initiateClusterLoanApplication: `
    INSERT INTO cluster_loans(
      cluster_id, cluster_name, initiator_id, total_amount_requested, loan_tenor_in_months, sharing_type, initial_total_amount_requested,
      initial_loan_tenor_in_months 
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,

  createClusterMemberLoanApplication: `
    INSERT INTO cluster_member_loans(
      loan_id, cluster_id, cluster_name, user_id, sharing_type, amount_requested, loan_tenor_in_months, initial_amount_requested, 
      initial_loan_tenor_in_months, total_cluster_amount, is_loan_initiator
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,

  deleteClusterMemberLoanApplication: `
    DELETE FROM cluster_member_loans
    WHERE member_loan_id = $1
    AND user_id = $2`,

  deleteGeneralClusterLoanApplication: `
    DELETE FROM cluster_loans
    WHERE loan_id = $1
    AND initiator_id = $2`,

  updateUserDeclinedDecisionClusterLoanApplication: `
    UPDATE cluster_member_loans
    SET 
        updated_at = NOW(),
        percentage_orr_score = $2,
        status = $3,
        loan_decision = $4,
        rejection_reason = $5,
        used_previous_eligibility_details = $6,
        amount_requested = $7,
        initial_amount_requested = $8
    WHERE member_loan_id = $1`,

  updateDeclinedDecisionGeneralClusterLoanApplication: `
    UPDATE cluster_loans
    SET 
        updated_at = NOW(),
        status = $2,
        rejection_reason = $3,
        initial_total_amount_requested = $4
    WHERE loan_id = $1
    RETURNING id, loan_id, initiator_id, status`,

  updateClusterLoanApplicationClusterInterest: `
    UPDATE cluster_loans
    SET 
        updated_at = NOW(),
        percentage_interest_rate = $2
    WHERE loan_id = $1`,

  updateUserManualOrApprovedDecisionClusterLoanApplication: `
    UPDATE cluster_member_loans
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
        used_previous_eligibility_details = $19,
        initial_amount_requested = $20
    WHERE member_loan_id = $1
    RETURNING *`,

  updateClusterLoanOfferLetter: `
    UPDATE cluster_member_loans
    SET 
      updated_at = NOW(),
      offer_letter_url = $3
    WHERE member_loan_id = $1
    AND user_id = $2`,

  fetchClusterActiveLoans: `
    SELECT 
      id,
      loan_id,
      cluster_id,
      cluster_name,
      initiator_id,
      total_amount_requested,
      loan_tenor_in_months,
      sharing_type,
      percentage_interest_rate,
      total_repayment_amount,
      total_interest_amount,
      total_monthly_repayment,
      (SELECT SUM(total_outstanding_amount) FROM cluster_member_loans WHERE cluster_id = cluster_loans.cluster_id 
      AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'pending')) AS cluster_total_outstanding_amount,
      status,
      is_loan_disbursed,
      loan_disbursed_at,
      can_disburse_loan,
      created_at
    FROM cluster_loans
    WHERE cluster_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'pending')`,

  fetchClusterLoanSummary: `
    SELECT 
      cluster_member_loans.id,
      cluster_member_loans.loan_id,
      cluster_member_loans.cluster_id,
      cluster_member_loans.cluster_name,
      cluster_member_loans.member_loan_id,
      cluster_member_loans.user_id,
      INITCAP(TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name))) AS member_name,
      cluster_member_loans.sharing_type,
      cluster_member_loans.amount_requested,
      cluster_member_loans.loan_tenor_in_months,
      cluster_member_loans.total_repayment_amount,
      cluster_member_loans.total_interest_amount,
      cluster_member_loans.monthly_repayment,
      cluster_member_loans.status,
      cluster_member_loans.total_outstanding_amount,
      cluster_member_loans.is_rescheduled
    FROM cluster_member_loans
    LEFT JOIN users
    ON cluster_member_loans.user_id = users.user_id
    WHERE cluster_member_loans.cluster_id = $1
    AND cluster_member_loans.loan_id = $2
    ORDER BY cluster_member_loans.total_outstanding_amount DESC`,

  fetchClusterLoanDetails: `
    SELECT 
      id,
      loan_id,
      cluster_id,
      cluster_name,
      initiator_id,
      total_amount_requested,
      loan_tenor_in_months,
      sharing_type,
      percentage_interest_rate,
      total_repayment_amount,
      total_monthly_repayment,
      status,
      is_loan_disbursed,
      loan_disbursed_at,
      can_disburse_loan,
      completed_at,
      initial_total_amount_requested,
      initial_loan_tenor_in_months,
      created_at
    FROM cluster_loans
    WHERE cluster_id = $1
    AND loan_id = $2`,

  fetchClusterLoanDetailsByLoanInitiator: `
    SELECT 
      id,
      loan_id,
      cluster_id,
      cluster_name,
      initiator_id,
      total_amount_requested,
      loan_tenor_in_months,
      sharing_type,
      percentage_interest_rate,
      total_repayment_amount,
      total_monthly_repayment,
      status,
      is_loan_disbursed,
      loan_disbursed_at,
      can_disburse_loan,
      completed_at,
      initial_total_amount_requested,
      initial_loan_tenor_in_months,
      created_at
    FROM cluster_loans
    WHERE loan_id = $1
    AND initiator_id = $2`,

  fetchClusterMemberLoanDetailsByLoanId: `
    SELECT 
      id,
      loan_id,
      member_loan_id,
      cluster_id,
      cluster_name,
      user_id,
      sharing_type,
      total_cluster_amount,
      amount_requested,
      initial_amount_requested,
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
      is_loan_initiator,
      is_loan_disbursed,
      loan_disbursed_at,
      offer_letter_url,
      max_possible_approval,
      is_rescheduled,
      is_renegotiated,
      accepted_loan_request,
      is_taken_loan_request_decision,
      reschedule_extension_days,
      reschedule_count,
      renegotiation_count,
      reschedule_loan_tenor_in_months,
      reschedule_at,
      completed_at
    FROM cluster_member_loans
    WHERE member_loan_id = $1
    AND user_id = $2`,

  createClusterLoanRenegotiationDetails: `
    INSERT INTO cluster_member_renegotiated_loan(
      member_loan_id, loan_id, cluster_id, user_id, previous_loan_amount, renegotiating_loan_amount, previous_loan_tenor_in_months, renegotiating_loan_tenor_in_month,
      pricing_band, monthly_interest, monthly_repayment, processing_fee, advisory_fee, insurance_fee
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,

  updateClusterLoanApplicationWithRenegotiation: `
    UPDATE cluster_member_loans
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
    WHERE member_loan_id = $1
    RETURNING *`,
  
  fetchSumOfAllocatedLoanAmount: `
    SELECT SUM(amount_requested) AS total_allocated_amount
    FROM cluster_member_loans
    WHERE loan_id = $1`,

  cancelGeneralLoanApplication: `
    UPDATE cluster_loans
    SET 
      updated_at = NOW(),
      status = 'cancelled'
    WHERE loan_id = $1
    AND initiator_id = $2`,

  cancelAllClusterMembersLoanApplication: `
    UPDATE cluster_member_loans
    SET 
      updated_at = NOW(),
      status = 'cancelled',
      is_taken_loan_request_decision = true
    WHERE loan_id = $1`,

  declineClusterMemberLoanApplicationDecision: `
    UPDATE cluster_member_loans
    SET 
      updated_at = NOW(),
      status = 'cancelled',
      is_taken_loan_request_decision = true
    WHERE member_loan_id = $1`,

  checkForOutstandingClusterLoanDecision: `
    SELECT * 
    FROM cluster_member_loans 
    WHERE loan_id = $1
    AND (is_taken_loan_request_decision = false OR status = 'in review')`,

  updateGeneralLoanApplicationCanDisburseLoan: `
    UPDATE cluster_loans
    SET 
      updated_at = NOW(),
      can_disburse_loan = true
    WHERE loan_id = $1`,

  acceptClusterMemberLoanApplication: `
    UPDATE cluster_member_loans
    SET 
      updated_at = NOW(),
      accepted_loan_request = true,
      is_taken_loan_request_decision = true
    WHERE member_loan_id = $1`,

  getUpdatedLoanAmountValues: `
    SELECT
      SUM(amount_requested) AS actual_total_loan_amount,
      SUM(total_repayment_amount) AS actual_total_loan_repayment_amount,
      SUM(total_interest_amount) AS actual_total_loan_interest_amount,
      SUM(monthly_repayment) AS actual_total_loan_monthly_repayment_amount
    FROM cluster_member_loans
    WHERE loan_id = $1
    AND status = 'approved'
    AND accepted_loan_request = TRUE`,

  getCountOfQualifiedClusterMembers: `
    SELECT
      COUNT(id)
    FROM cluster_member_loans
    WHERE loan_id = $1
    AND status = 'approved'
    AND accepted_loan_request = TRUE`,

  getCountOfRunningLoanClusterMembers: `
    SELECT
      COUNT(id)
    FROM cluster_member_loans
    WHERE loan_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'completed')
    AND accepted_loan_request = TRUE`,

  updateProcessingClusterLoanDetails: `
    UPDATE cluster_loans
    SET 
      updated_at = NOW(),
      total_amount_requested = $2,
      total_repayment_amount = $3,
      total_interest_amount = $4,
      total_monthly_repayment = $5,
      status = 'processing'
    WHERE loan_id = $1
    RETURNING *`,

  updateClusterMembersProcessingLoanDetails: `
    UPDATE cluster_member_loans
    SET 
      updated_at = NOW(),
      total_cluster_amount = $2,
      status = 'processing'
    WHERE loan_id = $1`,

  fetchQualifiedClusterMemberLoanDetails: `
    SELECT 
      id,
      loan_id,
      member_loan_id,
      cluster_id,
      cluster_name,
      user_id,
      sharing_type,
      total_cluster_amount,
      amount_requested,
      initial_amount_requested,
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
      is_loan_initiator,
      is_loan_disbursed,
      loan_disbursed_at,
      offer_letter_url,
      max_possible_approval,
      is_rescheduled,
      is_renegotiated,
      accepted_loan_request,
      is_taken_loan_request_decision,
      reschedule_extension_days,
      reschedule_count,
      renegotiation_count,
      reschedule_loan_tenor_in_months,
      reschedule_at,
      completed_at
    FROM cluster_member_loans
    WHERE loan_id = $1
    AND status = 'processing'
    AND accepted_loan_request = TRUE`,

  totalClusterOutstandingLoanAmount: `
    SELECT 
      SUM(total_outstanding_amount) AS cluster_total_outstanding_amount
    FROM cluster_member_loans
    WHERE loan_id = $1
    AND status = 'processing'
    AND accepted_loan_request = TRUE`, 

  updateClusterLoanDisbursementTable: `
    INSERT INTO cluster_member_loan_disbursements(
      user_id,
      cluster_id,
      member_loan_id,
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
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,

  updateClusterLoanPaymentTable: `
    INSERT INTO cluster_member_loan_payments(
      user_id,
      cluster_id,
      member_loan_id,
      loan_id,
      amount,
      transaction_type,
      loan_purpose,
      payment_description,
      payment_means
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,

  updateDisbursedClusterLoanRepaymentSchedule: `
    INSERT INTO cluster_member_loan_payment_schedules(
      cluster_id, member_loan_id, loan_id, user_id, repayment_order, principal_payment, interest_payment, fees, 
      total_payment_amount, pre_payment_outstanding_amount, post_payment_outstanding_amount, 
      proposed_payment_date, pre_reschedule_proposed_payment_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,

  updateActivatedClusterLoanDetails: `
    UPDATE cluster_member_loans
    SET
      updated_at = NOW(),
      status = 'ongoing',
      is_loan_disbursed = true,
      loan_disbursed_at = NOW()
    WHERE loan_id = $1
    AND status = 'processing'
    AND accepted_loan_request = TRUE`,

  updateActivatedGeneralLoanDetails: `
    UPDATE cluster_loans
    SET
      updated_at = NOW(),
      status = 'ongoing',
      is_loan_disbursed = true,
      loan_disbursed_at = NOW()
    WHERE loan_id = $1`,

  updateGeneralClusterLoanDetails: `
    UPDATE clusters
    SET
      updated_at = NOW(),
      loan_status = 'active',
      total_loan_obligation = $2,
      loan_amount = $3
    WHERE cluster_id = $1`,

  fetchClusterLoanRepaymentSchedule: `
    SELECT 
      id,
      loan_repayment_id,
      cluster_id,
      member_loan_id,
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
    FROM cluster_member_loan_payment_schedules
    WHERE member_loan_id = $1
    AND user_id = $2
    ORDER BY repayment_order ASC`,

  fetchClusterLoanNextRepaymentDetails: `
    SELECT 
      id,
      loan_repayment_id,
      cluster_id,
      member_loan_id,
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
    FROM cluster_member_loan_payment_schedules
    WHERE member_loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL
    ORDER BY proposed_payment_date ASC
    LIMIT 1`,

  updateClusterLoanStatus: `
    UPDATE cluster_members
    SET 
      updated_at = NOW(),
      loan_status = $3,
      loan_obligation = $4
    WHERE user_id = $1
    AND cluster_id = $2`,

  existingUnpaidClusterLoanRepayments: `
    SELECT 
      COUNT(id)
    FROM cluster_member_loan_payment_schedules
    WHERE member_loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL`,

  fetchOtherLoanOverDueRepayments: `
    SELECT 
      id,
      loan_repayment_id,
      cluster_id,
      user_id,
      member_loan_id,
      loan_id,
      status
    FROM cluster_member_loan_payment_schedules
    WHERE loan_id = $1
    AND status = 'over due'
    AND loan_repayment_id != $2`,

  fetchOtherMembersLoanOverDueRepayments: `
    SELECT 
      id,
      loan_repayment_id,
      cluster_id,
      user_id,
      member_loan_id,
      loan_id,
      status
    FROM cluster_member_loan_payment_schedules
    WHERE loan_id = $1
    AND status = 'over due'
    AND member_loan_id != $2`,

  updateNextClusterLoanRepayment: `
    UPDATE cluster_member_loan_payment_schedules
    SET
      updated_at = NOW(),
      payment_at = Now(),
      status = 'paid'
    WHERE loan_repayment_id = $1`,

  updateClusterLoanWithRepayment: `
    UPDATE cluster_member_loans
    SET
      updated_at = NOW(),
      status = $3,
      total_outstanding_amount = total_outstanding_amount - $4::FLOAT,
      completed_at = $5
    WHERE member_loan_id = $1
    AND user_id = $2`,

  updateClusterMemberWithRepayment: `
    UPDATE cluster_members
    SET
      updated_at = NOW(),
      loan_status = $3,
      loan_obligation = loan_obligation - $4::FLOAT
    WHERE cluster_id = $1
    AND user_id = $2`,

  updateGeneralClusterWithRepayment: `
    UPDATE clusters
    SET
      updated_at = NOW(),
      total_loan_obligation = total_loan_obligation - $2::FLOAT,
      loan_status = $3
    WHERE cluster_id = $1`,

  updateAllClusterLoanRepaymentOnFullPayment: `
    UPDATE cluster_member_loan_payment_schedules
    SET
      updated_at = NOW(),
      payment_at = Now(),
      status = 'paid'
    WHERE member_loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL`,

  fetchClusterMembersCompletedLoanByClusterIs: `
    SELECT 
      id,
      cluster_id,
      loan_id,
      user_id,
      member_loan_id,
      completed_at,
      status
    FROM cluster_member_loans
    WHERE loan_id = $1
    AND status = 'completed'`,

  updateGeneralLoanCompletedAt: `
    UPDATE cluster_loans
    SET 
      updated_at = NOW(),
      status = 'completed',
      completed_at = Now()
    WHERE loan_id = $1
    `,

  updateGeneralClustersStatus: `
    UPDATE clusters
    SET 
      updated_at = NOW(),
      loan_status = 'inactive',
      loan_amount = 0
    WHERE cluster_id = $1`,

  createClusterLoanRescheduleRequest: `
    INSERT INTO cluster_member_rescheduled_loan(
      cluster_id, member_loan_id, loan_id, user_id, extension_in_days
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,

  fetchClusterLoanRescheduleRequest: `
    SELECT 
      id,
      reschedule_id,
      cluster_id, 
      member_loan_id,
      loan_id, 
      user_id, 
      extension_in_days,
      is_accepted
    FROM cluster_member_rescheduled_loan
    WHERE reschedule_id = $1
    AND member_loan_id = $2`,

  fetchUserUnpaidClusterLoanRepayments: `
    SELECT 
      id,
      loan_repayment_id,
      cluster_id,
      member_loan_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      proposed_payment_date,
      pre_reschedule_proposed_payment_date,
      status
    FROM cluster_member_loan_payment_schedules
    WHERE member_loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL
    ORDER BY proposed_payment_date ASC`,

  updateNewClusterLoanRepaymentDate: `
    UPDATE cluster_member_loan_payment_schedules
    SET
      updated_at = NOW(),
      proposed_payment_date = $2,
      status = 'not due'
    WHERE id = $1`,

  updateClusterLoanWithRescheduleDetails: `
    UPDATE cluster_member_loans
    SET
      updated_at = NOW(),
      is_rescheduled = TRUE,
      reschedule_extension_days = $2,
      reschedule_count = $3,
      reschedule_loan_tenor_in_months = $4,
      total_reschedule_extension_days = $5,
      reschedule_at = NOW()
    WHERE member_loan_id = $1`,

  updateRescheduleClusterLoanRequestAccepted: `
    UPDATE cluster_member_rescheduled_loan
    SET
      updated_at = NOW(),
      is_accepted = TRUE
    WHERE reschedule_id = $1`
};


