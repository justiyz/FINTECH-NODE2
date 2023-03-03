DROP INDEX IF EXISTS cluster_decision_votes_voter_id_index;
DROP INDEX IF EXISTS cluster_decision_tickets_ticket_raised_by_index;

ALTER TABLE cluster_decision_votes DROP COLUMN IF EXISTS voter_id;
ALTER TABLE cluster_decision_tickets DROP COLUMN IF EXISTS ticket_raised_by;
ALTER TABLE cluster_decision_tickets DROP COLUMN IF EXISTS current_cluster_members;
ALTER TABLE cluster_decision_tickets DROP COLUMN IF EXISTS is_concluded;

ALTER TABLE cluster_invitees DROP COLUMN IF EXISTS invitee_id;
ALTER TABLE cluster_invitees DROP COLUMN IF EXISTS is_joined;
ALTER TABLE cluster_invitees DROP COLUMN IF EXISTS is_declined;
