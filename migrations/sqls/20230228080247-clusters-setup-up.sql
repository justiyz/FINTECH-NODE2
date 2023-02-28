CREATE TYPE cluster_voting_type AS ENUM('yes', 'no');
CREATE TYPE cluster_type AS ENUM('private', 'public');

CREATE TABLE IF NOT EXISTS clusters(
    id SERIAL,
    cluster_id VARCHAR PRIMARY KEY DEFAULT 'cluster-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    type cluster_type,
    maximum_members INT NOT NULL,
    current_members INT NOT NULL,
    loan_goal_target NUMERIC(19,4) NOT NULL,
    minimum_monthly_income NUMERIC(19,4) NOT NULL,
    created_by VARCHAR NOT NULL REFERENCES users(user_id),
    admin VARCHAR NOT NULL REFERENCES users(user_id),
    image_url TEXT,
    unique_code VARCHAR NOT NULL,
    status account_status DEFAULT 'active',
    loan_status user_loan_status DEFAULT 'inactive',
    total_loan_obligation NUMERIC(19,4) DEFAULT 0,
    join_cluster_closes_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deletion_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX clusters_cluster_id_index ON clusters(cluster_id);
CREATE INDEX clusters_created_by_index ON clusters(created_by);
CREATE INDEX clusters_type_index ON clusters(type);
CREATE INDEX clusters_admin_index ON clusters(admin);
CREATE INDEX clusters_status_index ON clusters(status);
CREATE INDEX clusters_loan_status_index ON clusters(loan_status);
CREATE INDEX clusters_unique_code_index ON clusters(unique_code);

CREATE OR REPLACE FUNCTION make_cluster_name_lower_trim() RETURNS TRIGGER AS '
    BEGIN
        new.name := LOWER(TRIM(new.name));
        new.description := LOWER(TRIM(new.description));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER make_cluster_name_lower_trim BEFORE INSERT OR UPDATE ON clusters FOR
EACH ROW EXECUTE PROCEDURE make_cluster_name_lower_trim();

CREATE TABLE IF NOT EXISTS cluster_members(
    id SERIAL PRIMARY KEY,
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    status account_status DEFAULT 'active',
    loan_status user_loan_status DEFAULT 'inactive',
    loan_obligation NUMERIC(19,4) DEFAULT 0,
    is_admin BOOLEAN DEFAULT false,
    is_left BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_members_id_index ON cluster_members(id);
CREATE INDEX cluster_members_cluster_id_index ON cluster_members(cluster_id);
CREATE INDEX cluster_members_user_id_index ON cluster_members(user_id);

CREATE TABLE IF NOT EXISTS cluster_invitees(
    id SERIAL PRIMARY KEY,
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    inviter_id VARCHAR NOT NULL REFERENCES users(user_id),
    invitee VARCHAR NOT NULL,
    invitation_mode VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_invitees_id_index ON cluster_invitees(id);
CREATE INDEX cluster_invitees_cluster_id_index ON cluster_invitees(cluster_id);
CREATE INDEX cluster_invitees_invitation_mode_index ON cluster_invitees(invitation_mode);

CREATE OR REPLACE FUNCTION make_cluster_invitee_lower_trim() RETURNS TRIGGER AS '
    BEGIN
        new.invitee := LOWER(TRIM(new.invitee));
        new.invitation_mode := LOWER(TRIM(new.invitation_mode));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER make_cluster_invitee_lower_trim BEFORE INSERT OR UPDATE ON cluster_invitees FOR
EACH ROW EXECUTE PROCEDURE make_cluster_invitee_lower_trim();

CREATE TABLE IF NOT EXISTS cluster_decision_types(
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_decision_types_id_index ON cluster_decision_types(id);
CREATE INDEX cluster_decision_types_name_index ON cluster_decision_types(name);

CREATE OR REPLACE FUNCTION make_cluster_decision_type_name_lower_trim() RETURNS TRIGGER AS '
    BEGIN
        new.name := LOWER(TRIM(new.name));
        new.description := LOWER(TRIM(new.description));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER make_cluster_decision_type_name_lower_trim BEFORE INSERT OR UPDATE ON cluster_decision_types FOR
EACH ROW EXECUTE PROCEDURE make_cluster_decision_type_name_lower_trim();

INSERT INTO cluster_decision_types
    (name, description)
VALUES 
    ('join cluster', 'a decision type for when a user wants to join a cluster and cluster members are expected to accept or decline the join request'),
    ('delete cluster', 'a decision type for when the cluster admin wants to delete the cluster and cluster members are expected to accept or decline the cluster delete request'),
    ('loan application', 'a decision type for the cluster loan request is made and cluster members are expected to accept or decline the offers and terms of the loan facility being requested'),
    ('cluster admin', 'a decision type for when the cluster admin wants to leave and/or setpdown as the cluster admin and the suggested cluster admin is expected to accept or decline the cluster admin role request');

CREATE TABLE IF NOT EXISTS cluster_decision_tickets(
    id SERIAL,
    ticket_id VARCHAR PRIMARY KEY DEFAULT 'cluster-ticket-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    type VARCHAR NOT NULL REFERENCES cluster_decision_types(name),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_decision_tickets_ticket_id_index ON cluster_decision_tickets(ticket_id);
CREATE INDEX cluster_decision_tickets_cluster_id_index ON cluster_decision_tickets(cluster_id);
CREATE INDEX cluster_decision_tickets_type_index ON cluster_decision_tickets(type);

CREATE TABLE IF NOT EXISTS cluster_decision_votes(
    id SERIAL PRIMARY KEY,
    decision_ticket VARCHAR NOT NULL REFERENCES cluster_decision_tickets(ticket_id),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    is_cluster_admin BOOLEAN NOT NULL,
    vote cluster_voting_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_decision_votes_decision_ticket_index ON cluster_decision_votes(decision_ticket);
CREATE INDEX cluster_decision_votes_cluster_id_index ON cluster_decision_votes(cluster_id);
CREATE INDEX cluster_decision_votes_is_cluster_admin_index ON cluster_decision_votes(is_cluster_admin);
CREATE INDEX cluster_decision_votes_vote_index ON cluster_decision_votes(vote);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_address BOOLEAN DEFAULT false;

INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('join_cluster_grace_in_days', '14', 'number of days with which clusters will be opened for members to join' )
ON CONFLICT (name) DO
UPDATE SET
    name = EXCLUDED.name,
    value = EXCLUDED.value,
    description = EXCLUDED.description;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('CRTPBCLST', 'create public cluster', 'user creates a public cluster'),
    ('CRTPVCLST', 'create private cluster', 'user creates private cluster'),
    ('RQTJNCLST', 'request to join cluster', 'user requests to join cluster'),
    ('APRQJNCLST', 'accept request to join cluster', 'existing cluster user accepts request to join cluster'),
    ('DCRQJNCLST', 'decline request to join cluster', 'existing cluster user declines request to join cluster'),
    ('JNCLST', 'join cluster', 'user joins cluster'),
    ('RJTJNCLST', 'rejected to join cluster', 'user rejected from joining cluster'),
    ('IVCLMBYEM', 'invite cluster member by email', 'cluster admin invites cluster member by email'),
    ('IVCLMBYPN', 'invite cluster member by phone number', 'cluster admin invite cluster member by phone number'),
    ('INCLSTLNAP', 'initaite cluster loan application', 'cluster admin initiates cluster loan application'),
    ('APCLTLNAPT', 'accept cluster loan application terms', 'cluster member accepts cluster loan application terms'),
    ('DCCLTLNAPT', 'decline cluster loan application terms', 'cluster member declines cluster loan application terms'),
    ('INDELCLTRQ', 'initiate delete cluster', 'cluster admin initiate delete cluster'),
    ('APDELCLTRQ', 'accept delete cluster request', 'cluster member accepts delete cluster request'),
    ('DCDELCLTRQ', 'decline delete cluster request', 'cluster member declines delete cluster request'),
    ('CLSTDELTD', 'cluster deleted', 'cluster deleted upon agreement by cluster members'),
    ('LVCLST', 'leave cluster', 'cluster member leaves cluster'),
    ('SGNCLTADM', 'suggest new cluster admin', 'cluster admin suggests new cluster admin'),
    ('ACNCLTADM', 'accept new cluster admin role', 'suggested admin cluster member accepts new cluster admin role'),
    ('DCNCLTADM', 'decline new cluster admin role', 'suggested admin cluster member declines new cluster admin role'),
    ('BNWCLTADM', 'become new cluster admin', 'cluster member becomes new cluster admin'),
    ('EDTCLST', 'edit cluster', 'cluster admin edits cluster'),
    ('APLNAPOFLT', 'accept loan application offer letter', 'user accepts loan application offer letter'),
    ('AUTPLONRP', 'automatic partial loan repayment', 'users partial loan obligtion is repaid automatically'),
    ('MANPLONRP', 'manual partial loan repayment', 'users partial loan obligtion is repaid manually by user'),
    ('AUTFLONRP', 'automatic full loan repayment', 'users full loan obligation is repaid automatically'),
    ('MANFLONRP', 'manual full loan repayment', 'users full loan obligation is repaid manually by user'),
    ('RNGLONTRM', 'renegotiate loan terms', 'user renegotiates loan terms during application'),
    ('RSHDLONTN', 'reschedule loan tenor', 'user reschedules loan tenor'),
    ('RSHDLONRA', 'reschedule loan reapyment amount', 'user reschedules loan repayment amount');
