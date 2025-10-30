'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  Archive, 
  Star, 
  Tag, 
  Calendar,
  Loader2,
  BookOpen,
  Lightbulb,
  Quote,
  FileText,
  Target,
  Grid3X3,
  List
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MemoryCard } from '@/components/memory-card';
import { MemoryBankHeader } from '@/components/memory-bank-header';
import { CreateMemoryDialog } from '@/components/create-memory-dialog';
import { MemoryFilters } from '@/components/memory-filters';

import type { MemoryBank, MemoryBankEntry } from '@/lib/data';

function MemoryBankSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-muted/20 rounded-lg">
      <Brain className="mx-auto h-16 w-16 text-muted-foreground" />
      <h3 className="mt-4 text-xl font-semibold">No Memory Entries Yet</h3>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        Start building your professional memory bank by adding your first memory entry. 
        Capture insights, notes, and important information.
      </p>
    </div>
  );
}

export default function MemoryBankPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);

  // Query memory bank entries
  const memoryEntriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    let q = query(
      collection(firestore, `users/${user.uid}/memory_entries`),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return q;
  }, [user, firestore]);

  const { data: memoryEntries, loading: entriesLoading } = useCollection<MemoryBankEntry>(memoryEntriesQuery);

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    if (!memoryEntries) return [];
    
    return memoryEntries.filter(entry => {
      const matchesSearch = !searchQuery || 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'all' || entry.type === selectedType;
      const matchesPriority = selectedPriority === 'all' || entry.priority === selectedPriority;
      
      return matchesSearch && matchesType && matchesPriority && !entry.isArchived;
    });
  }, [memoryEntries, searchQuery, selectedType, selectedPriority]);

  // Group entries by type
  const entriesByType = useMemo(() => {
    const groups = {
      note: filteredEntries.filter(e => e.type === 'note'),
      insight: filteredEntries.filter(e => e.type === 'insight'),
      learning: filteredEntries.filter(e => e.type === 'learning'),
      reference: filteredEntries.filter(e => e.type === 'reference'),
      quote: filteredEntries.filter(e => e.type === 'quote'),
      idea: filteredEntries.filter(e => e.type === 'idea'),
    };
    return groups;
  }, [filteredEntries]);

  const typeIcons = {
    note: FileText,
    insight: Lightbulb,
    learning: BookOpen,
    reference: Target,
    quote: Quote,
    idea: Star,
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const isLoading = entriesLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <MemoryBankHeader />
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Memory
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <MemoryFilters
          selectedType={selectedType}
          selectedPriority={selectedPriority}
          onTypeChange={setSelectedType}
          onPriorityChange={setSelectedPriority}
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Object.entries(entriesByType).map(([type, entries]) => {
          const IconComponent = typeIcons[type as keyof typeof typeIcons];
          return (
            <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedType(selectedType === type ? 'all' : type)}>
              <CardContent className="p-4 text-center">
                <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{entries.length}</div>
                <div className="text-sm text-muted-foreground capitalize">{type}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <MemoryBankSkeleton />
        ) : filteredEntries.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredEntries.map((entry) => (
              <MemoryCard
                key={entry.id}
                entry={entry}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Create Memory Dialog */}
      <CreateMemoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}