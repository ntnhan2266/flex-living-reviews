export interface HostawayReview {
  id: number;
  type: string;
  status: string;
  rating: number | null;
  publicReview: string;
  reviewCategory: {
    category: string;
    rating: number;
  }[];
  submittedAt: string;
  guestName: string;
  listingName: string;
}

export type Channel = 'hostaway' | 'airbnb' | 'booking' | 'google';
export type ReviewStatus =
  | 'awaiting'
  | 'pending'
  | 'scheduled'
  | 'submitted'
  | 'published'
  | 'expired'
  | 'approved'
  | 'public';

export interface NormalizedReview {
  id: string;
  propertyName: string;
  guestName: string;
  rating: number;
  comment: string;
  date: Date;
  channel: Channel;
  categories: Record<string, number | undefined>;
  status: ReviewStatus;
}

export interface PropertyStats {
  id: string;
  name: string;
  averageRating: number;
  totalReviews: number;
  approvedReviews: number;
  recentTrend: 'up' | 'down' | 'stable';
}

export type CategoryKey =
  | 'cleanliness'
  | 'communication'
  | 'location'
  | 'accuracy'
  | 'checkin'
  | 'value';

export type SortKey = 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc';

export type Filters = {
  property: string;
  channel: '' | 'hostaway' | 'airbnb' | 'booking' | 'google';
  rating: '' | '1' | '2' | '3' | '4' | '5';
  startDate: string; // yyyy-mm-dd
  endDate: string;   // yyyy-mm-dd
  status: 'all' | 'pending' | 'approved';
  category?: '' | CategoryKey;
  minCategory?: '' | '1' | '2' | '3' | '4' | '5';
  sort?: SortKey;
};

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  total?: number;
}
