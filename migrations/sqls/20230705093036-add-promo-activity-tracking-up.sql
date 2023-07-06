CREATE INDEX admin_sent_notifications_notification_id_index ON admin_sent_notifications(notification_id);
CREATE INDEX admin_sent_notifications_type_index ON admin_sent_notifications(type);
CREATE INDEX admin_sent_notifications_is_ended_index ON admin_sent_notifications(is_ended);
CREATE INDEX admin_sent_notifications_created_at_index ON admin_sent_notifications(created_at);

CREATE TABLE IF NOT EXISTS manual_cluster_loan_approval_trail(
    id SERIAL PRIMARY KEY,
    loan_id VARCHAR NOT NULL REFERENCES cluster_loans(loan_id), 
    member_loan_id VARCHAR NOT NULL REFERENCES cluster_member_loans(member_loan_id),
    loan_applicant VARCHAR NOT NULL REFERENCES users(user_id),
    decision admin_manual_decision NOT NULL,
    decided_by VARCHAR NOT NULL REFERENCES admins(admin_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX manual_cluster_loan_approval_trail_id_index ON manual_cluster_loan_approval_trail(id);
CREATE INDEX manual_cluster_loan_approval_trail_member_loan_id_index ON manual_cluster_loan_approval_trail(member_loan_id);
CREATE INDEX manual_cluster_loan_approval_trail_decided_by_index ON manual_cluster_loan_approval_trail(decided_by);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('CRTPROMO', 'create promo', 'admin creates promo'),
    ('EDTPROMO', 'edit promo', 'admin edits promo'),
    ('DLTPROMO', 'delete promo', 'admin deletes promo'),
    ('CNLPROMO', 'cancel promo', 'admin cancels promo'),
    ('SSTNTFTUSR', 'send system type notification to users', 'admin sends system type notification to users'),
    ('SATNTFTUSR', 'send alert type notification to users', 'admin send alert type notification to users'),
    ('RDANTF', 'read a notification', 'admin reads a notification'),
    ('MKASRD', 'marks all notifications as read', 'admin marks all notification as read'),
    ('INCLLNAPP', 'initiates cluster loan application', 'cluster admin initiates cluster loan application'),
    ('ACCLLNAPP', 'accept cluster loan', 'cluster member accept cluster loan'),
    ('DCCLLNAPP', 'decline/cancel cluster loan', 'cluster member decline/cancel cluster loan'),
    ('CLLNDCD', 'cluster loan application declined', 'cluster loan application declined'),
    ('CLLNMNAP', 'cluster loan application subject to manual approval', 'cluster loan application subject to manual approval'),
    ('CLLNAPP', 'cluster loan approved automatically', 'cluster loan approved automatically'),
    ('CLMBRLNEL', 'cluster member runs loan eligibility', 'cluster member runs loan eligibility'),
    ('UPRMSTACT', 'update promo status to active', 'cron job to update promo status to active'),
    ('SNPLNNTADM', 'send non performing loan notifications to admins', 'cron job to send non performing loan notifications to admins'),
    ('UPRMSTAEND', 'update promo status to ended', 'cron job to update promo status to ended'),
    ('SPESNTADM', 'send promo ending soon notification to admins', 'cron job to send promo ending soon notification to admins'),
    ('SANTEND', 'set alert notifications to ended', 'cron job to set alert notifications to ended');

