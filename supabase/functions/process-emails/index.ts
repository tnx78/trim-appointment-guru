
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  console.log("Processing scheduled emails");
  
  try {
    // Get current time
    const now = new Date();
    
    // Fetch emails that need to be sent (send_at <= now and status = 'pending')
    const { data: emailsToSend, error: fetchError } = await supabase
      .from("scheduled_emails")
      .select(`
        id, 
        appointment_id,
        template_name,
        send_at,
        appointments(
          id,
          client_name,
          client_email,
          date,
          start_time,
          end_time,
          service_id,
          status,
          services(name, duration, price)
        ),
        email_templates(subject, body)
      `)
      .eq("status", "pending")
      .lte("send_at", now.toISOString());
      
    if (fetchError) {
      throw new Error(`Error fetching emails: ${fetchError.message}`);
    }
    
    if (!emailsToSend || emailsToSend.length === 0) {
      return new Response(JSON.stringify({ message: "No emails to send" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`Found ${emailsToSend.length} emails to process`);
    
    // Get salon settings
    const { data: settings } = await supabase
      .from("salon_settings")
      .select("name, value");
      
    const salonName = settings?.find(s => s.name === "salon_name")?.value || "Beauty Salon";
    const adminEmail = settings?.find(s => s.name === "admin_email")?.value || "admin@example.com";
    
    // Process each email
    for (const email of emailsToSend) {
      try {
        if (!email.appointments || !email.email_templates) {
          throw new Error(`Missing appointment or template data for email ${email.id}`);
        }
        
        const appointment = email.appointments;
        const template = email.email_templates;
        const service = appointment.services;
        
        // Skip if appointment is cancelled and template is not a cancellation notification
        if (appointment.status === "cancelled" && !email.template_name.includes("cancelled")) {
          console.log(`Skipping ${email.template_name} for cancelled appointment ${appointment.id}`);
          
          // Mark as sent so we don't process it again
          await supabase
            .from("scheduled_emails")
            .update({ status: "skipped", updated_at: new Date().toISOString() })
            .eq("id", email.id);
            
          continue;
        }
        
        // Prepare template variables
        const formattedDate = new Date(appointment.date).toLocaleDateString("en-US", {
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric"
        });
        
        // Format time (assuming HH:MM format)
        function formatTime(timeStr: string) {
          const [hours, minutes] = timeStr.split(":").map(Number);
          const period = hours >= 12 ? "PM" : "AM";
          const hour12 = hours % 12 || 12;
          return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
        }
        
        // Replace template variables
        let htmlContent = template.body
          .replace(/{{client_name}}/g, appointment.client_name)
          .replace(/{{service_name}}/g, service.name)
          .replace(/{{date}}/g, formattedDate)
          .replace(/{{time}}/g, formatTime(appointment.start_time))
          .replace(/{{salon_name}}/g, salonName);
          
        // Add Google Calendar link
        const startDate = new Date(appointment.date);
        const [startHour, startMinute] = appointment.start_time.split(":").map(Number);
        startDate.setHours(startHour, startMinute, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + service.duration);
        
        const calendarEvent = {
          text: "Add to Google Calendar",
          dates: `${startDate.toISOString().replace(/-|:|\.\d+/g, "")}/${endDate.toISOString().replace(/-|:|\.\d+/g, "")}`,
          details: `Your appointment for ${service.name} at ${salonName}`,
          location: "Our Salon",
          name: `${service.name} Appointment`
        };
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.name)}&dates=${calendarEvent.dates}&details=${encodeURIComponent(calendarEvent.details)}&location=${encodeURIComponent(calendarEvent.location)}`;
        
        // Add calendar link to notifications for clients
        if (email.template_name.includes("booking") || email.template_name.includes("confirmed")) {
          htmlContent += `
            <p style="margin-top: 20px;">
              <a href="${calendarUrl}" style="background-color: #4285F4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Add to Google Calendar
              </a>
            </p>
          `;
        }
        
        // Determine recipient based on template
        const recipient = email.template_name.includes("admin") ? adminEmail : appointment.client_email;
        
        // Call our send-email function
        const emailResult = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            to: recipient,
            subject: template.subject,
            html: htmlContent,
            from: `${salonName} <onboarding@resend.dev>`
          })
        });
        
        if (!emailResult.ok) {
          const errorData = await emailResult.json();
          throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
        }
        
        // Update email status to sent
        await supabase
          .from("scheduled_emails")
          .update({ status: "sent", updated_at: new Date().toISOString() })
          .eq("id", email.id);
          
        console.log(`Successfully sent ${email.template_name} for appointment ${appointment.id}`);
        
      } catch (emailError: any) {
        console.error(`Error processing email ${email.id}:`, emailError);
        
        // Mark email as failed
        await supabase
          .from("scheduled_emails")
          .update({ 
            status: "failed", 
            updated_at: new Date().toISOString() 
          })
          .eq("id", email.id);
      }
    }
    
    return new Response(
      JSON.stringify({ message: `Processed ${emailsToSend.length} emails` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error: any) {
    console.error("Error in process-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
