CREATE TABLE IF NOT EXISTS general_reward_points_settings(
    id SERIAL,
    reward_id VARCHAR PRIMARY KEY DEFAULT 'general-reward-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    point INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX general_reward_points_settings_name_index ON general_reward_points_settings(name);
CREATE INDEX general_reward_points_settings_reward_id_index ON general_reward_points_settings(reward_id);

INSERT INTO general_reward_points_settings(
    name, description, point
) VALUES 
    ('sign_up_point', 'a user gets certain point after signing up and onboarding on SeedFi', 20),
    ('complete_loan_repayment_point', 'a user repays a loan facility completely, the user that referred this user gets the points', 50),
    ('successful_loan_request_point', 'a user applies for a loan facility successfully, the user that referred this user gets the points', null);

CREATE TABLE IF NOT EXISTS general_reward_points_range_settings(
    id SERIAL,
    range_id VARCHAR PRIMARY KEY DEFAULT 'point-range-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    reward_id VARCHAR NOT NULL REFERENCES general_reward_points_settings(reward_id),
    lower_bound NUMERIC(19,4) NOT NULL,
    upper_bound NUMERIC(19,4) NOT NULL,
    point INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX general_reward_points_range_settings_range_id_index ON general_reward_points_range_settings(range_id);
CREATE INDEX general_reward_points_range_settings_reward_id_index ON general_reward_points_range_settings(reward_id);

INSERT INTO general_reward_points_range_settings(
    reward_id, lower_bound, upper_bound, point
) VALUES 
    ((SELECT reward_id FROM general_reward_points_settings WHERE name = 'successful_loan_request_point'), 50000, 100000, 3),
    ((SELECT reward_id FROM general_reward_points_settings WHERE name = 'successful_loan_request_point'), 100001, 300000, 6),
    ((SELECT reward_id FROM general_reward_points_settings WHERE name = 'successful_loan_request_point'), 300001, 500000, 15),
    ((SELECT reward_id FROM general_reward_points_settings WHERE name = 'successful_loan_request_point'), 500001, 900000, 21),
    ((SELECT reward_id FROM general_reward_points_settings WHERE name = 'successful_loan_request_point'), 900001, 1000000000, 30);

CREATE TABLE IF NOT EXISTS cluster_related_reward_points_settings(
    id SERIAL,
    reward_id VARCHAR PRIMARY KEY DEFAULT 'cluster-reward-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    point INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_related_reward_points_settings_name_index ON cluster_related_reward_points_settings(name);
CREATE INDEX cluster_related_reward_points_settings_reward_id_index ON cluster_related_reward_points_settings(reward_id);

INSERT INTO cluster_related_reward_points_settings(
    name, description, point
) VALUES 
    ('cluster_creation', 'a user gets certain points after creating a cluster', 3),
    ('cluster_member_increase', 'a user gets certain points when created cluster membership grows to 5 for the first time', 5);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('EDTRWDPNTS', 'edit rewards points', 'admin edits rewards points');