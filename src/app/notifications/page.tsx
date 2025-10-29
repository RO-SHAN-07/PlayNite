'use client';

import { useUser, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { Notification } from '@/lib/data';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Bell, UserPlus, MessageSquare, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const NOTIFICATION_ICONS = {
  new_follower: <UserPlus className="h-6 w-6 text-blue-500" />,
  new_comment: <MessageSquare className="h-6 w-6 text-green-500" />,
  new_video: <Video className="h-6 w-6 text-purple-500" />,
};

function NotificationItem({ notification }: { notification: Notification }) {
  const firestore = useFirestore();

  const handleMarkAsRead = async () => {
    if (!firestore || notification.isRead) return;
    const notifRef = doc(firestore, `users/${notification.userId}/notifications`, notification.id);
    await updateDoc(notifRef, { isRead: true });
  };

  const getLink = () => {
    switch (notification.type) {
      case 'new_follower':
        return `/creator/${notification.relatedId}`;
      case 'new_comment':
      case 'new_video':
        return `/watch/${notification.relatedId}`;
      default:
        return '#';
    }
  };

  return (
    <Link href={getLink()} passHref>
        <div 
            className={cn(
                "flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer",
                !notification.isRead && "bg-primary/5 border-l-4 border-primary"
            )}
            onClick={handleMarkAsRead}
        >
        <div className="bg-muted p-3 rounded-full">
            {NOTIFICATION_ICONS[notification.type as keyof typeof NOTIFICATION_ICONS] || <Bell />}
        </div>
        <div className="flex-1">
            <p className="text-sm text-foreground">{notification.text}</p>
            <p className="text-xs text-muted-foreground mt-1">
            {notification.timestamp ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true }) : ''}
            </p>
        </div>
        {!notification.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary self-center" />}
        </div>
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
    return query(collection(firestore, `users/${user.uid}/notifications`), orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold font-headline">Notifications</h1>
        <p className="text-muted-foreground">Your latest updates and alerts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
              <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
              <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No notifications yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                When you have new notifications, they'll show up here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
