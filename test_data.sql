-- Test Data for Tap Battle Game
-- Run this in Supabase SQL Editor after running clean_database.sql

-- 1. Insert test users (using auth.users IDs)
INSERT INTO users (id, email, name, avatar_url, provider) VALUES
('11111111-1111-1111-1111-111111111111', 'player1@test.com', 'Player One', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1', 'discord'),
('22222222-2222-2222-2222-222222222222', 'player2@test.com', 'Player Two', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2', 'google'),
('33333333-3333-3333-3333-333333333333', 'player3@test.com', 'Player Three', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player3', 'discord'),
('44444444-4444-4444-4444-444444444444', 'player4@test.com', 'Player Four', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player4', 'google'),
('55555555-5555-5555-5555-555555555555', 'player5@test.com', 'Player Five', 'https://api.dicebear.com/7.x/avataaars/svg?seed=player5', 'discord')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert test scores
INSERT INTO scores (user_id, score) VALUES
('11111111-1111-1111-1111-111111111111', 1500),
('22222222-2222-2222-2222-222222222222', 1200),
('33333333-3333-3333-3333-333333333333', 900),
('44444444-4444-4444-4444-444444444444', 750),
('55555555-5555-5555-5555-555555555555', 600)
ON CONFLICT (user_id) DO UPDATE SET 
  score = EXCLUDED.score,
  created_at = NOW();

-- 3. Verify data
SELECT 
  'Users count:' as info, 
  COUNT(*) as count 
FROM users
UNION ALL
SELECT 
  'Scores count:' as info, 
  COUNT(*) as count 
FROM scores;

-- 4. Show top scores with user info
SELECT 
  s.score,
  u.name,
  u.avatar_url,
  s.created_at
FROM scores s
JOIN users u ON s.user_id = u.id
ORDER BY s.score DESC
LIMIT 10; 