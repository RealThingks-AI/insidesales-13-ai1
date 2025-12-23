import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSecurityAudit } from "@/hooks/useSecurityAudit";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SecuritySettings = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityAudit();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      await logSecurityEvent('PASSWORD_CHANGE', 'auth', user?.id, {
        changed_at: new Date().toISOString()
      });

      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ newPassword: '', confirmPassword: '' });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm">Password</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPasswordModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Change Password</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-xs">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={e => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                placeholder="Enter new password"
                className="h-8"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                placeholder="Confirm new password"
                className="h-8"
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecuritySettings;
