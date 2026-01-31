DROP TABLE IF EXISTS history;
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_key TEXT NOT NULL,
    video_id TEXT NOT NULL,
    source_code TEXT NOT NULL,
    title TEXT,
    cover TEXT,
    url TEXT,
    episode_index INTEGER,
    playback_position REAL,
    duration REAL,
    updated_at INTEGER,
    UNIQUE(user_key, video_id, source_code)
);
CREATE INDEX idx_user_key ON history(user_key);
