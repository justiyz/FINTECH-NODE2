export default {
  blacklistedBvn: `
    INSERT INTO blacklisted_bvns(
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      bvn
    ) VALUES($1, $2, $3, $4, $5)
    RETURNING  first_name,
    middle_name,
    last_name,
    date_of_birth,
    bvn`,
  
  fetchBlacklistedBvn: `
     SELECT 
        id,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        bvn
      FROM blacklisted_bvns
      WHERE (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
      OR $1 IS NULL)
    `,
  
  fetchFilterBlacklistedBvn: `
      SELECT 
      id,
       first_name,
       middle_name,
       last_name,
       date_of_birth,
       bvn,
       created_at
       FROM blacklisted_bvns
       WHERE (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
              OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
              OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
              OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
              OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
              OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
              OR $1 IS NULL) 
             AND ((created_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL)) 
             ORDER BY created_at DESC
             OFFSET $4
             LIMIT $5
   `,
   
  countFilterBlacklistedBvn: `
  SELECT COUNT(id) AS total_count
  FROM blacklisted_bvns
  WHERE 
  (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
    OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
    OR $1 IS NULL) 
   AND ((created_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL)) 
   `,
  fetchBlacklistedBvns: `
    SELECT 
     id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      bvn,
      created_at
    FROM blacklisted_bvns`,

  updateUnblackListedBvn: ` 
  INSERT INTO unblacklisted_bvns(
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    bvn
  ) VALUES($1, $2, $3, $4, $5)
  `,
  removeBlacklistedBvn: `
  DELETE FROM blacklisted_bvns
  WHERE id = $1
  `,

  getBlacklistedUsers: `
    SELECT 
      user_id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      bvn
    FROM users
    WHERE status = 'blacklisted' AND bvn IS NOT NULL;`,

  fetchBlacklistedBvnById: `
    SELECT 
    id,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    bvn
    FROM blacklisted_bvns
    WHERE id = $1
    `,
  unblacklistExistingUserBvn: `
    UPDATE users
    SET 
      updated_at = NOW(),
      status = $2
    WHERE user_id = $1
`
};
      
  
