-- Events Calendar Database Schema for BLKOUT UK

-- Event Categories Table
CREATE TABLE event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Sources Table (for scraping)
CREATE TABLE event_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  scraping_enabled BOOLEAN DEFAULT TRUE,
  scraping_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location_name VARCHAR(255),
  location_address TEXT,
  location_city VARCHAR(100),
  location_postal_code VARCHAR(20),
  is_online BOOLEAN DEFAULT FALSE,
  online_url VARCHAR(255),
  ticket_url VARCHAR(255),
  image_url VARCHAR(255),
  organizer_name VARCHAR(255),
  organizer_id UUID REFERENCES contacts(id),
  is_blkout_event BOOLEAN DEFAULT FALSE,
  source_id UUID REFERENCES event_sources(id),
  source_event_id VARCHAR(100),
  approval_status VARCHAR(20) DEFAULT 'pending',
  category_id UUID REFERENCES event_categories(id),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event User Preferences Table
CREATE TABLE event_user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  preferred_categories UUID[],
  preferred_locations TEXT[],
  preferred_days TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Scrape Logs Table
CREATE TABLE event_scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES event_sources(id) NOT NULL,
  scrape_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  events_found INTEGER DEFAULT 0,
  events_added INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_events_approval_status ON events(approval_status);
CREATE INDEX idx_events_is_blkout_event ON events(is_blkout_event);

-- Create enum type for approval status
CREATE TYPE event_approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Insert some default categories
INSERT INTO event_categories (name, description) VALUES
('Social', 'Social gatherings and networking events'),
('Workshop', 'Educational workshops and skill-building sessions'),
('Performance', 'Live performances, shows, and entertainment'),
('Discussion', 'Panel discussions, forums, and conversations'),
('Support', 'Support groups and community care events'),
('Pride', 'Pride celebrations and related events'),
('Activism', 'Activism, protests, and advocacy events'),
('Health', 'Health and wellness focused events'),
('Arts', 'Arts, culture, and creative events'),
('Other', 'Other types of events');

-- Insert some default event sources
INSERT INTO event_sources (name, url, scraping_enabled) VALUES
('Eventbrite', 'https://www.eventbrite.co.uk', TRUE),
('Outsavvy', 'https://www.outsavvy.com', TRUE),
('UK Black Pride', 'https://www.ukblackpride.org.uk/events', TRUE);