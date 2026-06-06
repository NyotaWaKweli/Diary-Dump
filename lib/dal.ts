import { supabaseAdmin } from './supabase/admin';
import type { Space, Note, Comment, User, Notification } from '@/types';

// ===== USER OPERATIONS =====
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', email).single();
  if (error || !data) return null;
  return data as User;
}

export async function createUser(userData: { id: string; email: string; display_name: string }): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from('users').insert(userData).select().single();
  if (error || !data) return null;
  return data as User;
}

// ===== SPACE OPERATIONS =====
export async function getSpaces(): Promise<Space[]> {
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .select('*, owner:users(id, display_name, avatar_url)')
    .eq('is_public', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Space[];
}

export async function getSpaceById(id: string): Promise<Space | null> {
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .select('*, owner:users(id, display_name, avatar_url)')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as Space;
}

export async function getSpaceBySlug(slug: string): Promise<Space | null> {
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .select('*, owner:users(id, display_name, avatar_url)')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return data as Space;
}

export async function createSpace(spaceData: {
  name: string; slug: string; owner_id: string;
  description?: string; is_public?: boolean; password_hash?: string | null;
}): Promise<Space | null> {
  const { data, error } = await supabaseAdmin
    .from('spaces')
    .insert({
      name: spaceData.name,
      slug: spaceData.slug,
      owner_id: spaceData.owner_id,
      description: spaceData.description || '',
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

export async function incrementSpaceVisits(id: string): Promise<void> {
  await supabaseAdmin.rpc('increment_space_visits', { space_id: id });
}

// ===== SPACE MEMBERS & FOLLOWERS =====
export async function joinSpace(spaceId: string, userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('space_members').insert({ space_id: spaceId, user_id: userId });
  if (!error) {
    await supabaseAdmin.rpc('increment_member_count', { space_id: spaceId });
  }
  return !error;
}

export async function leaveSpace(spaceId: string, userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('space_members').delete().eq('space_id', spaceId).eq('user_id', userId);
  if (!error) {
    await supabaseAdmin.rpc('decrement_member_count', { space_id: spaceId });
  }
  return !error;
}

export async function isSpaceMember(spaceId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('space_members').select('id').eq('space_id', spaceId).eq('user_id', userId).single();
  return !!data;
}

export async function followSpace(spaceId: string, userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('space_followers').insert({ space_id: spaceId, user_id: userId });
  if (!error) {
    await supabaseAdmin.rpc('increment_follower_count', { space_id: spaceId });
  }
  return !error;
}

export async function unfollowSpace(spaceId: string, userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('space_followers').delete().eq('space_id', spaceId).eq('user_id', userId);
  if (!error) {
    await supabaseAdmin.rpc('decrement_follower_count', { space_id: spaceId });
  }
  return !error;
}

export async function isSpaceFollower(spaceId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('space_followers').select('id').eq('space_id', spaceId).eq('user_id', userId).single();
  return !!data;
}

// ===== NOTE OPERATIONS =====
export async function getNotesBySpaceId(spaceId: string, limit: number = 30, offset: number = 0): Promise<Note[]> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .select('*, author:users(id, display_name, avatar_url)')
    .eq('space_id', spaceId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
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
  space_id: string; author_id: string; title: string; content: string;
  color?: string; color_hex?: string; tags?: string[];
  position_x: number; position_y: number; rotation: number;
  image_url?: string | null; allow_saves?: boolean;
}): Promise<Note | null> {
  const { data, error } = await supabaseAdmin
    .from('notes')
    .insert({
      space_id: noteData.space_id,
      author_id: noteData.author_id,
      title: noteData.title,
      content: noteData.content,
      color: noteData.color || '#F5F1E8',
      color_hex: noteData.color_hex || '#F5F1E8',
      tags: noteData.tags || [],
      position_x: noteData.position_x,
      position_y: noteData.position_y,
      rotation: noteData.rotation,
      image_url: noteData.image_url || null,
      allow_saves: noteData.allow_saves ?? true,
    })
    .select()
    .single();
  if (error || !data) return null;
  return data as Note;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<boolean> {
  const { error } = await supabaseAdmin.from('notes').update(updates).eq('id', id);
  return !error;
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('notes').delete().eq('id', id);
  return !error;
}

export async function incrementNoteViews(id: string): Promise<void> {
  await supabaseAdmin.rpc('increment_note_views', { note_id: id });
}

// ===== NOTE SAVES =====
export async function saveNote(noteId: string, userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('note_saves').insert({ note_id: noteId, user_id: userId });
  if (!error) {
    await supabaseAdmin.rpc('increment_save_count', { note_id: noteId });
  }
  return !error;
}

export async function unsaveNote(noteId: string, userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('note_saves').delete().eq('note_id', noteId).eq('user_id', userId);
  if (!error) {
    await supabaseAdmin.rpc('decrement_save_count', { note_id: noteId });
  }
  return !error;
}

export async function isNoteSaved(noteId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('note_saves').select('id').eq('note_id', noteId).eq('user_id', userId).single();
  return !!data;
}

export async function getSavedNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabaseAdmin
    .from('note_saves')
    .select('note:notes(*, author:users(id, display_name, avatar_url))')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map(d => d.note) as Note[];
}

// ===== REACTIONS (Heart only) =====
export async function toggleReaction(noteId: string, userId: string): Promise<{ added: boolean }> {
  const { data: existing } = await supabaseAdmin
    .from('reactions')
    .select('id')
    .eq('note_id', noteId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabaseAdmin.from('reactions').delete().eq('id', existing.id);
    await supabaseAdmin.rpc('decrement_reaction_count', { note_id: noteId });
    return { added: false };
  } else {
    await supabaseAdmin.from('reactions').insert({ note_id: noteId, user_id: userId });
    await supabaseAdmin.rpc('increment_reaction_count', { note_id: noteId });
    return { added: true };
  }
}

export async function isNoteLiked(noteId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('reactions').select('id').eq('note_id', noteId).eq('user_id', userId).single();
  return !!data;
}

// ===== COMMENTS =====
export async function getCommentsByNoteId(noteId: string): Promise<Comment[]> {
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, author:users(id, display_name, avatar_url)')
    .eq('note_id', noteId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as Comment[];
}

export async function createComment(commentData: { note_id: string; author_id: string; content: string }): Promise<Comment | null> {
  const { data, error } = await supabaseAdmin.from('comments').insert(commentData).select().single();
  if (error || !data) return null;
  return data as Comment;
}

// ===== REPOSTS =====
export async function createRepost(originalNoteId: string, reposterId: string, spaceId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('reposts').insert({
    original_note_id: originalNoteId,
    reposter_id: reposterId,
    space_id: spaceId,
  });
  return !error;
}

// ===== NOTIFICATIONS =====
export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*, actor:users(id, display_name, avatar_url), space:spaces(id, name, slug), note:notes(id, title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as Notification[];
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', id);
  return !error;
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  return !error;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count || 0;
}

// ===== FEEDBACK =====
export async function createFeedback(feedbackData: {
  name?: string; email?: string; content: string;
  image_url?: string; is_anonymous?: boolean;
}): Promise<boolean> {
  const { error } = await supabaseAdmin.from('feedback').insert({
    name: feedbackData.name || '',
    email: feedbackData.email || '',
    content: feedbackData.content,
    image_url: feedbackData.image_url || null,
    is_anonymous: feedbackData.is_anonymous ?? true,
  });
  return !error;
}
