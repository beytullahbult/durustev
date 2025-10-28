// src/types/review.ts
export type Review = {
  id: string;
  addressId: string;
  address?: { display?: string; city?: string; district?: string };
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
};
