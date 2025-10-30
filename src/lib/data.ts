import type { Timestamp, FieldValue } from "firebase/firestore";

export interface Video {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorId: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: number;
  uploadedAt: Timestamp;
  categoryId: string;
  // Embed-specific properties
  isEmbedded?: boolean;
  embedUrl?: string;
  embedProvider?: 'youtube' | 'vimeo' | 'adult' | 'generic';
  videoKey?: string;
}

export interface UserPreferences {
    language?: string;
    enableNotifications?: boolean;
    autoplayNext?: boolean;
    videoQuality?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  joined?: Timestamp | FieldValue;
  preferences?: UserPreferences;
  watchLater?: string[];
}

export interface MemoryBankEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'note' | 'insight' | 'learning' | 'reference' | 'quote' | 'idea';
  tags: string[];
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  videoId?: string; // Optional link to related video
  memoryBankId?: string; // Reference to parent memory bank if any
  isArchived: boolean;
  isPrivate: boolean;
  attachments?: MemoryAttachment[];
  metadata?: MemoryMetadata;
}

export interface MemoryAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'link' | 'video';
  url: string;
  size?: number;
  mimeType?: string;
}

export interface MemoryMetadata {
  color?: string;
  icon?: string;
  rating?: number; // 1-5 stars
  wordCount?: number;
  readingTime?: number; // in minutes
  source?: string; // where this memory came from
}

export interface MemoryBank {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'personal' | 'professional' | 'learning' | 'creative' | 'project';
  color: string;
  icon: string;
  isDefault: boolean;
  isPrivate: boolean;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  settings: MemoryBankSettings;
}

export interface MemoryBankSettings {
  allowTagging: boolean;
  allowAttachments: boolean;
  autoTagging: boolean;
  enableSearch: boolean;
  enableExport: boolean;
  retentionPeriod?: number; // in days, null for unlimited
}

export interface MemorySearchFilters {
  query?: string;
  type?: MemoryBankEntry['type'][];
  tags?: string[];
  category?: string;
  priority?: MemoryBankEntry['priority'][];
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  hasVideo?: boolean;
  memoryBankId?: string;
  showArchived?: boolean;
  limit?: number;
}

export interface MemoryBankStats {
  totalEntries: number;
  entriesByType: Record<MemoryBankEntry['type'], number>;
  entriesByPriority: Record<MemoryBankEntry['priority'], number>;
  totalTags: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
  recentActivity: Timestamp;
}

export interface Favorite {
  videoId: string;
  addedDate: Timestamp | FieldValue;
}

export interface WatchLater {
    videoId: string;
    addedDate: Timestamp | FieldValue;
}

export interface VideoHistory {
  videoId: string;
  watchDate: Timestamp | FieldValue;
  title: string;
  thumbnailUrl: string;
}

export interface Playlist {
    id: string;
    userId: string;
    name: string;
    description?: string;
    videoIds: string[];
    videoCount: number;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

export interface PlaylistItem {
    id: string;
    playlistId: string;
    videoId: string;
    addedDate: Timestamp | FieldValue;
    order: number;
}


export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  imageHint: string;
}

export interface Comment {
  id: string;
  userId: string;
  videoId: string;
  text: string;
  timestamp: Timestamp;
}

export interface VideoLike {
    type: 'like' | 'dislike';
}

export interface Follower {
    followerId: string;
    followedId: string;
    timestamp: Timestamp | FieldValue;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  from?: {
    name: string;
    photoURL?: string;
  },
  link?: string;
}

export const categories: Category[] = [
  { id: 'action', name: 'Action', imageUrl: 'https://picsum.photos/seed/cat-action/400/225', imageHint: 'action explosion' },
  { id: 'comedy', name: 'Comedy', imageUrl: 'https://picsum.photos/seed/cat-comedy/400/225', imageHint: 'funny laugh' },
  { id: 'sci-fi', name: 'Sci-Fi', imageUrl: 'https://picsum.photos/seed/cat-sci-fi/400/225', imageHint: 'futuristic spaceship' },
  { id: 'documentary', name: 'Documentary', imageUrl: 'https://picsum.photos/seed/cat-documentary/400/225', imageHint: 'historical archive' },
  { id: 'animation', name: 'Animation', imageUrl: 'https://picsum.photos/seed/cat-animation/400/225', imageHint: 'cartoon style' },
  { id: 'horror', name: 'Horror', imageUrl: 'https://picsum.photos/seed/cat-horror/400/225', imageHint: 'scary monster' },
];
