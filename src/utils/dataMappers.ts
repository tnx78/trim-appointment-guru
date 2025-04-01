
import { Service, ServiceCategory, Appointment } from '@/types';

// Helper functions to convert between snake_case and camelCase
export const toCamelCase = (str: string): string => {
  return str.replace(/(_\w)/g, (m) => m[1].toUpperCase());
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
};

// Convert snake_case database record to camelCase object
export const mapServiceFromDB = (dbService: any): Service => {
  return {
    id: dbService.id,
    categoryId: dbService.category_id,
    name: dbService.name,
    description: dbService.description,
    duration: dbService.duration,
    price: dbService.price,
    image: dbService.image,
    order: dbService.order
  };
};

// Convert camelCase object to snake_case for database
export const mapServiceToDB = (service: Omit<Service, 'id'>): any => {
  return {
    category_id: service.categoryId,
    name: service.name,
    description: service.description,
    duration: service.duration,
    price: service.price,
    image: service.image,
    order: service.order
  };
};

// Convert snake_case database record to camelCase object
export const mapCategoryFromDB = (dbCategory: any): ServiceCategory => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description,
    order: dbCategory.order
  };
};

// Convert snake_case database record to camelCase object
export const mapAppointmentFromDB = (dbAppointment: any): Appointment => {
  return {
    id: dbAppointment.id,
    serviceId: dbAppointment.service_id,
    clientName: dbAppointment.client_name,
    clientEmail: dbAppointment.client_email,
    clientPhone: dbAppointment.client_phone,
    date: new Date(dbAppointment.date),
    startTime: dbAppointment.start_time,
    endTime: dbAppointment.end_time,
    status: dbAppointment.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'
  };
};

// Convert camelCase object to snake_case for database
export const mapAppointmentToDB = (appointment: Omit<Appointment, 'id' | 'status'> & { status?: string }): any => {
  return {
    service_id: appointment.serviceId,
    client_name: appointment.clientName,
    client_email: appointment.clientEmail,
    client_phone: appointment.clientPhone,
    date: appointment.date instanceof Date ? appointment.date.toISOString().split('T')[0] : appointment.date,
    start_time: appointment.startTime,
    end_time: appointment.endTime,
    status: appointment.status || 'confirmed'
  };
};
