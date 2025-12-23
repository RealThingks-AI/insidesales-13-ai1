import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Loader2 } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setProfile({
        full_name: data?.full_name || user.user_metadata?.full_name || '',
        email: data?.['Email ID'] || user.email || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.full_name,
        'Email ID': profile.email,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="full_name" className="text-xs">Full Name *</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Enter your full name"
              className="h-8"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">Email *</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              readOnly
              disabled
              className="h-8 bg-muted/50 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
