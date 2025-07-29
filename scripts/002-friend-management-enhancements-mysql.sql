-- Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSON DEFAULT ('{}'),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_read (is_read),
  CHECK (type IN ('friend_request', 'friend_accepted', 'post_like', 'post_comment', 'post_share', 'mention', 'comment_reply'))
);

-- Add user_music_accounts table
CREATE TABLE IF NOT EXISTS user_music_accounts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(255),
  username VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_platform (user_id, platform),
  INDEX idx_user_music_accounts_user_id (user_id),
  CHECK (platform IN ('spotify', 'apple_music', 'youtube_music', 'soundcloud', 'bandcamp', 'tidal'))
);

-- Add playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  platform VARCHAR(50),
  platform_playlist_id VARCHAR(255),
  cover_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_playlists_user_id (user_id),
  CHECK (platform IN ('spotify', 'apple_music', 'youtube_music', 'soundcloud', 'bandcamp', 'tidal') OR platform IS NULL)
);

-- Add playlist_tracks table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  playlist_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  position INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_playlist_tracks_playlist_id (playlist_id)
);
