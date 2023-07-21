ALTER TABLE clusters ADD CONSTRAINT clusters_created_by_fkey FOREIGN KEY (created_by) REFERENCES  users(user_id);
