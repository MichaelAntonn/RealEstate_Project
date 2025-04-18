// src/app/models/property
export interface PropertyMedia {
  id: number;
  PropertyID: number;
  MediaURL: string;
  MediaType: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  price: string;
  commission: string | null;
  city: string;
  district: string;
  full_address: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  listing_type: string;
  construction_status: string;
  approval_status: string;
  transaction_status: string;
  building_year: string;
  legal_status: string;
  furnished: boolean;
  amenities: object;
  payment_options: object;
  cover_image: string;
  property_code: string;
  media?: PropertyMedia[];
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyApiResponse {
  data: Property[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

export interface PropertySearchResponse {
  data: Property[];
  pagination: Pagination;
}

export interface PropertySearchErrorResponse {
  status: 'error';
  message: string;
  data?: never; // or data: [];
  pagination?: Pagination;
}

export type PropertySearchApiResponse =
  | PropertySearchResponse
  | PropertySearchErrorResponse;

export interface PropertyFilters {
  [x: string]: string | number | boolean | undefined;
  keyword: string;
  type: string;
  city: string;
  listing_type: 'for_sale' | 'for_rent' | undefined;
  page: number;
  is_new_building?: boolean;
}
