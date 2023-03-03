ALTER TABLE cluster_decision_votes ADD COLUMN IF NOT EXISTS voter_id VARCHAR REFERENCES users(user_id);

CREATE INDEX cluster_decision_votes_voter_id_index ON cluster_decision_votes(voter_id);

ALTER TABLE cluster_decision_tickets ADD COLUMN IF NOT EXISTS ticket_raised_by VARCHAR REFERENCES users(user_id);

CREATE INDEX cluster_decision_tickets_ticket_raised_by_index ON cluster_decision_tickets(ticket_raised_by);

ALTER TABLE cluster_decision_tickets ADD COLUMN IF NOT EXISTS current_cluster_members INT;
ALTER TABLE cluster_decision_tickets ADD COLUMN IF NOT EXISTS is_concluded BOOLEAN DEFAULT false;

ALTER TABLE cluster_invitees ADD COLUMN IF NOT EXISTS invitee_id VARCHAR REFERENCES users(user_id);
ALTER TABLE cluster_invitees ADD COLUMN IF NOT EXISTS is_joined BOOLEAN DEFAULT false;
ALTER TABLE cluster_invitees ADD COLUMN IF NOT EXISTS is_declined BOOLEAN DEFAULT false;
