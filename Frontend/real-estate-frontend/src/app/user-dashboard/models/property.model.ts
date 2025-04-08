export interface Property {
  id: number;
  title: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: string;
  image: string;
  status: 'Available' | 'Under Contract' | 'Sold';
  added: string;
}