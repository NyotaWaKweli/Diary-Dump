import { supabaseAdmin } from './supabase/admin';
import type { Space, Note, Comment, User } from '@/types';

// ===== USER OPERATIONS =====
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error || !data) return null;
  return data as User;
}

export async function createUser(userData: { id: string; email: string; display_name: string }): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: userData.id,
      email: userData.email,
      display_name: userData.display_name,
    })
    .select()
    .single();
  if (error || !data) return null;
  return data as User;
}

// ===== SPACE OPERATIONS =====
export async function getSpaces(): Promise<Space[]> {
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .select(`*, owner:users(id, display_name, avatar_url)`)
    .eq('is_public', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Space[];
}

export async function getSpaceById(id: string): Promise<Space | null> {
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .select(`*, owner:users(id, display_name, avatar_url)`)
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as Space;
}

export async function getSpaceBySlug(slug: string): Promise<Space | null> {
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .select(`*, owner:users(id, display_name, avatar_url)`)
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return data as Space;
}

export async function createSpace(spaceData: {
  name: string; slug: string; owner_id: string;
  is_public?: boolean; password_hash?: string | null;
}): Promise<Space | null> {
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .insert({
      name: spaceData.name,
      slug: spaceData.slug,
      owner_id: spaceData.owner_id,
      is_public: spaceData.is_public ?? true,
      password_hash: spaceData.password_hash ?? null,
      theme: 'default',
    })
    .select()
    .single();
  if (error || !data) return null;
  return data as Space;
}

export async function deleteSpace(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('spaces').delete().eq('id', id);
  return !error;
}

// ===== NOTE OPERATIONS =====
export async function getNotesBySpaceId(spaceId: string): Promise<Note[]> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .select(`*, author:users(id, display_name, avatar_url)`)
    .eq('space_id', spaceId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Note[];
}

export async function getNoteById(id: string): Promise<Note | null> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .select(`*, author:users(id, display_name, avatar_url), comments:comments(*, author:users(id, display_name, avatar_url))`)
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as Note;
}

export async function createNote(noteData: {
  space_id: string; author_id: string; content: string;
  color?: string; tags?: string[];
  position_x: number; position_y: number; rotation: number;
  image_url?: string | null;
}): Promise<Note | null> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .insert({
      space_id: noteData.space_id,
      author_id: noteData.author_id,
      content: noteData.content,
      color: noteData.color || 'yellow',
      tags: noteData.tags || [],
      position_x: noteData.position_x,
      position_y: noteData.position_y,
      rotation: noteData.rotation,
      image_url: noteData.image_url || null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return data as Note;
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('notes').delete().eq('id', id);
  return !error;
}

export async function updateNoteReactions(id: string, reactions: { heart: number; laugh: number; sad: number; fire: number }): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('notes')
    .update({
      reactions_heart: reactions.heart,
      reactions_laugh: reactions.laugh,
      reactions_sad: reactions.sad,
      reactions_fire: reactions.fire,
    })
    .eq('id', id);
  return !error;
}

// ===== COMMENT OPERATIONS =====
export async function getCommentsByNoteId(noteId: string): Promise<Comment[]> {
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select(`*, author:users(id, display_name, avatar_url)`)
    .eq('note_id', noteId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as Comment[];
}

export async function createComment(commentData: {
  note_id: string; author_id: string; content: string;
}): Promise<Comment | null> {
  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert(commentData)
    .select()
    .single();
  if (error || !data) return null;
  return data as Comment;
}

// ===== REACTION OPERATIONS =====
export async function toggleReaction(noteId: string, userId: string, type: 'heart' | 'laugh' | 'sad' | 'fire'): Promise<boolean> {
  const { data: existing } = await supabaseAdmin
    .from('reactions')
    .select('id')
    .eq('note_id', noteId)
    .eq('user_id', userId)
    .eq('type', type)
    .single();

  if (existing) {
    const { error } = await supabaseAdmin
      .from('reactions')
      .delete()
      .eq('id', existing.id);
    if (error) return false;
  } else {
    const { error } = await supabaseAdmin
      .from('reactions')
      .insert({ note_id: noteId, user_id: userId, type });
    if (error) return false;
  }

  return true;
}
