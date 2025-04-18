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
    AND is_deleted = false
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
    RETURNING *
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
  admin_sent_notifications.notification_id,
  admin_sent_notifications.sent_by,
  admin_sent_notifications.type,
  admin_sent_notifications.title,
  admin_sent_notifications.content,
  admin_sent_notifications.sent_to,
  admin_sent_notifications.end_at,
  admin_sent_notifications.is_ended,
   CONCAT(admins.first_name, ' ', admins.last_name) AS admin_name,
   to_char(admin_sent_notifications.created_at, 'DD Mon, YYYY HH:MI am') AS created_at
  FROM admin_sent_notifications
  LEFT JOIN admins ON admins.admin_id = admin_sent_notifications.sent_by
  WHERE (admin_sent_notifications.type = $1 OR $1 IS NULL)
  AND (admin_sent_notifications.title ILIKE TRIM($2) OR $2 IS NULL)
  AND ((admin_sent_notifications.created_at::DATE BETWEEN $3::DATE AND $4::DATE) 
    OR ($3 IS NULL AND $4 IS NULL))
  ORDER BY admin_sent_notifications.created_at DESC
  OFFSET $5
 LIMIT $6`,

  fetchNotificationCount: `
    SELECT 
      COUNT(notification_id) AS total_count
      FROM admin_sent_notifications
      LEFT JOIN admins ON admins.admin_id = admin_sent_notifications.sent_by
      WHERE (admin_sent_notifications.type = $1 OR $1 IS NULL)
      AND (admin_sent_notifications.title ILIKE TRIM($2) OR $2 IS NULL)
      AND ((admin_sent_notifications.created_at::DATE BETWEEN $3::DATE AND $4::DATE) 
        OR ($3 IS NULL AND $4 IS NULL))
  `,

  getNotificationById: `
    SELECT 
      notification_id,
      sent_by,
      type,
      title
    FROM admin_sent_notifications
    WHERE notification_id = $1;
  `,

  deleteNotification: `
    DELETE FROM admin_sent_notifications
    WHERE notification_id = $1
    `,

  fetchGeneralRewardPointDetails: `
    SELECT 
      id,
      reward_id,
      name,
      point
    FROM general_reward_points_settings
    `,

  fetchGeneralRewardRangePointDetails: `
    SELECT 
      id,
      range_id,
      reward_id,
      lower_bound,
      upper_bound,
      point
    FROM general_reward_points_range_settings
    WHERE reward_id = $1`,

  fetchClusterRewardPointDetails: `
    SELECT 
      id,
      reward_id,
      name,
      point
    FROM cluster_related_reward_points_settings`,

  updateClusterRelatedRewardPoints: `
    UPDATE cluster_related_reward_points_settings
    SET 
      updated_at = NOW(),
      point = $2
    WHERE reward_id = $1`,

  updateGeneralRewardPoints: `
    UPDATE general_reward_points_settings
    SET 
      updated_at = NOW(),
      point = $2
    WHERE reward_id = $1
    AND point IS NOT NULL`,

  fetchSingleGeneralRewardDetails: `
    SELECT
      id,
      reward_id,
      name,
      point
    FROM general_reward_points_settings 
    WHERE reward_id = $1`,

  updateGeneralRewardPointRanges: `
    UPDATE general_reward_points_range_settings
    SET 
      updated_at = NOW(),
      lower_bound = $2,
      upper_bound = $3,
      point = $4
    WHERE range_id = $1`,

  resetUserRewardPoints: `
      UPDATE users
      SET 
        updated_at = NOW(),
        claimed_reward_points = 0,
        unclaimed_reward_points = 0
      WHERE user_id = $1
  `,
  resetAllUsersRewardPoints: `
      UPDATE users
      SET 
        updated_at = NOW(),
        unclaimed_reward_points = 0,
        claimed_reward_points = 0
  `
};
