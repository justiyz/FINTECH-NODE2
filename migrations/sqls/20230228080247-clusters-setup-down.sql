DROP TYPE IF EXISTS cluster_voting_type CASCADE;
DROP TYPE IF EXISTS cluster_type CASCADE;

DROP INDEX IF EXISTS clusters_cluster_id_index;
DROP INDEX IF EXISTS clusters_created_by_index;
DROP INDEX IF EXISTS clusters_type_index;
DROP INDEX IF EXISTS clusters_admin_index;
DROP INDEX IF EXISTS clusters_status_index;
DROP INDEX IF EXISTS clusters_loan_status_index;
DROP INDEX IF EXISTS clusters_unique_code_index;
DROP INDEX IF EXISTS cluster_members_id_index;
DROP INDEX IF EXISTS cluster_members_cluster_id_index;
DROP INDEX IF EXISTS cluster_members_user_id_index;
DROP INDEX IF EXISTS cluster_invitees_id_index;
DROP INDEX IF EXISTS cluster_invitees_cluster_id_index;
DROP INDEX IF EXISTS cluster_invitees_invitation_mode_index;
DROP INDEX IF EXISTS cluster_decision_types_id_index;
DROP INDEX IF EXISTS cluster_decision_types_name_index;
DROP INDEX IF EXISTS cluster_decision_tickets_ticket_id_index;
DROP INDEX IF EXISTS cluster_decision_tickets_cluster_id_index;
DROP INDEX IF EXISTS cluster_decision_tickets_type_index;
DROP INDEX IF EXISTS cluster_decision_votes_decision_ticket_index;
DROP INDEX IF EXISTS cluster_decision_votes_cluster_id_index;
DROP INDEX IF EXISTS cluster_decision_votes_is_cluster_admin_index;
DROP INDEX IF EXISTS cluster_decision_votes_vote_index;

DROP TABLE IF EXISTS clusters CASCADE;
DROP TABLE IF EXISTS cluster_members CASCADE;
DROP TABLE IF EXISTS cluster_invitees CASCADE;
DROP TABLE IF EXISTS cluster_decision_types CASCADE;
DROP TABLE IF EXISTS cluster_decision_tickets CASCADE;
DROP TABLE IF EXISTS cluster_decision_votes CASCADE;


ALTER TABLE users DROP COLUMN IF EXISTS is_verified_address;
