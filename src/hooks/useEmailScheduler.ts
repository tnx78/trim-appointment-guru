
import { addDays, addHours } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';

export async function scheduleEmailsForAppointment(appointmentId: string, appointment: Omit<Appointment, 'id' | 'status'>) {
  try {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    
    // Schedule emails
    const emailSchedules = [
      {
        template_name: 'booking_confirmation',
        send_at: now,  // immediate
      },
      {
        template_name: 'admin_notification',
        send_at: now,  // immediate
      },
      {
        template_name: 'appointment_reminder_day',
        send_at: addDays(appointmentDate, -1), // 1 day before
      },
      {
        template_name: 'appointment_reminder_hours',
        send_at: addHours(
          new Date(
            appointmentDate.getFullYear(),
            appointmentDate.getMonth(),
            appointmentDate.getDate(),
            parseInt(appointment.startTime.split(':')[0]),
            parseInt(appointment.startTime.split(':')[1] || '0')
          ),
          -2 // 2 hours before appointment
        ),
      }
    ];
    
    // Create scheduled emails table entry for each email
    for (const schedule of emailSchedules) {
      await supabase
        .from('scheduled_emails')
        .insert({
          appointment_id: appointmentId,
          template_name: schedule.template_name,
          send_at: schedule.send_at.toISOString(),
        });
    }
    
    // Trigger immediate processing of emails
    await triggerEmailProcessing();
  } catch (error) {
    console.error('Error in scheduleEmailsForAppointment:', error);
  }
}

export async function triggerEmailProcessing() {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    await fetch(`${supabaseUrl}/functions/v1/process-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ process: 'immediate' })
    });
  } catch (err) {
    console.error('Error triggering email processing:', err);
  }
}
