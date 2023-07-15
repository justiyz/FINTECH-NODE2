ALTER TABLE IF EXISTS reward_points_tracking RENAME TO referral_rewards_tracking;

ALTER TABLE referral_rewards_tracking DROP COLUMN IF EXISTS referral_code;
ALTER TABLE referral_rewards_tracking DROP COLUMN IF EXISTS referred_user_id;
ALTER TABLE referral_rewards_tracking DROP COLUMN IF EXISTS type;

DROP INDEX IF EXISTS loan_repayment_defaulters_trail_user_id_index;

ALTER TABLE users RENAME COLUMN unclaimed_reward_points TO unclaimed_referral_bonus_points;
ALTER TABLE users RENAME COLUMN claimed_reward_points TO claimed_referral_bonus_points;
ALTER TABLE users RENAME COLUMN cumulative_reward_points TO cumulative_referral_bonus_points;


ALTER TABLE clusters DROP COLUMN IF EXISTS cluster_creator_received_membership_count_reward;


DROP TABLE IF EXISTS loan_repayment_defaulters_trail CASCADE;
