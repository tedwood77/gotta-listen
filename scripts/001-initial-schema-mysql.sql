-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  country VARCHAR(100),
  state_region VARCHAR(100),
  city VARCHAR(100),
  favorite_genres JSON,
  privacy_settings JSON DEFAULT ('{"profile_visibility": "public", "post_visibility": "public", "location_visibility": "public", "friend_list_visibility": "friends", "liked_songs_visibility": "public", "allow_friend_requests": true, "show_online_status": true, "email_notifications": true, "push_notifications": true}'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_username (username)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  tags JSON,
  spotify_url TEXT,
  explanation TEXT NOT NULL,
  visibility VARCHAR(20) DEFAULT 'public',
  edited_at TIMESTAMP NULL,
  edit_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_posts_user_id (user_id),
  INDEX idx_posts_genre (genre),
  INDEX idx_posts_created_at (created_at DESC),
  INDEX idx_posts_visibility (visibility),
  CHECK (visibility IN ('public', 'friends', 'private'))
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_post (user_id, post_id),
  INDEX idx_likes_user_id (user_id),
  INDEX idx_likes_post_id (post_id)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  requester_id VARCHAR(36) NOT NULL,
  addressee_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_friendship (requester_id, addressee_id),
  INDEX idx_friendships_requester (requester_id),
  INDEX idx_friendships_addressee (addressee_id),
  CHECK (status IN ('pending', 'accepted', 'declined'))
);

-- Create user_blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  blocker_id VARCHAR(36) NOT NULL,
  blocked_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_block (blocker_id, blocked_id),
  INDEX idx_user_blocks_blocker (blocker_id),
  INDEX idx_user_blocks_blocked (blocked_id)
);

-- Create sessions table for persistent authentication
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_token (session_token),
  INDEX idx_sessions_expires (expires_at)
);
