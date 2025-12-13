/**
 * Example: Create Kid Form Component
 * Demonstrates API integration with useKids hook
 */
import { useState } from 'react';
import { useKids } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CreateKidForm() {
  const { createKid, loading, error } = useKids();
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.birth_date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const kid = await createKid({
        name: formData.name,
        birth_date: formData.birth_date,
        gender: formData.gender || undefined,
      });
      toast.success(`${kid.name} has been registered!`);
      setFormData({ name: '', birth_date: '', gender: '' });
    } catch (err) {
      toast.error('Failed to create kid profile');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register Child</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter child's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Birth Date *</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register Child'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
