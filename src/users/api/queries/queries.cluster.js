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
    WHERE name = $1
    OR unique_code = $1`,

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
        unique_code,
        join_cluster_closes_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        join_cluster_closes_at,
        is_deleted
    FROM clusters
    WHERE cluster_id = $1
    OR unique_code = $1`,

  fetchActiveClusterMembers: `
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
    AND is_left = FALSE`,

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
    ORDER BY join_cluster_closes_at DESC`,

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

  fetchActiveClusterUser:`
    SELECT
      cluster_id,
      user_id,
      is_left,
      is_admin
    FROM cluster_members
    WHERE user_id = $1 
    AND cluster_id = $2  
    AND is_left = FALSE`,

  fetchUserCreatedClusters:`
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

  fetchClusterDetails:`
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
        loan_status,
        is_admin,
        status
      FROM cluster_members
      WHERE user_id = $1
      AND cluster_id = $2`,
      
  fetchClusterMembers:`
    SELECT 
      cluster_members.user_id,
      CONCAT(users.first_name, ' ', users.last_name) AS name,
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

  leaveCluster:`
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
        is_deleted = true,
        status = 'inactive'
      WHERE cluster_id = $1
  `,

  editCluster:`
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
    updated_at = NOW(),
    is_admin = FALSE
  WHERE cluster_id = $1 AND user_id = $2
`,
  removeClusterMembers:`
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
  RETURNING ticket_id
  `
};


