'use client';
import { useUser, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { Bell, Loader2, MessageSquare, Video } from 'lucide-react';
import { useEffect } from 'react';
import type { Notification } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const notificationIcons: { [key: string]: React.ElementType } = {
  new_video: Video,
  comment: MessageSquare,
  default: Bell,
};

function NotificationItem({ notification }: { notification: Notification }) {
  const Icon = notificationIcons[notification.type] || notificationIcons.default;
  const timestamp = notification.timestamp ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true }) : 'just now';

  return (
    <Link href={notification.link || '#'}>
        <Card className={cn("hover:bg-muted/50 transition-colors", !notification.isRead && "bg-primary/10 border-primary/40")}>
            <CardContent className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
                </div>
                {!notification.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1" />}
            </CardContent>
        </Card>
    </Link>
  );
}

export default function NotificationsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Query the subcollection under the user's document
    return query(collection(firestore, `users/${user.uid}/notifications`), orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  if (isUserLoading || (!user && !isUserLoading)) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section>
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <Bell className="w-10 h-10 text-primary" />
          Notifications
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your latest updates and alerts.
        </p>
      </section>
      
      <section className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-muted/20 rounded-lg">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Notifications Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll let you know when something new happens.
            </p>
            <Button asChild className="mt-4">
                <Link href="/">Explore Videos</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
