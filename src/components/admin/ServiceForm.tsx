
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Service, ServiceCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If editing, populate form with service data
  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || '');
      setCategoryId(service.categoryId);
      setDuration(service.duration.toString());
      setPrice(service.price.toString());
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name.trim() || !categoryId || !duration || !price) {
      toast.error('All fields except description are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = {
        name,
        description,
        categoryId,
        duration: parseInt(duration),
        price: parseFloat(price)
      };
      
      if (service) {
        updateService(service.id, formData);
      } else {
        addService(formData);
      }
      
      // Reset form
      setName('');
      setDescription('');
      setCategoryId('');
      setDuration('30');
      setPrice('0');
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="5"
            step="5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
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
