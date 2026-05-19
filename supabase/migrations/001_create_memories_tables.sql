CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT NOT NULL,
  "desc" TEXT,
  likes INTEGER DEFAULT 0,
  is_user_added BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Allow public access (since there is no auth)
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for memories" ON memories FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for memories" ON memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for memories" ON memories FOR UPDATE USING (true);

CREATE POLICY "Allow public read access for comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for comments" ON comments FOR INSERT WITH CHECK (true);
