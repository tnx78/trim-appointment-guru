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

// Preserve the original date when mapping from DB without timezone conversion
export const mapAppointmentFromDB = (dbAppointment: any): Appointment => {
  // Create a date from the date string but keep it as the date that was selected
  // This preserves the chosen date regardless of timezone
  const dateStr = dbAppointment.date;
  let date = new Date(dateStr);
  
  // Ensure we're using the date as it appears in the database without timezone adjustment
  if (dateStr && typeof dateStr === 'string') {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Create date object with the exact year, month, day from the database
    // Month is 0-based in JavaScript Date
    date = new Date(year, month - 1, day);
  }

  return {
    id: dbAppointment.id,
    serviceId: dbAppointment.service_id,
    clientName: dbAppointment.client_name,
    clientEmail: dbAppointment.client_email,
    clientPhone: dbAppointment.client_phone,
    date: date,
    startTime: dbAppointment.start_time,
    endTime: dbAppointment.end_time,
    status: dbAppointment.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'
  };
};

// Convert camelCase object to snake_case for database and handle date properly
export const mapAppointmentToDB = (appointment: Omit<Appointment, 'id' | 'status'> & { status?: string }): any => {
  // Format the date consistently for the database to prevent timezone issues
  let formattedDate;
  
  if (appointment.date instanceof Date) {
    // Format as YYYY-MM-DD to preserve the selected date
    const year = appointment.date.getFullYear();
    const month = String(appointment.date.getMonth() + 1).padStart(2, '0');
    const day = String(appointment.date.getDate()).padStart(2, '0');
    formattedDate = `${year}-${month}-${day}`;
  } else {
    formattedDate = appointment.date;
  }

  return {
    service_id: appointment.serviceId,
    client_name: appointment.clientName,
    client_email: appointment.clientEmail,
    client_phone: appointment.clientPhone,
    date: formattedDate,
    start_time: appointment.startTime,
    end_time: appointment.endTime,
    status: appointment.status || 'confirmed'
  };
};
