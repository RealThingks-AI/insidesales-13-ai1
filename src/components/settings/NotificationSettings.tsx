import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Loader2 } from 'lucide-react';

interface NotificationPrefs {
  email_notifications: boolean;
  in_app_notifications: boolean;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email_notifications: true,
    in_app_notifications: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPrefs({
          email_notifications: data.email_notifications,
          in_app_notifications: data.in_app_notifications,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
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
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <Label htmlFor="email_notifications" className="text-sm cursor-pointer">
              Email Notifications
            </Label>
            <Switch
              id="email_notifications"
              checked={prefs.email_notifications}
              onCheckedChange={() => togglePref('email_notifications')}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="in_app_notifications" className="text-sm cursor-pointer">
              In-App Notifications
            </Label>
            <Switch
              id="in_app_notifications"
              checked={prefs.in_app_notifications}
              onCheckedChange={() => togglePref('in_app_notifications')}
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

export default NotificationSettings;
