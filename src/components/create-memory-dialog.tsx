'use client';

import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { MemoryBankEntry } from '@/lib/data';

interface CreateMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateMemoryDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateMemoryDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<MemoryBankEntry['type']>('note');
  const [priority, setPriority] = useState<MemoryBankEntry['priority']>('medium');
  const [category, setCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return false;
    }
    if (!content.trim()) {
      toast({
        title: "Validation Error",
        description: "Content is required",
        variant: "destructive",
      });
      return false;
    }
    if (title.length > 200) {
      toast({
        title: "Validation Error",
        description: "Title must be less than 200 characters",
        variant: "destructive",
      });
      return false;
    }
    if (content.length > 2000) {
      toast({
        title: "Validation Error",
        description: "Content must be less than 2000 characters",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (!user || !firestore) {
      toast({
        title: "Error",
        description: "You must be logged in to create a memory.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const memoryData: Omit<MemoryBankEntry, 'id'> = {
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
        tags,
        category: category.trim() || undefined,
        isArchived: false,
        isPrivate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        attachments: [],
        metadata: {
          wordCount: content.split(/\s+/).length,
          readingTime: Math.ceil(content.split(/\s+/).length / 200), // ~200 words per minute
        },
      };

      await addDoc(collection(firestore, `users/${user.uid}/memory_entries`), memoryData);

      toast({
        title: "Memory created",
        description: "Your memory has been successfully saved.",
      });

      // Reset form and close dialog
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating memory:', error);
      toast({
        title: "Error",
        description: "Failed to create memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setType('note');
    setPriority('medium');
    setCategory('');
    setIsPrivate(false);
    setTags([]);
    setTagInput('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Memory</DialogTitle>
          <DialogDescription>
            Capture and organize your insights, notes, and learnings in your professional memory bank.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              placeholder="Give your memory a clear, descriptive title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Memory Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as MemoryBankEntry['type'])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">📝 Note</SelectItem>
                  <SelectItem value="insight">💡 Insight</SelectItem>
                  <SelectItem value="learning">📚 Learning</SelectItem>
                  <SelectItem value="reference">🎯 Reference</SelectItem>
                  <SelectItem value="quote">💬 Quote</SelectItem>
                  <SelectItem value="idea">⭐ Idea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as MemoryBankEntry['priority'])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content"
              placeholder="Write your memory content here. Include detailed information, context, and any important details..."
              className="mt-1 min-h-32 resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {content.length}/2000 characters
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category (Optional)</Label>
            <Input 
              id="category"
              placeholder="e.g., Work, Personal, Learning..." 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.includes(tagInput.trim().toLowerCase())}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Tags help you categorize and find your memories later.
            </p>
          </div>

          {/* Privacy */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="private" className="text-sm">
              Keep this memory private
            </Label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <p>💾 Your memory will be saved automatically</p>
              <p>🔒 You can mark it as private to keep it confidential</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Memory'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}