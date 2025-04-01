
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { EmailTemplate } from '@/components/admin/email/types';

interface TemplateEditorProps {
  selectedTemplate: EmailTemplate | null;
  isEditing: boolean;
  subject: string;
  body: string;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onEditClick: () => void;
  onSaveTemplate: () => void;
  onCancelEdit: () => void;
}

export function TemplateEditor({
  selectedTemplate,
  isEditing,
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  onEditClick,
  onSaveTemplate,
  onCancelEdit
}: TemplateEditorProps) {
  return (
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
          <Button onClick={onEditClick}>
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
                onChange={(e) => onSubjectChange(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Template Body (HTML)</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
                disabled={!isEditing}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            
            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={onSaveTemplate}>
                  Save Template
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
