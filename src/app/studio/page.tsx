import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { videos } from '@/lib/data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudioPage() {
  const userVideos = videos.slice(0, 8); // Mock data for user's videos

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
              {userVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="hidden sm:table-cell">
                    <div className="w-16 h-9 bg-muted rounded-md" />
                  </TableCell>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>{Intl.NumberFormat('en-US').format(video.views)}</TableCell>
                  <TableCell>{new Date(video.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
