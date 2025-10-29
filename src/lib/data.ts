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
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  joined?: Timestamp | FieldValue;
}

export interface Favorite {
  videoId: string;
  addedDate: Timestamp | FieldValue;
}

export interface VideoHistory {
  videoId: string;
  watchDate: Timestamp | FieldValue;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  imageHint: string;
}

export const categories: Category[] = [
  { id: 'action', name: 'Action', imageUrl: 'https://picsum.photos/seed/cat-action/400/225', imageHint: 'action explosion' },
  { id: 'comedy', name: 'Comedy', imageUrl: 'https://picsum.photos/seed/cat-comedy/400/225', imageHint: 'funny laugh' },
  { id: 'sci-fi', name: 'Sci-Fi', imageUrl: 'https://picsum.photos/seed/cat-sci-fi/400/225', imageHint: 'futuristic spaceship' },
  { id: 'documentary', name: 'Documentary', imageUrl: 'https://picsum.photos/seed/cat-documentary/400/225', imageHint: 'historical archive' },
  { id: 'animation', name: 'Animation', imageUrl: 'https://picsum.photos/seed/cat-animation/400/225', imageHint: 'cartoon style' },
  { id: 'horror', name: 'Horror', imageUrl: 'https://picsum.photos/seed/cat-horror/400/225', imageHint: 'scary monster' },
];
