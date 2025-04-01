
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PlusCircle, Edit, Info, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

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
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/process-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
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
  
  const variablesList = [
    { name: '{{client_name}}', description: 'Client\'s full name' },
    { name: '{{service_name}}', description: 'Name of the service booked' },
    { name: '{{date}}', description: 'Date of the appointment' },
    { name: '{{time}}', description: 'Start time of the appointment' },
    { name: '{{salon_name}}', description: 'Name of the salon (set in settings)' },
  ];

  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="templates">Email Templates</TabsTrigger>
        <TabsTrigger value="settings">Email Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="templates" className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Select a template to view or edit</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-4 text-center">Loading templates...</div>
                ) : (
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <Button
                        key={template.id}
                        variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        {template.name.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  Available Variables
                </CardTitle>
                <CardDescription>Use these in your templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {variablesList.map((variable) => (
                    <div key={variable.name} className="border p-2 rounded-md text-sm">
                      <div className="font-mono">{variable.name}</div>
                      <div className="text-muted-foreground text-xs mt-1">{variable.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedTemplate ? selectedTemplate.name.replace(/_/g, ' ') : 'Select a template'}
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate 
                      ? `Last updated: ${new Date(selectedTemplate.updated_at).toLocaleString()}`
                      : 'Choose a template from the list'}
                  </CardDescription>
                </div>
                
                {selectedTemplate && !isEditing && (
                  <Button onClick={handleEditClick}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Template
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!selectedTemplate ? (
                  <div className="p-12 text-center text-muted-foreground border rounded-md">
                    Select a template to view or edit its content
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Line</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="body">Template Body (HTML)</Label>
                      <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={!isEditing}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    {isEditing && (
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveTemplate}>
                          Save Template
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="settings" className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              {isSettingsLoading ? (
                <div className="py-4 text-center">Loading settings...</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email Address</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      Admin notifications will be sent to this email address
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salonName">Salon Name</Label>
                    <Input
                      id="salonName"
                      value={salonName}
                      onChange={(e) => setSalonName(e.target.value)}
                      placeholder="Your Salon Name"
                    />
                  </div>
                  
                  <Button 
                    onClick={updateSalonSettings} 
                    disabled={isUpdatingSettings}
                    className="w-full"
                  >
                    Save Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Email Processing</CardTitle>
              <CardDescription>Manage email delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Scheduled Emails</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Emails are automatically processed on a schedule. You can manually trigger email processing below.
                </p>
                <Button 
                  onClick={triggerEmailProcessing}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Process Pending Emails Now
                </Button>
              </div>
              
              <div className="border p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">How Emails Work</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Booking Confirmation:</strong> Sent to clients immediately after booking
                  </p>
                  <p>
                    <strong>Admin Notification:</strong> Sent to the admin when a new booking is made
                  </p>
                  <p>
                    <strong>Appointment Reminders:</strong> Sent 1 day and 2 hours before the appointment
                  </p>
                  <p>
                    <strong>Status Updates:</strong> Sent when an appointment is confirmed or cancelled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
