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
        created_by,
        customer_segment,
        tier_category,
        percentage_discount,
        image_url
    FROM system_promos
    WHERE is_deleted = false
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
        is_edited = true
      WHERE promo_id = $1 AND is_deleted = false
      RETURNING*
  `,
  updatePromoStatus: `
  UPDATE system_promos
  SET 
    updated_at = NOW(),
    status = 'active'
    WHERE promo_id = $1 AND is_deleted = false
    RETURNING id, promo_id
  `,

  cancelPromo: `
   UPDATE system_promos
     SET 
        updated_at = NOW(),
        status = 'cancelled',
        actual_end_date = NOW()
    WHERE promo_id = $1 AND is_deleted = false AND status IN ('active', 'inactive', 'cancelled')
    RETURNING*
  `,
  deletePromo: `
    UPDATE system_promos
    SET 
    updated_at = NOW(),
    is_deleted = true
    WHERE promo_id = $1
  `,
  sendNotification: `
  INSERT INTO admin_sent_notifications(
    sent_by,
    type,
    title, 
    content, 
    sent_to, 
    end_at,
    is_ended
    ) VALUES ($1, $2, $3, $4, $5, $6, false)
    RETURNING*
   `,

      
  fetchNotifications: `
     SELECT 
      notification_id,
      sent_by,
      type,
      title,
      content,
      sent_to,
      end_at,
      is_ended,
      to_char(created_at, 'DD Mon, YYYY HH:MI am') AS created_at
      FROM admin_sent_notifications
      WHERE is_ended = $1 
      AND title ILIKE TRIM($2) OR $2 IS NULL
      AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) 
      OR ($3 IS NULL AND $4 IS NULL))
      ORDER BY created_at DESC
      OFFSET $5
      LIMIT $6;
  `,
  fetchNotificationCount: `
    SELECT 
      COUNT(notification_id) AS total_count
    FROM admin_sent_notifications
    WHERE is_ended = $1 
    AND title ILIKE TRIM($2) OR $2 IS NULL
    AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) 
    OR ($3 IS NULL AND $4 IS NULL));
  `
};
