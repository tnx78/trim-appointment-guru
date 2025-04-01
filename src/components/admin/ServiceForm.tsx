import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Service, ServiceCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Image, X } from 'lucide-react';

interface ServiceFormProps {
  service?: Service;
  onComplete: () => void;
}

export function ServiceForm({ service, onComplete }: ServiceFormProps) {
  const { categories, addService, updateService } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('0');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now());

  const availableDurations = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || '');
      setCategoryId(service.categoryId);
      setDuration(service.duration.toString());
      setPrice(service.price.toString());
      setImage(service.image);
    }
  }, [service]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        console.log('Image loaded successfully');
      };
      reader.onerror = () => {
        toast.error('Error reading image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    setFileInputKey(Date.now());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name.trim() || !categoryId || !duration || !price) {
      toast.error('All fields except description and image are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = {
        name,
        description,
        categoryId,
        duration: parseInt(duration),
        price: parseFloat(price),
        image
      };
      
      if (service) {
        updateService(service.id, formData);
      } else {
        addService(formData);
      }
      
      setName('');
      setDescription('');
      setCategoryId('');
      setDuration('30');
      setPrice('0');
      setImage(undefined);
      onComplete();
    } catch (error) {
      toast.error('An error occurred saving the service');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          placeholder="e.g. Men's Haircut, Color Touch-up, etc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description of the service"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="service-image">Service Image</Label>
        <div className="flex items-center gap-4">
          {image ? (
            <div className="relative h-24 w-24 rounded-md overflow-hidden border">
              <img 
                src={image} 
                alt="Service preview" 
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <label htmlFor="service-image-input" className="cursor-pointer">
              <div className="h-24 w-24 border border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <Input
                id="service-image-input"
                key={fileInputKey}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          <div className="text-sm text-muted-foreground">
            {image ? "Click the X to remove the image" : "Click to upload an image (max 5MB)"}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select value={duration} onValueChange={setDuration} required>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {availableDurations.map(dur => (
                <SelectItem key={dur} value={dur.toString()}>
                  {dur} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {service ? 'Update' : 'Add'} Service
        </Button>
      </div>
    </form>
  );
}
