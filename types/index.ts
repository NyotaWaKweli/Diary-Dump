export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  is_public: boolean;
  is_pinned: boolean;
  theme: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  note_count?: number;
}

export type NoteColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple';

export interface Note {
  id: string;
  space_id: string;
  author_id: string;
  content: string;
  color: NoteColor;
  tags: string[];
  position_x: number;
  position_y: number;
  rotation: number;
  image_url: string | null;
  is_archived: boolean;
  reactions_heart: number;
  reactions_laugh: number;
  reactions_sad: number;
  reactions_fire: number;
  created_at: string;
  updated_at: string;
  author?: User;
  comments_count?: number;
}

export interface Comment {
  id: string;
  note_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: User;
}
