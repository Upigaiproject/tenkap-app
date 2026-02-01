-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    bio TEXT,
    interests TEXT[], -- Array of interest tags
    profile_photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    privacy_settings JSONB DEFAULT '{"share_location": true, "visible_to_all": true}'
);

-- LOCATION HISTORY TABLE
CREATE TABLE IF NOT EXISTS location_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS type
    accuracy_meters FLOAT,
    timestamp TIMESTAMP DEFAULT NOW(),
    duration_minutes INT, -- How long they stayed
    place_type VARCHAR(50), -- cafe, gym, park, etc.
    place_name VARCHAR(255),
    is_significant BOOLEAN DEFAULT FALSE -- Flagged by AI as important location
);
CREATE INDEX IF NOT EXISTS idx_location_history_user ON location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_time ON location_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_geo ON location_history USING GIST(location);

-- USER PATTERNS TABLE (AI-Generated Insights)
CREATE TABLE IF NOT EXISTS user_patterns (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50), -- 'daily_routine', 'favorite_spots', 'time_preferences'
    pattern_data JSONB, -- Flexible structure for different patterns
    confidence_score FLOAT, -- 0-1, how confident AI is
    detected_at TIMESTAMP DEFAULT NOW(),
    last_validated TIMESTAMP
);

-- HEAT MAPS TABLE (Aggregated Location Data)
CREATE TABLE IF NOT EXISTS heat_maps (
    id BIGSERIAL PRIMARY KEY,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    radius_meters INT DEFAULT 50,
    user_count INT DEFAULT 0,
    time_slot VARCHAR(20), -- '09:00-10:00', '18:00-19:00'
    day_of_week INT, -- 0-6 (Sunday-Saturday)
    popularity_score FLOAT, -- Calculated metric
    last_updated TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_heat_maps_geo ON heat_maps USING GIST(location);

-- MATCHES TABLE
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_1_id UUID REFERENCES users(id),
    user_2_id UUID REFERENCES users(id),
    match_score FLOAT, -- 0-1, compatibility score
    match_type VARCHAR(50), -- 'organic_proximity', 'event_based', 'ai_suggested'
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, expired, blocked
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    last_interaction TIMESTAMP,
    UNIQUE(user_1_id, user_2_id)
);

-- NUDGES TABLE (Push Notifications)
CREATE TABLE IF NOT EXISTS nudges (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    nudge_type VARCHAR(50), -- 'go_buy_milk', 'coffee_break', 'explore_area'
    message TEXT NOT NULL,
    target_location GEOGRAPHY(POINT, 4326),
    target_place_name VARCHAR(255),
    match_id UUID REFERENCES matches(id), -- Related match (if any)
    sent_at TIMESTAMP DEFAULT NOW(),
    opened_at TIMESTAMP,
    action_taken BOOLEAN DEFAULT FALSE,
    response_time_minutes INT
);

-- EVENTS TABLE (Katil Kim type gatherings)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50), -- 'katil_kim', 'social_mixer', 'themed_party'
    description TEXT,
    location GEOGRAPHY(POINT, 4326),
    venue_name VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    max_participants INT DEFAULT 50,
    current_participants INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
    created_at TIMESTAMP DEFAULT NOW()
);

-- EVENT PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS event_participants (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    registration_time TIMESTAMP DEFAULT NOW(),
    attendance_status VARCHAR(20) DEFAULT 'registered', -- registered, checked_in, no_show
    audio_role VARCHAR(50), -- For Katil Kim: 'detective', 'suspect', 'victim'
    UNIQUE(event_id, user_id)
);

-- USER INTERACTIONS TABLE (For ML Training)
CREATE TABLE IF NOT EXISTS user_interactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    interaction_type VARCHAR(50), -- 'app_open', 'location_check', 'nudge_response', 'profile_view'
    interaction_data JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interactions_user_time ON user_interactions(user_id, timestamp DESC);
