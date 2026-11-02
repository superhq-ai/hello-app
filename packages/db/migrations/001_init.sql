CREATE TABLE visits (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  count INTEGER NOT NULL
);

INSERT INTO visits (id, count) VALUES (1, 0);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
