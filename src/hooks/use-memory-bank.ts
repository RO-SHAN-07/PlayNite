'use client';

import { useState, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { useToast } from './use-toast';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

import type { MemoryBank, MemoryBankEntry, MemorySearchFilters } from '@/lib/data';

// Hook for managing memory bank entries
export function useMemoryBankEntries(userId?: string) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const createMemory = useCallback(async (memoryData: Omit<MemoryBankEntry, 'id' | 'userId'>) => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      const memoryWithUser = {
        ...memoryData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, `users/${userId}/memory_entries`), memoryWithUser);
      
      toast({
        title: "Memory created",
        description: "Your memory has been successfully saved.",
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating memory:', error);
      toast({
        title: "Error",
        description: "Failed to create memory. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, firestore, toast]);

  const updateMemory = useCallback(async (memoryId: string, updates: Partial<MemoryBankEntry>) => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      const memoryRef = doc(firestore, `users/${userId}/memory_entries/${memoryId}`);
      await updateDoc(memoryRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Memory updated",
        description: "Your memory has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating memory:', error);
      toast({
        title: "Error",
        description: "Failed to update memory. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, firestore, toast]);

  const deleteMemory = useCallback(async (memoryId: string) => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      const memoryRef = doc(firestore, `users/${userId}/memory_entries/${memoryId}`);
      await deleteDoc(memoryRef);

      toast({
        title: "Memory deleted",
        description: "Your memory has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, firestore, toast]);

  const toggleArchive = useCallback(async (memoryId: string, isArchived: boolean) => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      const memoryRef = doc(firestore, `users/${userId}/memory_entries/${memoryId}`);
      await updateDoc(memoryRef, {
        isArchived,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: isArchived ? "Memory archived" : "Memory restored",
        description: `Your memory has been ${isArchived ? 'archived' : 'restored'}.`,
      });
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast({
        title: "Error",
        description: "Failed to update memory status. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, firestore, toast]);

  return {
    createMemory,
    updateMemory,
    deleteMemory,
    toggleArchive,
  };
}

// Hook for managing memory banks
export function useMemoryBanks(userId?: string) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const createMemoryBank = useCallback(async (bankData: Omit<MemoryBank, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      const bankWithUser = {
        ...bankData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, `users/${userId}/memory_banks`), bankWithUser);
      
      toast({
        title: "Memory bank created",
        description: "Your memory bank has been successfully created.",
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating memory bank:', error);
      toast({
        title: "Error",
        description: "Failed to create memory bank. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, firestore, toast]);

  const updateMemoryBank = useCallback(async (bankId: string, updates: Partial<MemoryBank>) => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      const bankRef = doc(firestore, `users/${userId}/memory_banks/${bankId}`);
      await updateDoc(bankRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Memory bank updated",
        description: "Your memory bank has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating memory bank:', error);
      toast({
        title: "Error",
        description: "Failed to update memory bank. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, firestore, toast]);

  const deleteMemoryBank = useCallback(async (bankId: string) => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      const bankRef = doc(firestore, `users/${userId}/memory_banks/${bankId}`);
      await deleteDoc(bankRef);

      toast({
        title: "Memory bank deleted",
        description: "Your memory bank has been permanently deleted.",
      });
    } catch (error) {
      console.error('Error deleting memory bank:', error);
      toast({
        title: "Error",
        description: "Failed to delete memory bank. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [userId, firestore, toast]);

  return {
    createMemoryBank,
    updateMemoryBank,
    deleteMemoryBank,
  };
}

// Hook for searching memory bank entries
export function useMemorySearch(userId?: string) {
  const firestore = useFirestore();
  const [isSearching, setIsSearching] = useState(false);

  const searchMemories = useCallback(async (filters: MemorySearchFilters) => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    setIsSearching(true);
    try {
      let q = query(
        collection(firestore, `users/${userId}/memory_entries`),
        where('userId', '==', userId)
      );

      // Add type filter
      if (filters.type && filters.type.length > 0) {
        q = query(q, where('type', 'in', filters.type));
      }

      // Add priority filter
      if (filters.priority && filters.priority.length > 0) {
        q = query(q, where('priority', 'in', filters.priority));
      }

      // Add archived filter (exclude archived by default)
      if (!filters.showArchived) {
        q = query(q, where('isArchived', '==', false));
      }

      // Add date range filter
      if (filters.dateRange) {
        q = query(q, where('createdAt', '>=', filters.dateRange.start));
        q = query(q, where('createdAt', '<=', filters.dateRange.end));
      }

      // Add memory bank filter
      if (filters.memoryBankId) {
        q = query(q, where('memoryBankId', '==', filters.memoryBankId));
      }

      // Add ordering
      q = query(q, orderBy('createdAt', 'desc'));

      // Add limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const memories: MemoryBankEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        memories.push({ id: doc.id, ...doc.data() } as MemoryBankEntry);
      });

      // Client-side filtering for complex search (tags, category, query)
      let filteredMemories = memories;

      // Filter by query (title and content)
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredMemories = filteredMemories.filter(memory => 
          memory.title.toLowerCase().includes(query) ||
          memory.content.toLowerCase().includes(query) ||
          memory.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        filteredMemories = filteredMemories.filter(memory =>
          filters.tags!.some(tag => memory.tags.includes(tag))
        );
      }

      // Filter by category
      if (filters.category) {
        filteredMemories = filteredMemories.filter(memory =>
          memory.category?.toLowerCase() === filters.category!.toLowerCase()
        );
      }

      // Filter by video link
      if (filters.hasVideo) {
        filteredMemories = filteredMemories.filter(memory => memory.videoId);
      }

      return filteredMemories;
    } catch (error) {
      console.error('Error searching memories:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, [userId, firestore]);

  const searchTags = useCallback(async () => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      const q = query(
        collection(firestore, `users/${userId}/memory_entries`),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const tagCounts = new Map<string, number>();

      querySnapshot.forEach((doc) => {
        const data = doc.data() as MemoryBankEntry;
        data.tags.forEach(tag => {
          const count = tagCounts.get(tag) || 0;
          tagCounts.set(tag, count + 1);
        });
      });

      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error searching tags:', error);
      throw error;
    }
  }, [userId, firestore]);

  return {
    searchMemories,
    searchTags,
    isSearching,
  };
}

// Hook for memory bank analytics
export function useMemoryAnalytics(userId?: string) {
  const firestore = useFirestore();

  const getMemoryStats = useCallback(async () => {
    if (!userId || !firestore) {
      throw new Error('User not authenticated or Firestore not available');
    }

    try {
      // Get all memory entries
      const memoriesQuery = query(
        collection(firestore, `users/${userId}/memory_entries`),
        where('userId', '==', userId)
      );

      const memoriesSnapshot = await getDocs(memoriesQuery);
      const memories: MemoryBankEntry[] = [];
      
      memoriesSnapshot.forEach((doc) => {
        memories.push({ id: doc.id, ...doc.data() } as MemoryBankEntry);
      });

      // Get all memory banks
      const banksQuery = query(
        collection(firestore, `users/${userId}/memory_banks`),
        where('userId', '==', userId)
      );

      const banksSnapshot = await getDocs(banksQuery);
      const banks: MemoryBank[] = [];
      
      banksSnapshot.forEach((doc) => {
        banks.push({ id: doc.id, ...doc.data() } as MemoryBank);
      });

      // Calculate statistics
      const stats = {
        totalMemories: memories.length,
        totalBanks: banks.length,
        memoriesByType: {} as Record<string, number>,
        memoriesByPriority: {} as Record<string, number>,
        memoriesByMonth: {} as Record<string, number>,
        topTags: [] as Array<{ tag: string; count: number }>,
        recentMemories: memories
          .filter(m => !m.isArchived)
          .sort((a, b) => {
            const aDate = a.createdAt && typeof a.createdAt === 'object' && 'toDate' in a.createdAt 
              ? a.createdAt.toDate().getTime() 
              : new Date(a.createdAt as any).getTime();
            const bDate = b.createdAt && typeof b.createdAt === 'object' && 'toDate' in b.createdAt 
              ? b.createdAt.toDate().getTime() 
              : new Date(b.createdAt as any).getTime();
            return bDate - aDate;
          })
          .slice(0, 5),
        archivedCount: memories.filter(m => m.isArchived).length,
        privateCount: memories.filter(m => m.isPrivate).length,
        averageWordsPerMemory: memories.length > 0 
          ? Math.round(memories.reduce((sum, memory) => {
              return sum + (memory.metadata?.wordCount || memory.content.split(/\s+/).length);
            }, 0) / memories.length)
          : 0,
      };

      // Group memories by type
      memories.forEach(memory => {
        stats.memoriesByType[memory.type] = (stats.memoriesByType[memory.type] || 0) + 1;
        stats.memoriesByPriority[memory.priority] = (stats.memoriesByPriority[memory.priority] || 0) + 1;

        // Group by month
        const date = memory.createdAt && typeof memory.createdAt === 'object' && 'toDate' in memory.createdAt 
          ? memory.createdAt.toDate() 
          : new Date(memory.createdAt as any);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats.memoriesByMonth[monthKey] = (stats.memoriesByMonth[monthKey] || 0) + 1;
      });

      // Calculate top tags
      const tagCounts = new Map<string, number>();
      memories.forEach(memory => {
        memory.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      stats.topTags = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return stats;
    } catch (error) {
      console.error('Error getting memory stats:', error);
      throw error;
    }
  }, [userId, firestore]);

  return {
    getMemoryStats,
  };
}