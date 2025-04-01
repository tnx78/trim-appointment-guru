
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { EmailTemplate } from '@/components/admin/email/types';

interface TemplateSelectorProps {
  templates: EmailTemplate[];
  loading: boolean;
  selectedTemplate: EmailTemplate | null;
  onSelectTemplate: (template: EmailTemplate) => void;
}

export function TemplateSelector({ 
  templates, 
  loading, 
  selectedTemplate, 
  onSelectTemplate 
}: TemplateSelectorProps) {
  const variablesList = [
    { name: '{{client_name}}', description: 'Client\'s full name' },
    { name: '{{service_name}}', description: 'Name of the service booked' },
    { name: '{{date}}', description: 'Date of the appointment' },
    { name: '{{time}}', description: 'Start time of the appointment' },
    { name: '{{salon_name}}', description: 'Name of the salon (set in settings)' },
  ];

  return (
    <>
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
                  onClick={() => onSelectTemplate(template)}
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
    </>
  );
}
