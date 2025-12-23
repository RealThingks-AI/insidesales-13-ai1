import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useThemePreferences } from '@/hooks/useThemePreferences';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, Sun, Moon, Loader2 } from 'lucide-react';

const DisplaySettings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useThemePreferences();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setDateFormat(data.date_format || 'DD/MM/YYYY');
      }
    } catch (error) {
      console.error('Error fetching display preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme,
          date_format: dateFormat,
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
          <Settings className="h-4 w-4" />
          Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Theme *</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Date Format *</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
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

export default DisplaySettings;
