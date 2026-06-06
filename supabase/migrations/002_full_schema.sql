-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{"notifications": true}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spaces table
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  theme TEXT DEFAULT 'default',
  follower_count INTEGER DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Space members (join to write)
CREATE TABLE IF NOT EXISTS public.space_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Space followers (follow for notifications)
CREATE TABLE IF NOT EXISTS public.space_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  content TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  color TEXT DEFAULT '#F5F1E8',
  color_hex TEXT DEFAULT '#F5F1E8',
  tags TEXT[] DEFAULT '{}',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  rotation FLOAT DEFAULT 0,
  image_url TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  allow_saves BOOLEAN DEFAULT TRUE,
  save_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note saves
CREATE TABLE IF NOT EXISTS public.note_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table (heart only)
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

-- Reposts table
CREATE TABLE IF NOT EXISTS public.reposts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  reposter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  reposted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(original_note_id, reposter_id, space_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'share', 'repost', 'join_space', 'new_note', 'save')),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  content TEXT NOT NULL,
  image_url TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_space_members ON public.space_members(space_id, user_id);
CREATE INDEX IF NOT EXISTS idx_space_followers ON public.space_followers(space_id, user_id);
CREATE INDEX IF NOT EXISTS idx_note_saves ON public.note_saves(note_id, user_id);
CREATE INDEX IF NOT EXISTS idx_reposts ON public.reposts(space_id, reposter_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users readable by all" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public spaces readable" ON public.spaces FOR SELECT USING (is_public = true);
CREATE POLICY "Own spaces readable" ON public.spaces FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Spaces insert own" ON public.spaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Spaces update own" ON public.spaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Spaces delete own" ON public.spaces FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Members readable" ON public.space_members FOR SELECT USING (true);
CREATE POLICY "Members insert self" ON public.space_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members delete self" ON public.space_members FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Followers readable" ON public.space_followers FOR SELECT USING (true);
CREATE POLICY "Followers insert self" ON public.space_followers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Followers delete self" ON public.space_followers FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Notes in public spaces readable" ON public.notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.spaces WHERE spaces.id = notes.space_id AND spaces.is_public = true)
);
CREATE POLICY "Own notes readable" ON public.notes FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Notes insert own" ON public.notes FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Notes update own" ON public.notes FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Notes delete own" ON public.notes FOR DELETE USING (author_id = auth.uid());

CREATE POLICY "Saves readable own" ON public.note_saves FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Saves insert own" ON public.note_saves FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Saves delete own" ON public.note_saves FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Comments readable" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Comments insert own" ON public.comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Comments delete own" ON public.comments FOR DELETE USING (author_id = auth.uid());

CREATE POLICY "Reactions readable" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Reactions insert own" ON public.reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Reactions delete own" ON public.reactions FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Reposts readable" ON public.reposts FOR SELECT USING (true);
CREATE POLICY "Reposts insert own" ON public.reposts FOR INSERT WITH CHECK (reposter_id = auth.uid());
CREATE POLICY "Reposts delete own" ON public.reposts FOR DELETE USING (reposter_id = auth.uid());

CREATE POLICY "Notifications readable own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notifications update own" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Notifications delete own" ON public.notifications FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Feedback insert all" ON public.feedback FOR INSERT WITH CHECK (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-images', 'diary-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Images viewable by all" ON storage.objects FOR SELECT USING (bucket_id = 'diary-images');
CREATE POLICY "Images upload by auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'diary-images' AND auth.role() = 'authenticated');
CREATE POLICY "Images delete by owner" ON storage.objects FOR DELETE USING (bucket_id = 'diary-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language 'plpgsql';
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
