'use client';
import { useUser, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Notification } from '@/lib/data';
import { Bell, Loader2, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={notification.from?.photoURL || ''} />
        <AvatarFallback>
            <Bell className="w-5 h-5"/>
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold">{notification.from?.name || 'System'}</span> {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {notification.createdAt ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }) : ''}
        </p>
      </div>
    </div>
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
    return query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  if (isUserLoading || !user) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section>
        <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
          <Bell className="w-10 h-10 text-primary" />
          Notifications
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your recent updates and alerts.
        </p>
      </section>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-muted/20 rounded-lg">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">All Caught Up!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You don't have any new notifications.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
