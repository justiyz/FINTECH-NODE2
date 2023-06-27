export default {
  fetchEnvValues: `
        SELECT 
            id,
            env_id,
            name,
            value,
            description,
            created_at
        FROM admin_env_values_settings
        ORDER BY id`,

  updateEnvValues: `
        UPDATE admin_env_values_settings
        SET updated_at = NOW(),
            value = $2
        WHERE env_id = $1  
    `,

  createPromo: `
        INSERT INTO system_promos(
            name,
            description,
            start_date,
            end_date,
            image_url,
            status,
            percentage_discount,
            customer_segment,
            tier_category,
            created_by
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING*
    `,

  fetchPromoByName: `
     SELECT
        id,
        promo_id,
        name,
        description,
        start_date,
        end_date,
        image_url,
        status,
        percentage_discount,
        customer_segment,
        tier_category,
        created_by
     FROM system_promos
     WHERE name = $1
  `,

  fetchAllPromos: `
    SELECT
        id,
        promo_id,
        name,
        description,
        start_date,
        end_date,
        image_url,
        status,
        created_by
    FROM system_promos
    WHERE is_deleted = 'false'
  `,

  fetchSinglePromoDetails: `
    SELECT
        id,
        promo_id,
        name,
        description,
        start_date,
        end_date,
        image_url,
        status,
        created_by,
        percentage_discount,
        customer_segment,
        tier_category                
    FROM system_promos  
    WHERE promo_id = $1  
  `,

  updatePromoDetails: `
      UPDATE system_promos
      SET 
        updated_at = NOW(),
        name = $2,
        description = $3,
        start_date = $4,
        end_date = $5,
        image_url = $6,
        percentage_discount = $7,
        customer_segment = $8,
        tier_category = $9,
        is_edited = 'true'
      WHERE promo_id = $1 AND is_deleted = 'false'
      RETURNING*
  `,
  
  cancelPromo: `
     UPDATE system_promos
     SET 
        updated_at = NOW(),
        status = 'cancelled',
        actual_end_date = $2
    WHERE promo_id = $1 AND is_deleted = 'false'
    RETURNING*
  `,
  
  deletePromo: `
    UPDATE system_promos
    SET 
    updated_at = NOW(),
    is_deleted = 'true'
    WHERE promo_id = $1
  `   
};
