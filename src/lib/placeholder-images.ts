// This file is no longer needed as we are fetching image URLs from Firestore
// or using hardcoded URLs for categories. It can be removed.
// We will keep it for now to avoid breaking imports that haven't been updated yet.
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = [];
