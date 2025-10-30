'use client';

import { Brain, BookOpen, BarChart3, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where } from 'firebase/firestore';
import type { MemoryBank, MemoryBankEntry } from '@/lib/data';

export function MemoryBankHeader() {
  const { user } = useUser();
  const firestore = user ? useFirestore() : null;

  // Query for memory banks
  const memoryBanksQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/memory_banks`), where('userId', '==', user.uid));
  }, [user, firestore]);

  // Query for memory entries
  const memoryEntriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/memory_entries`), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: memoryBanks } = useCollection<MemoryBank>(memoryBanksQuery);
  const { data: memoryEntries } = useCollection<MemoryBankEntry>(memoryEntriesQuery);

  const stats = {
    totalBanks: memoryBanks?.length || 0,
    totalEntries: memoryEntries?.length || 0,
    recentEntries: memoryEntries?.filter(entry => {
      try {
        const entryDate = entry.createdAt && typeof entry.createdAt === 'object' && 'toDate' in entry.createdAt
          ? entry.createdAt.toDate()
          : new Date(entry.createdAt as any);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate > weekAgo;
      } catch {
        return false;
      }
    }).length || 0,
    archivedEntries: memoryEntries?.filter(entry => entry.isArchived).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-headline flex items-center gap-3">
            <Brain className="w-10 h-10 text-primary" />
            Memory Bank
          </h1>
          <p className="text-lg text-muted-foreground">
            Your professional memory repository for insights, notes, and learnings.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalBanks}</div>
                <div className="text-sm text-muted-foreground">Memory Banks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalEntries}</div>
                <div className="text-sm text-muted-foreground">Total Memories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.recentEntries}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.archivedEntries}</div>
                <div className="text-sm text-muted-foreground">Archived</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Banks Preview */}
      {memoryBanks && memoryBanks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Memory Banks</CardTitle>
            <CardDescription>
              Organize your memories into different categories and contexts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {memoryBanks.slice(0, 6).map((bank) => (
                <Badge key={bank.id} variant="secondary" className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: bank.color }}
                  />
                  {bank.name}
                </Badge>
              ))}
              {memoryBanks.length > 6 && (
                <Badge variant="outline">
                  +{memoryBanks.length - 6} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}