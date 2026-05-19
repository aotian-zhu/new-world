ALTER TABLE memories ADD COLUMN author_id TEXT;

CREATE TABLE memory_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(memory_id, player_id)
);

ALTER TABLE memory_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for memory_likes" ON memory_likes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for memory_likes" ON memory_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access for memory_likes" ON memory_likes FOR DELETE USING (true);

-- Allow public delete for memories
CREATE POLICY "Allow public delete access for memories" ON memories FOR DELETE USING (true);
