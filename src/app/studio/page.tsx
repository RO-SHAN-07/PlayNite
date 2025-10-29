'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import type { Video } from '@/lib/data';
import { MoreHorizontal, PlusCircle, VideoIcon, Database } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { seedDatabase } from '@/lib/seed';
import { toast } from '@/hooks/use-toast';

export default function StudioPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSeeding, setIsSeeding] = useState(false);

  const userVideosQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'videos'), where('creatorId', '==', user.uid));
  }, [user, firestore]);

  const { data: userVideos, loading, refresh } = useCollection<Video>(userVideosQuery);

  const handleSeed = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    try {
        await seedDatabase(firestore);
        toast({
            title: "Database Seeded!",
            description: "20 sample videos have been added to your database."
        });
        refresh(); // Refresh the video list
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Seeding Failed",
            description: error.message || "Could not seed the database."
        });
    } finally {
        setIsSeeding(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline">Creator Studio</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your content and grow your channel.
          </p>
        </div>
        <Button asChild>
          <Link href="/studio/upload">
            <PlusCircle className="mr-2" />
            Upload Video
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Videos</CardTitle>
          <CardDescription>A list of videos you have uploaded.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] hidden sm:table-cell">Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="hidden sm:table-cell">
                            <Skeleton className="w-16 h-9 rounded-md" />
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))
              ) : userVideos && userVideos.length > 0 ? (
                 userVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="hidden sm:table-cell">
                       <img src={video.thumbnailUrl} alt={video.title} className="w-16 h-9 object-cover rounded-md bg-muted" />
                    </TableCell>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>{Intl.NumberFormat('en-US').format(video.views)}</TableCell>
                    <TableCell>{video.uploadedAt.toDate().toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                       <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                       <h3 className="mt-4 text-lg font-semibold">No videos uploaded</h3>
                       <p className="mt-2 text-sm text-muted-foreground">Start by uploading your first video or add sample data.</p>
                       <div className="flex gap-4 justify-center mt-4">
                         <Button asChild>
                            <Link href="/studio/upload">
                              <PlusCircle className="mr-2" />
                              Upload Video
                            </Link>
                          </Button>
                          <Button variant="secondary" onClick={handleSeed} disabled={isSeeding}>
                              <Database className="mr-2" />
                              {isSeeding ? 'Seeding...' : 'Seed Sample Videos'}
                          </Button>
                       </div>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
