-- Create liked_songs table
CREATE TABLE IF NOT EXISTS liked_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Add privacy settings for friends list and liked songs
ALTER TABLE users ADD COLUMN IF NOT EXISTS friends_list_visibility VARCHAR(20) DEFAULT 'friends' CHECK (friends_list_visibility IN ('public', 'friends', 'private'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS liked_songs_visibility VARCHAR(20) DEFAULT 'friends' CHECK (liked_songs_visibility IN ('public', 'friends', 'private'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_liked_songs_user_id ON liked_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_songs_post_id ON liked_songs(post_id);
