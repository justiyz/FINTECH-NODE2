export default {

fetchMerchantAdminByEmail:
`SELECT * FROM merchant_admins WHERE email = $1`,

updateMerchantAdminPassword: `
  UPDATE merchant_admins
  SET
      password = $2,
      updated_at = NOW(),
      status = 'active',
      is_created_password = true
  WHERE email = $1
  RETURNING first_name, last_name, email, status, is_created_password
  `,

fetchAdminPassword: `
    SELECT id, merchant_admin_id, password
    FROM merchant_admins
    WHERE merchant_admin_id = $1`,


fetchAdminByVerificationToken: `
    SELECT id, email, merchant_admin_id, verification_token, verification_token_expires, is_created_password, verification_token_request_count
    FROM merchant_admins
    WHERE verification_token = $1`,


updateLoginToken: `
    UPDATE merchant_admins
    SET
      updated_at = NOW(),
      is_verified_email = TRUE,
      verification_token = $2,
      verification_token_expires = $3,
      verification_token_request_count = $4,
      invalid_verification_token_count = $5
    WHERE merchant_admin_id = $1
    RETURNING id, merchant_admin_id, first_name, last_name,  email, is_created_password, is_verified_email, status`,


fetchAdminByVerificationTokenAndUniqueId: `
    SELECT id, email, merchant_admin_id, verification_token, verification_token_expires, is_created_password, verification_token_request_count, invalid_verification_token_count
    FROM merchant_admins
    WHERE verification_token = $1
    AND merchant_admin_id = $2`,


fetchMerchantsByMerchantAdminId: `
    SELECT
        merchants.merchant_id,
        merchants.business_name,
        merchants.status,
        mam.created_at
    FROM merchant_admins_merchants AS mam
    LEFT JOIN merchants ON mam.merchant_id = merchants.merchant_id
    WHERE
      mam.merchant_admin_id = $1
      AND ($2 IS NULL OR merchants.status = $2)
    ORDER BY mam.created_at DESC
`,


// ================================================






  fetchMerchantByVerificationToken: `
      SELECT id, email, merchant_id, verification_token, verification_token_expires, is_created_password, verification_token_request_count, otp
      FROM merchants
      WHERE verification_token = $1`,

  // fetchMerchantByVerificationOTP: `
  //     SELECT id, email, merchant_id, verification_token, verification_token_expires, is_created_password, verification_token_request_count, otp
  //     FROM merchants
  //     WHERE verification_token = $1 AND merchant_id = $2`,





  updateMerchantLoginToken: `
      UPDATE merchant_admins
      SET
        updated_at = NOW(),
        is_verified_email = true,
        verification_token = $2,
        verification_token_expires = $3,
        verification_token_request_count = $4,
        invalid_verification_token_count = $5
      WHERE merchant_admin_id = $1
      RETURNING *`,
  fetchRolePermissions: `
      SELECT
        admin_roles.code,
        admin_resources.name,
        admin_role_permissions.resource_id,
        string_to_array(admin_role_permissions.permissions, ',') AS permissions
      FROM admin_role_permissions
      LEFT JOIN admin_resources
      ON admin_role_permissions.resource_id = admin_resources.resource_id
      LEFT JOIN admin_roles
      ON admin_role_permissions.role_type = admin_roles.code
      WHERE admin_role_permissions.role_type = $1
      AND admin_roles.status = 'active'`,

  fetchAdminPermissions: `
      SELECT
        admin_user_permissions.admin_id,
        admin_resources.name,
        admin_user_permissions.resource_id,
        string_to_array(admin_user_permissions.permissions, ',') AS permissions
      FROM admin_user_permissions
      LEFT JOIN admin_resources
      ON admin_user_permissions.resource_id = admin_resources.resource_id
      WHERE admin_user_permissions.admin_id = $1`,

  adminForgotPassword: `
    UPDATE admins
    SET
      verification_token = $2,
      verification_token_expires = $3,
      verification_token_request_count = $4,
      updated_at = NOW()
    WHERE email = $1
    RETURNING admin_id, first_name, last_name, status`,

  setNewAdminPassword: `
    UPDATE admins
    SET
      updated_at = NOW(),
      status = 'active',
      is_created_password = TRUE,
      password = $2,
      verification_token = NULL,
      verification_token_expires = NULL,
      verification_token_request_count = verification_token_request_count - verification_token_request_count,
      invalid_verification_token_count = invalid_verification_token_count - invalid_verification_token_count
    WHERE admin_id = $1
    RETURNING admin_id, status, is_created_password, is_verified_email, is_completed_profile`
};

