CREATE TABLE IF NOT EXISTS prize_donations (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
  legal_name TEXT NOT NULL, public_name TEXT NOT NULL, contact_person TEXT NOT NULL,
  email TEXT NOT NULL, phone TEXT NOT NULL, website TEXT NOT NULL DEFAULT '',
  prize_name TEXT NOT NULL, prize_description TEXT NOT NULL, retail_value TEXT NOT NULL,
  availability TEXT NOT NULL, restrictions TEXT NOT NULL DEFAULT '', fulfillment TEXT NOT NULL,
  logo_key TEXT, prize_photo_key TEXT, recognition_permission INTEGER NOT NULL CHECK (recognition_permission = 1), notes TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS prize_donations_created_at ON prize_donations(created_at);

CREATE TABLE IF NOT EXISTS raffle_events (
  id TEXT PRIMARY KEY, event_name TEXT NOT NULL CHECK (event_name IN ('raffle_notification_signup','raffle_prize_donation_submission','raffle_general_donation_click')),
  page_path TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS raffle_events_created_at ON raffle_events(created_at);
