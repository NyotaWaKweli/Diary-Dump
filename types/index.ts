export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  email_verified: boolean;
  settings: {
    notifications: boolean;
  };
  created_at: string;
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  description: string;
  is_public: boolean;
  is_pinned: boolean;
  password_hash?: string;
  theme: string;
  follower_count: number;
  visit_count: number;
  member_count: number;
  created_at: string;
  updated_at: string;
  owner?: User;
  is_following?: boolean;
  is_member?: boolean;
}

export interface Note {
  id: string;
  space_id: string;
  author_id: string;
  title: string;
  content: string;
  content_html: string;
  color: string;
  color_hex: string;
  tags: string[];
  position_x: number;
  position_y: number;
  rotation: number;
  image_url?: string;
  is_archived: boolean;
  allow_saves: boolean;
  save_count: number;
  view_count: number;
  reaction_count: number;
  created_at: string;
  updated_at: string;
  author?: User;
  comments?: Comment[];
  is_liked?: boolean;
  is_saved?: boolean;
  is_reposted?: boolean;
  original_author?: User; // for reposts
}

export interface Comment {
  id: string;
  note_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'share' | 'repost' | 'join_space' | 'new_note' | 'save';
  actor_id?: string;
  space_id?: string;
  note_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: User;
  space?: Space;
  note?: Note;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  content: string;
  image_url?: string;
  is_anonymous: boolean;
  created_at: string;
}
