-- Insert popular music genres
INSERT INTO genres (name) VALUES 
  ('Rock'),
  ('Pop'),
  ('Hip Hop'),
  ('Electronic'),
  ('Jazz'),
  ('Classical'),
  ('Country'),
  ('R&B'),
  ('Indie'),
  ('Alternative'),
  ('Folk'),
  ('Reggae'),
  ('Blues'),
  ('Punk'),
  ('Metal'),
  ('Funk'),
  ('Soul'),
  ('Disco'),
  ('House'),
  ('Techno')
ON CONFLICT (name) DO NOTHING;
