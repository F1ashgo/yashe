-- Apply once to an existing production database before deploying the hardened API.

ALTER TABLE users
  ADD COLUMN token_version INT NOT NULL DEFAULT 0
  COMMENT '令牌版本，递增后使旧令牌失效'
  AFTER status;

ALTER TABLE contact_messages
  ADD COLUMN budget VARCHAR(20) DEFAULT NULL
  COMMENT '预算范围'
  AFTER subject;

CREATE INDEX idx_notifications_status_created
  ON notifications(status, created_at);
