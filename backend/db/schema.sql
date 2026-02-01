-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  age INTEGER,
  gender VARCHAR(20),
  bio TEXT,
  self_description TEXT,
  profile_photo VARCHAR(500),
  
  -- Location
  current_location GEOGRAPHY(POINT, 4326),
  current_category VARCHAR(50),
  
  -- Status
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  -- Auth
  token VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT users_phone_check CHECK (phone ~ '^\+90[0-9]{10}$')
);

-- Spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active, is_available);

-- Check-ins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  
  -- Entry
  entry_time TIMESTAMP NOT NULL,
  entry_coordinate GEOGRAPHY(POINT, 4326) NOT NULL,
  
  -- Exit
  exit_time TIMESTAMP,
  exit_coordinate GEOGRAPHY(POINT, 4326),
  
  -- Metadata
  duration INTEGER, -- minutes
  distance_moved REAL, -- meters
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_entry_time ON checkins(entry_time);
CREATE INDEX IF NOT EXISTS idx_checkins_category ON checkins(category);
CREATE INDEX IF NOT EXISTS idx_checkins_entry_location ON checkins USING GIST(entry_coordinate);

-- Coordinate history table
CREATE TABLE IF NOT EXISTS coordinate_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coordinate GEOGRAPHY(POINT, 4326) NOT NULL,
  category VARCHAR(50),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coord_history_user_id ON coordinate_history(user_id);
CREATE INDEX IF NOT EXISTS idx_coord_history_timestamp ON coordinate_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_coord_history_location ON coordinate_history USING GIST(coordinate);

-- Proximity events table
CREATE TABLE IF NOT EXISTS proximity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  method VARCHAR(10) NOT NULL, -- 'nfc' or 'gps'
  distance REAL, -- meters
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proximity_user1 ON proximity_events(user1_id);
CREATE INDEX IF NOT EXISTS idx_proximity_user2 ON proximity_events(user2_id);
CREATE INDEX IF NOT EXISTS idx_proximity_timestamp ON proximity_events(timestamp);

-- Suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'location', 'timing', 'person', 'category'
  
  -- Location data
  location_coordinate GEOGRAPHY(POINT, 4326),
  location_distance REAL,
  location_category VARCHAR(50),
  
  -- Person data
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Content
  reasoning TEXT NOT NULL,
  confidence REAL NOT NULL, -- 0-1
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_expires_at ON suggestions(expires_at);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  icon VARCHAR(500),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Global settings
  enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- Type settings (JSON)
  type_preferences JSONB,
  
  -- Push subscription
  push_subscription JSONB,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Useful functions

-- Find nearby users
CREATE OR REPLACE FUNCTION find_nearby_users(
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  radius_meters INTEGER,
  category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  first_name VARCHAR,
  distance_meters REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.first_name,
    ST_Distance(
      u.current_location,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
    ) AS distance_meters
  FROM users u
  WHERE 
    u.is_active = true
    AND u.is_available = true
    AND (category IS NULL OR u.current_category = category)
    AND ST_DWithin(
      u.current_location,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;
