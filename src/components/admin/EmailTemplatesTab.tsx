
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { TemplateSelector } from '@/components/admin/email/TemplateSelector';
import { TemplateEditor } from '@/components/admin/email/TemplateEditor';
import { EmailSettings } from '@/components/admin/email/EmailSettings';
import { EmailTemplate, SalonSetting } from '@/components/admin/email/types';

export function EmailTemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [salonName, setSalonName] = useState('');
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  
  // Load email templates
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching email templates:', error);
        toast.error('Failed to load email templates');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTemplates();
  }, []);
  
  // Load salon settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsSettingsLoading(true);
        const { data, error } = await supabase
          .from('salon_settings')
          .select('*');
          
        if (error) throw error;
        
        const adminEmailSetting = data?.find(s => s.name === 'admin_email');
        const salonNameSetting = data?.find(s => s.name === 'salon_name');
        
        if (adminEmailSetting) setAdminEmail(adminEmailSetting.value);
        if (salonNameSetting) setSalonName(salonNameSetting.value);
      } catch (error) {
        console.error('Error fetching salon settings:', error);
        toast.error('Failed to load salon settings');
      } finally {
        setIsSettingsLoading(false);
      }
    }
    
    fetchSettings();
  }, []);
  
  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
    setIsEditing(false);
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject,
          body,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id);
        
      if (error) throw error;
      
      // Update local state
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, subject, body, updated_at: new Date().toISOString() } 
          : t
      ));
      
      setIsEditing(false);
      toast.success('Email template updated successfully');
    } catch (error) {
      console.error('Error updating email template:', error);
      toast.error('Failed to update email template');
    }
  };
  
  const handleCancelEdit = () => {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject);
      setBody(selectedTemplate.body);
    }
    setIsEditing(false);
  };
  
  const updateSalonSettings = async () => {
    try {
      setIsUpdatingSettings(true);
      
      // Update admin email
      const { error: adminEmailError } = await supabase
        .from('salon_settings')
        .update({ value: adminEmail, updated_at: new Date().toISOString() })
        .eq('name', 'admin_email');
        
      if (adminEmailError) throw adminEmailError;
      
      // Update salon name
      const { error: salonNameError } = await supabase
        .from('salon_settings')
        .update({ value: salonName, updated_at: new Date().toISOString() })
        .eq('name', 'salon_name');
        
      if (salonNameError) throw salonNameError;
      
      toast.success('Salon settings updated successfully');
    } catch (error) {
      console.error('Error updating salon settings:', error);
      toast.error('Failed to update salon settings');
    } finally {
      setIsUpdatingSettings(false);
    }
  };
  
  const triggerEmailProcessing = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ process: 'manual' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }
      
      toast.success('Email processing triggered successfully');
    } catch (error) {
      console.error('Error triggering email processing:', error);
      toast.error('Failed to trigger email processing');
    }
  };

  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="templates">Email Templates</TabsTrigger>
        <TabsTrigger value="settings">Email Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="templates" className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <TemplateSelector 
              templates={templates}
              loading={loading}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleTemplateSelect}
            />
          </div>
          
          <div className="md:col-span-2">
            <TemplateEditor
              selectedTemplate={selectedTemplate}
              isEditing={isEditing}
              subject={subject}
              body={body}
              onSubjectChange={setSubject}
              onBodyChange={setBody}
              onEditClick={handleEditClick}
              onSaveTemplate={handleSaveTemplate}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="settings" className="pt-6">
        <EmailSettings
          isSettingsLoading={isSettingsLoading}
          adminEmail={adminEmail}
          salonName={salonName}
          isUpdatingSettings={isUpdatingSettings}
          onAdminEmailChange={setAdminEmail}
          onSalonNameChange={setSalonName}
          onSaveSettings={updateSalonSettings}
          onTriggerEmailProcessing={triggerEmailProcessing}
        />
      </TabsContent>
    </Tabs>
  );
}
