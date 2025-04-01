export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  order?: number; // Adding order property for drag and drop
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  image?: string; // URL to the image
  order?: number; // Adding order property for drag and drop
}

export interface Appointment {
  id: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}
