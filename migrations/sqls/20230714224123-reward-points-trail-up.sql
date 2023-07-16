DROP INDEX IF EXISTS referral_rewards_tracking_referral_code_index;

ALTER TABLE referral_rewards_tracking DROP COLUMN IF EXISTS referral_code;
ALTER TABLE referral_rewards_tracking DROP COLUMN IF EXISTS referred_user_id;

ALTER TABLE referral_rewards_tracking ADD COLUMN IF NOT EXISTS referral_code VARCHAR;
ALTER TABLE referral_rewards_tracking ADD COLUMN IF NOT EXISTS referred_user_id VARCHAR REFERENCES users(user_id);
ALTER TABLE referral_rewards_tracking ADD COLUMN IF NOT EXISTS type VARCHAR;

ALTER INDEX IF EXISTS referral_rewards_tracking_reward_id_index RENAME TO reward_points_tracking_reward_id_index;
ALTER INDEX IF EXISTS referral_rewards_tracking_user_id_index RENAME TO reward_points_tracking_user_id_index;
ALTER INDEX IF EXISTS referral_rewards_tracking_referral_code_index RENAME TO reward_points_tracking_referral_code_index;

ALTER TABLE IF EXISTS referral_rewards_tracking RENAME TO reward_points_tracking;

ALTER TABLE users RENAME COLUMN unclaimed_referral_bonus_points To unclaimed_reward_points;
ALTER TABLE users RENAME COLUMN claimed_referral_bonus_points To claimed_reward_points;
ALTER TABLE users RENAME COLUMN cumulative_referral_bonus_points To cumulative_reward_points;

ALTER TABLE clusters ADD COLUMN IF NOT EXISTS cluster_creator_received_membership_count_reward BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS loan_repayment_defaulters_trail(
    id SERIAL,
    defaulting_id VARCHAR PRIMARY KEY DEFAULT 'default-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR REFERENCES users(user_id),
    loan_id VARCHAR NOT NULL,
    loan_repayment_id VARCHAR NOT NULL,
    cluster_loan_id VARCHAR,
    type VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX loan_repayment_defaulters_trail_user_id_index ON loan_repayment_defaulters_trail(user_id);

CREATE TABLE IF NOT EXISTS non_performing_loan_trail(
    id SERIAL,
    npl_id VARCHAR PRIMARY KEY DEFAULT 'npl-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR REFERENCES users(user_id),
    loan_id VARCHAR NOT NULL,
    loan_repayment_id VARCHAR NOT NULL,
    cluster_loan_id VARCHAR,
    type VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX non_performing_loan_trail_user_id_index ON non_performing_loan_trail(user_id);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('RCVCLCTBN', 'received cluster creation bonus points', 'user receives cluster creation bonus points'),
    ('RCVCLMIBN', 'received cluster membership increment bonus points', 'user receives cluster membership increment bonus points');

UPDATE activity_types
SET 
    name = 'received onboarding welcome bonus points',
    description = 'user receives onboarding welcome bonus points'
WHERE code = 'RCVOBRFBN';
