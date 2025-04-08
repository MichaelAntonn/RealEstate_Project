export interface Appointment {
  id: number;
  date: string;
  time: string;
  client: string;
  property: string;
  purpose: string;
  status: 'Scheduled' | 'Confirmed' | 'Pending' | 'Cancelled';
}