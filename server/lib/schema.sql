-- ============================================================
--  MathSigma · MySQL 8.0+ / 8.4 结构
--  由 server/lib/store.cjs 在启动时自动执行，也可手工导入：
--    mysql -u mathsigma -p mathsigma < server/lib/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS kp (
  id        VARCHAR(64)  NOT NULL,
  grade     VARCHAR(16)  NOT NULL DEFAULT '',
  title     VARCHAR(255) NOT NULL DEFAULT '',
  versions  TEXT,
  tags      TEXT,
  summary   TEXT,
  PRIMARY KEY (id),
  KEY idx_kp_grade (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS question (
  id         VARCHAR(191) NOT NULL,
  kp         VARCHAR(64)  NOT NULL,
  level      VARCHAR(16)  NOT NULL DEFAULT 'basic',
  type       VARCHAR(16)  NOT NULL DEFAULT 'choice',
  stem       TEXT         NOT NULL,
  options    TEXT,
  answer     TEXT,
  accept     TEXT,
  keywords   TEXT,
  analysis   TEXT,
  tags       TEXT,
  source     VARCHAR(32)  NOT NULL DEFAULT 'builtin',
  hash       CHAR(16)     NOT NULL,
  created_at VARCHAR(32)  DEFAULT NULL,
  updated_at VARCHAR(32)  DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY idx_question_hash (hash),
  KEY idx_question_kp (kp),
  KEY idx_question_level (level),
  KEY idx_question_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS attempt (
  id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uid     VARCHAR(64)  DEFAULT '',
  qid     VARCHAR(191) DEFAULT '',
  kp      VARCHAR(64)  DEFAULT '',
  level   VARCHAR(16)  DEFAULT '',
  correct TINYINT      NOT NULL DEFAULT 0,
  sec     INT          NOT NULL DEFAULT 0,
  ts      BIGINT       NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_attempt_uid (uid),
  KEY idx_attempt_ts (ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS user (
  id         VARCHAR(64)  NOT NULL,
  username   VARCHAR(64)  NOT NULL DEFAULT '',
  pwd        VARCHAR(255) DEFAULT '',
  grade      VARCHAR(16)  DEFAULT '',
  version    VARCHAR(32)  DEFAULT '',
  nickname   VARCHAR(64)  DEFAULT '',
  school     VARCHAR(128) DEFAULT '',
  created_at VARCHAR(32)  DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_user_name (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS setting (
  skey  VARCHAR(64) NOT NULL,
  value TEXT,
  PRIMARY KEY (skey)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 自适应核心：每个学生 × 每个知识点的掌握度（0~1）
-- mastery = 答对数 / (答对数 + 答错数)，随答题动态更新
CREATE TABLE IF NOT EXISTS mastery_scores (
  uid        VARCHAR(64)  NOT NULL,
  kp         VARCHAR(64)  NOT NULL,
  correct    INT          NOT NULL DEFAULT 0,
  wrong      INT          NOT NULL DEFAULT 0,
  mastery    DECIMAL(5,4) NOT NULL DEFAULT 0,
  updated_at VARCHAR(32)  DEFAULT NULL,
  PRIMARY KEY (uid, kp),
  KEY idx_mastery_kp (kp),
  KEY idx_mastery_mastery (mastery)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
