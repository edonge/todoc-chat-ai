/**
 * Example: Kids List Component
 * Demonstrates fetching and displaying data with useKids hook
 */
import { useEffect } from 'react';
import { useKids, useSelectedKid } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function KidsList() {
  const { kids, loading, error, fetchKids, deleteKid } = useKids();
  const { selectedKidId, selectKid } = useSelectedKid();

  useEffect(() => {
    fetchKids().catch(() => {
      toast.error('Failed to load children');
    });
  }, [fetchKids]);

  const handleDelete = async (kidId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteKid(kidId);
      toast.success(`${name} has been removed`);
      if (selectedKidId === kidId) {
        selectKid(null);
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSelect = (kidId: number) => {
    selectKid(kidId);
    toast.success('Child selected');
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 +
                   (today.getMonth() - birth.getMonth());

    if (months < 12) {
      return `${months} months`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0
      ? `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
      : `${years} year${years > 1 ? 's' : ''}`;
  };

  if (loading && kids.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => fetchKids()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (kids.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No children registered yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Register your first child to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>My Children</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {kids.map((kid) => (
          <div
            key={kid.id}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedKidId === kid.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{kid.name}</h3>
                  {selectedKidId === kid.id && (
                    <Badge variant="secondary" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {calculateAge(kid.birth_date)}
                  {kid.gender && ` • ${kid.gender === 'male' ? 'Boy' : 'Girl'}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSelect(kid.id)}
                  disabled={selectedKidId === kid.id}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(kid.id, kid.name)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
