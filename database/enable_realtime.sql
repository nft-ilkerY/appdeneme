-- Enable Realtime for Niğtaş Production Tracking System
-- Run this in Supabase SQL Editor

-- Enable realtime for production_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE production_sessions;

-- Enable realtime for mills table
ALTER PUBLICATION supabase_realtime ADD TABLE mills;

-- Enable realtime for silos table
ALTER PUBLICATION supabase_realtime ADD TABLE silos;

-- Enable realtime for packaging_entries table
ALTER PUBLICATION supabase_realtime ADD TABLE packaging_entries;

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Verify realtime is enabled
SELECT
    schemaname,
    tablename
FROM
    pg_publication_tables
WHERE
    pubname = 'supabase_realtime'
ORDER BY
    tablename;
