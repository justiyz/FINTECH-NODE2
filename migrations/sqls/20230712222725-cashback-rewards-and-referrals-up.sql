ALTER TABLE users ADD COLUMN IF NOT EXISTS unclaimed_referral_bonus_points NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS claimed_referral_bonus_points NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cumulative_referral_bonus_points NUMERIC DEFAULT 0;

CREATE TABLE IF NOT EXISTS referral_rewards_tracking(
    id SERIAL,
    reward_id VARCHAR PRIMARY KEY DEFAULT 'reward-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    referral_code VARCHAR NOT NULL,
    point_reward NUMERIC,
    reward_description VARCHAR NOT NULL,
    referred_user_id VARCHAR NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX referral_rewards_tracking_reward_id_index ON referral_rewards_tracking(reward_id);
CREATE INDEX referral_rewards_tracking_user_id_index ON referral_rewards_tracking(user_id);
CREATE INDEX referral_rewards_tracking_referral_code_index ON referral_rewards_tracking(referral_code);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('DELSTNTFS', 'deletes sent notifications', 'admin deletes sent notifications'),
    ('RCVOBRFBN', 'received onboarding referral bonus', 'user receives onboarding referral bonus'),
    ('RCVLDRFBN', 'received loan disbursement referral bonus', 'user receives loan disbursement referral bonus'),
    ('RCVLRRFBN', 'received loan repayment referral bonus', 'user receives loan repayment referral bonus'),
    ('CLRWDPTS', 'claim referral reward points', 'user claim referral reward points');

CREATE TABLE IF NOT EXISTS claimed_rewards_tracking(
    id SERIAL,
    claim_id VARCHAR PRIMARY KEY DEFAULT 'claim-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    point NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX claimed_rewards_tracking_claim_id_index ON claimed_rewards_tracking(claim_id);
CREATE INDEX claimed_rewards_tracking_user_id_index ON claimed_rewards_tracking(user_id);
