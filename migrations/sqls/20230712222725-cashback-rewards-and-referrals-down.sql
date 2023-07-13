ALTER TABLE users DROP COLUMN IF EXISTS unclaimed_referral_bonus_points;
ALTER TABLE users DROP COLUMN IF EXISTS claimed_referral_bonus_points;
ALTER TABLE users DROP COLUMN IF EXISTS cumulative_referral_bonus_points;

DROP INDEX IF EXISTS referral_rewards_tracking_reward_id_index;
DROP INDEX IF EXISTS referral_rewards_tracking_user_id_index;
DROP INDEX IF EXISTS referral_rewards_tracking_referral_code_index;

DROP INDEX IF EXISTS claimed_rewards_tracking_claim_id_index;
DROP INDEX IF EXISTS claimed_rewards_tracking_user_id_index;

DROP TABLE IF EXISTS referral_rewards_tracking CASCADE;
DROP TABLE IF EXISTS claimed_rewards_tracking CASCADE;
