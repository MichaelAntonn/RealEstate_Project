export interface Property {
  id?: number;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: string;
  image: string;
  status: 'Available' | 'Under Contract' | 'Sold';
  description?: string;
  created_at?: string;
  user_id?: number;
}