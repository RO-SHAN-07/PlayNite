'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Playlist } from '@/lib/data';
import { ListVideo, Plus, Loader2, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  // Use a placeholder image for the playlist thumbnail for now
  const thumbnailUrl = `https://picsum.photos/seed/${playlist.id}/400/225`;

  return (
    <Link href={`/playlists/${playlist.id}`} className="group">
      <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
        <Image src={thumbnailUrl} alt={playlist.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="playlist cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-xl font-bold text-white line-clamp-2">{playlist.name}</h3>
          <p className="text-sm text-white/80">{playlist.videoCount || 0} videos</p>
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center rounded-r-xl">
            <ListVideo className="w-8 h-8 text-white/70"/>
        </div>
      </div>
    </Link>
  );
}


function CreatePlaylistDialog({ open, onOpenChange, onCreated }: { open: boolean, onOpenChange: (open: boolean) => void, onCreated: () => void }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'You must be logged in.' });
            return;
        }
        if (!name.trim()) {
            toast({ variant: 'destructive', title: 'Playlist name is required.' });
            return;
        }

        setIsCreating(true);
        try {
            const playlistsCollection = collection(firestore, `users/${user.uid}/playlists`);
            await addDoc(playlistsCollection, {
                userId: user.uid,
                name,
                description,
                videoIds: [],
                videoCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            toast({ title: 'Playlist created!', description: `"${name}" has been created.` });
            setName('');
            setDescription('');
            onOpenChange(false);
            onCreated();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create playlist.' });
        } finally {
            setIsCreating(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                    <DialogDescription>Give your new playlist a name and an optional description.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 'My Favorite Tech Talks'" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A collection of the best tech talks..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Playlist
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function PlaylistsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);

  const playlistsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/playlists`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: playlists, isLoading, refresh } = useCollection<Playlist>(playlistsQuery);

  if (isUserLoading || (!user && !isUserLoading)) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
                <ListVideo className="w-10 h-10 text-primary" />
                My Playlists
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                Your curated collections of videos.
                </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Playlist
            </Button>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
              ))
            ) : playlists && playlists.length > 0 ? (
              playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-muted/20 rounded-lg">
                  <Music2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Playlists Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                      Click "Create Playlist" to start your first collection.
                  </p>
                  <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create a Playlist
                  </Button>
              </div>
            )}
          </div>
        </section>
      </div>
      <CreatePlaylistDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onCreated={refresh} />
    </>
  );
}
