
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Image, Loader2, Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useContentManagement } from '@/hooks/useContentManagement';
import { useGalleryFileUpload } from '@/hooks/gallery/useGalleryFileUpload';

export function ContentManagementTab() {
  const { 
    heroSettings, 
    siteContent, 
    loading, 
    updating, 
    updateHeroBackground, 
    updateSiteContent,
    getContentByKey 
  } = useContentManagement();
  
  const { isUploading, uploadImageFile } = useGalleryFileUpload();
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Uploading hero image:', file.name);
    const imageUrl = await uploadImageFile(file);
    if (imageUrl) {
      console.log('Hero image uploaded successfully:', imageUrl);
      await updateHeroBackground(imageUrl);
    } else {
      console.error('Failed to upload hero image');
    }
  };

  const handleContentUpdate = async (contentKey: string) => {
    const newValue = editingContent[contentKey];
    if (newValue !== undefined) {
      const success = await updateSiteContent(contentKey, newValue);
      if (success) {
        setEditingContent(prev => {
          const updated = { ...prev };
          delete updated[contentKey];
          return updated;
        });
      }
    }
  };

  const handleInputChange = (contentKey: string, value: string) => {
    setEditingContent(prev => ({
      ...prev,
      [contentKey]: value
    }));
  };

  const isEditing = (contentKey: string) => contentKey in editingContent;
  const getCurrentValue = (contentKey: string) => 
    editingContent[contentKey] ?? getContentByKey(contentKey);

  // Group content by sections
  const heroContent = siteContent.filter(item => 
    item.content_key.startsWith('hero_')
  );

  const servicesContent = siteContent.filter(item => 
    item.content_key.includes('services_section_')
  );

  const featuresContent = siteContent.filter(item => 
    item.content_key.includes('why_choose_') || 
    item.content_key.includes('expert_stylists_') ||
    item.content_key.includes('easy_booking_') ||
    item.content_key.includes('flexible_hours_') ||
    item.content_key.includes('personalized_service_')
  );

  const ctaContent = siteContent.filter(item => 
    item.content_key.includes('cta_section_')
  );

  const renderContentFields = (contentItems: typeof siteContent) => (
    <div className="space-y-4">
      {contentItems.map((content) => (
        <div key={content.id} className="space-y-2">
          <Label htmlFor={content.content_key} className="text-sm font-medium">
            {content.description || content.content_key}
          </Label>
          
          {content.content_key.includes('text') || content.content_key.includes('subtitle') ? (
            <Textarea
              id={content.content_key}
              value={getCurrentValue(content.content_key)}
              onChange={(e) => handleInputChange(content.content_key, e.target.value)}
              className="min-h-[80px]"
              placeholder={`Enter ${content.description || content.content_key}`}
            />
          ) : (
            <Input
              id={content.content_key}
              value={getCurrentValue(content.content_key)}
              onChange={(e) => handleInputChange(content.content_key, e.target.value)}
              placeholder={`Enter ${content.description || content.content_key}`}
            />
          )}
          
          {isEditing(content.content_key) && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleContentUpdate(content.content_key)}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingContent(prev => {
                  const updated = { ...prev };
                  delete updated[content.content_key];
                  return updated;
                })}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Content Management</h2>
        <p className="text-muted-foreground">
          Manage your website's content organized by sections.
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["hero"]} className="w-full">
        <AccordionItem value="hero">
          <AccordionTrigger className="text-lg font-semibold">
            Home Hero Section
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Hero Background Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Hero Background Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {heroSettings?.background_image_url && (
                    <div className="relative">
                      <img
                        src={heroSettings.background_image_url}
                        alt="Hero background"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      disabled={isUploading || updating}
                      onClick={() => document.getElementById('hero-image-upload')?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {heroSettings?.background_image_url ? 'Change Image' : 'Upload Image'}
                    </Button>
                    
                    {heroSettings?.background_image_url && (
                      <Button
                        variant="destructive"
                        disabled={updating}
                        onClick={() => updateHeroBackground(null)}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                  
                  <input
                    id="hero-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Hero Text Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Hero Text Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderContentFields(heroContent)}
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="services">
          <AccordionTrigger className="text-lg font-semibold">
            Home Services Section
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Services Section Content</CardTitle>
              </CardHeader>
              <CardContent>
                {renderContentFields(servicesContent)}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger className="text-lg font-semibold">
            Home Features Section
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us & Features Content</CardTitle>
              </CardHeader>
              <CardContent>
                {renderContentFields(featuresContent)}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cta">
          <AccordionTrigger className="text-lg font-semibold">
            Home CTA Section
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>Call to Action Content</CardTitle>
              </CardHeader>
              <CardContent>
                {renderContentFields(ctaContent)}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
