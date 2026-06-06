import { getSpaces } from '@/lib/dal';
import { SpaceCard } from '@/components/space-card';
import { MenuClient } from '@/components/menu-client';
import { Pin, Sparkles } from 'lucide-react';

export default async function MenuPage() {
  const spaces = await getSpaces();
  const pinned = spaces.filter(s => s.is_pinned);
  const regular = spaces.filter(s => !s.is_pinned);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 font-serif">Welcome to Diary Dump</h1>
          <p className="text-muted-foreground">Discover spaces where people share their thoughts, or create your own wall.</p>
        </div>
        <MenuClient />
        {pinned.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Pinned Spaces</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {pinned.map((s, i) => <SpaceCard key={s.id} space={s} index={i} />)}
            </div>
          </section>
        )}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">All Spaces ({spaces.length})</h2>
          </div>
          {spaces.length === 0 ? (
            <div className="text-center py-16 rounded-xl border-2 border-dashed border-border">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-foreground mb-2">No spaces yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Be the first to create a diary space and start pinning your thoughts!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {regular.map((s, i) => <SpaceCard key={s.id} space={s} index={i + pinned.length} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
