
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

// Fixed date handling to prevent timezone issues
export const mapAppointmentFromDB = (dbAppointment: any): Appointment => {
  // Get the date string from the database
  const dateStr = dbAppointment.date;
  let date;
  
  // Create date object directly from components to avoid timezone issues
  if (dateStr && typeof dateStr === 'string') {
    // Split the date string and create a Date that preserves the day
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Create a date directly with year, month, day components in local timezone
    date = new Date(year, month - 1, day);
    
    console.log('DB Date mapping:', {
      original: dateStr,
      parsed: date,
      year, month, day,
      formatted: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
    });
  } else {
    date = new Date();
    console.error('Invalid date format in appointment:', dbAppointment);
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

// Fixed date handling when saving to database
export const mapAppointmentToDB = (appointment: Omit<Appointment, 'id' | 'status'> & { status?: string }): any => {
  let formattedDate;
  
  if (appointment.date instanceof Date) {
    // Format date in YYYY-MM-DD format directly from date components
    // to avoid timezone issues
    const year = appointment.date.getFullYear();
    const month = String(appointment.date.getMonth() + 1).padStart(2, '0');
    const day = String(appointment.date.getDate()).padStart(2, '0');
    formattedDate = `${year}-${month}-${day}`;
    
    console.log('Date being sent to DB:', {
      jsDate: appointment.date,
      year, month, day,
      formatted: formattedDate
    });
  } else {
    formattedDate = appointment.date;
    console.log('Using non-Date object for appointment date:', formattedDate);
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
