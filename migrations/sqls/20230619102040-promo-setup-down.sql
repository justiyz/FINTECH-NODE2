/* Replace with your SQL commands */
DROP INDEX IF EXISTS system_promos_promo_id_index;
DROP INDEX IF EXISTS system_promos_status_index;
DROP INDEX IF EXISTS system_promos_name_index;

DROP TYPE IF EXISTS promo_status CASCADE;
DROP TYPE IF EXISTS admin_notification_types CASCADE;
DROP TABLE IF EXISTS system_promos CASCADE;
DROP TABLE IF EXISTS admin_sent_notifications CASCADE;

