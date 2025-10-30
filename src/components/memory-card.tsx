'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Brain, 
  Calendar, 
  Tag, 
  Star, 
  Archive, 
  Edit3, 
  Trash2, 
  ExternalLink,
  FileText,
  Lightbulb,
  BookOpen,
  Target,
  Quote,
  MoreHorizontal,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';

import type { MemoryBankEntry } from '@/lib/data';

interface MemoryCardProps {
  entry: MemoryBankEntry;
  viewMode: 'grid' | 'list';
  onEdit?: (entry: MemoryBankEntry) => void;
}

const typeIcons = {
  note: FileText,
  insight: Lightbulb,
  learning: BookOpen,
  reference: Target,
  quote: Quote,
  idea: Star,
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export function MemoryCard({ entry, viewMode, onEdit }: MemoryCardProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const IconComponent = typeIcons[entry.type];

  const handleArchive = async () => {
    if (!firestore) return;
    
    try {
      const entryRef = doc(firestore, `users/${entry.userId}/memory_entries/${entry.id}`);
      await updateDoc(entryRef, { 
        isArchived: !entry.isArchived,
        updatedAt: new Date()
      });
      
      toast({
        title: entry.isArchived ? "Memory restored" : "Memory archived",
        description: entry.isArchived ? "Your memory has been restored." : "Your memory has been archived.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update memory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!firestore) return;
    
    setIsDeleting(true);
    try {
      const entryRef = doc(firestore, `users/${entry.userId}/memory_entries/${entry.id}`);
      await deleteDoc(entryRef);
      
      toast({
        title: "Memory deleted",
        description: "Your memory has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  if (viewMode === 'list') {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconComponent className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg truncate">{entry.title}</h3>
                  {entry.isPrivate && <Lock className="w-4 h-4 text-muted-foreground" />}
                  {entry.videoId && (
                    <Link href={`/watch/${entry.videoId}`}>
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {truncateContent(entry.content, 200)}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(entry.createdAt)}
                  </div>
                  
                  {entry.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>{entry.tags.length} tags</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={priorityColors[entry.priority]}>
                {entry.priority}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(entry)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="w-4 h-4 mr-2" />
                    {entry.isArchived ? 'Restore' : 'Archive'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
        
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Memory</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this memory? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground capitalize">{entry.type}</span>
            {entry.isPrivate && <Lock className="w-4 h-4 text-muted-foreground" />}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(entry)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="w-4 h-4 mr-2" />
                {entry.isArchived ? 'Restore' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardTitle className="text-lg leading-tight">
          {entry.title}
          {entry.videoId && (
            <Link href={`/watch/${entry.videoId}`}>
              <ExternalLink className="inline-block w-4 h-4 ml-2 text-muted-foreground hover:text-primary" />
            </Link>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {truncateContent(entry.content, 150)}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(entry.createdAt)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className={priorityColors[entry.priority]}>
            {entry.priority}
          </Badge>
          
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {entry.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{entry.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this memory? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}