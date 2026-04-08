CREATE TABLE IF NOT EXISTS tasks (
  id               TEXT    NOT NULL PRIMARY KEY,
  name             TEXT,
  project_id       TEXT    REFERENCES projects(id) ON DELETE SET NULL,
  category_id      TEXT    REFERENCES categories(id) ON DELETE SET NULL,
  billable         INTEGER NOT NULL DEFAULT 1,
  start_time       TEXT    NOT NULL,
  end_time         TEXT,
  duration_seconds INTEGER,
  status           TEXT    NOT NULL DEFAULT 'running'
                           CHECK(status IN ('running','paused','completed')),
  created_at       TEXT    NOT NULL,
  updated_at       TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_start_time ON tasks(start_time);
