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
  
  fetchSingleBlacklistedBvn: `
     SELECT 
       id,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        bvn
      FROM blacklisted_bvns
      WHERE bvn = $1
    `,
  
  fetchBlacklistedBvn: `
     SELECT 
        id,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        bvn
      FROM blacklisted_bvns
    `,
  
  fetchUserBlacklistedBvn: `
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
     AND (bvn = $2 OR $2 IS NULL)
     AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL)) 
     GROUP BY 
     id,
     first_name,
     middle_name,
     last_name,
     date_of_birth,
     bvn,
     created_at
     ORDER BY created_at DESC
     OFFSET $5
     LIMIT $6
   `,
   
  countBlacklistedBvn: `
      SELECT COUNT(id) AS total_count
      FROM blacklisted_bvns
      WHERE (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
      OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
      OR $1 IS NULL) 
      AND (bvn = $2 OR $2 IS NULL)
      AND ((created_at::DATE BETWEEN $3 AND $4) OR ($3 IS NULL AND $4 IS NULL)) 
     GROUP BY   
     id,
     first_name,
     middle_name,
     last_name,
     date_of_birth,
     bvn,
     created_at
      ORDER BY created_at DESC
     OFFSET $5
     LIMIT $6
   `
};
      
  
