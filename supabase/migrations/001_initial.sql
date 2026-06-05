-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{"notifications": true, "night_mode": false}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spaces table
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  color TEXT DEFAULT 'yellow',
  tags TEXT[] DEFAULT '{}',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  rotation FLOAT DEFAULT 0,
  image_url TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  reactions_heart INTEGER DEFAULT 0,
  reactions_laugh INTEGER DEFAULT 0,
  reactions_sad INTEGER DEFAULT 0,
  reactions_fire INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('heart', 'laugh', 'sad', 'fire')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(note_id, user_id, type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spaces_owner ON public.spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaces_slug ON public.spaces(slug);
CREATE INDEX IF NOT EXISTS idx_spaces_public ON public.spaces(is_public);
CREATE INDEX IF NOT EXISTS idx_notes_space ON public.notes(space_id);
CREATE INDEX IF NOT EXISTS idx_notes_author ON public.notes(author_id);
CREATE INDEX IF NOT EXISTS idx_notes_created ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_note ON public.comments(note_id);
CREATE INDEX IF NOT EXISTS idx_reactions_note ON public.reactions(note_id);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users readable by all" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Spaces policies
CREATE POLICY "Public spaces readable" ON public.spaces FOR SELECT USING (is_public = true);
CREATE POLICY "Own spaces readable" ON public.spaces FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Spaces insert own" ON public.spaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Spaces update own" ON public.spaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Spaces delete own" ON public.spaces FOR DELETE USING (owner_id = auth.uid());

-- Notes policies
CREATE POLICY "Notes in public spaces readable" ON public.notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.spaces WHERE spaces.id = notes.space_id AND spaces.is_public = true)
);
CREATE POLICY "Own notes readable" ON public.notes FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Notes insert own" ON public.notes FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Notes update own" ON public.notes FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Notes delete own" ON public.notes FOR DELETE USING (author_id = auth.uid());

-- Comments policies
CREATE POLICY "Comments in public notes readable" ON public.comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.notes JOIN public.spaces ON spaces.id = notes.space_id
    WHERE notes.id = comments.note_id AND spaces.is_public = true
  )
);
CREATE POLICY "Comments insert own" ON public.comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Comments delete own" ON public.comments FOR DELETE USING (author_id = auth.uid());

-- Reactions policies
CREATE POLICY "Reactions in public notes readable" ON public.reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.notes JOIN public.spaces ON spaces.id = notes.space_id
    WHERE notes.id = reactions.note_id AND spaces.is_public = true
  )
);
CREATE POLICY "Reactions manage own" ON public.reactions FOR ALL USING (user_id = auth.uid());

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-images', 'diary-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Images viewable by all" ON storage.objects FOR SELECT USING (bucket_id = 'diary-images');
CREATE POLICY "Images upload by auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'diary-images' AND auth.role() = 'authenticated');
CREATE POLICY "Images delete by owner" ON storage.objects FOR DELETE USING (bucket_id = 'diary-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language 'plpgsql';
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
