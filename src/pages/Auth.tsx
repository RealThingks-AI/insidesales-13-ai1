import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logger from "@/utils/logger";

// Safari-compatible cleanup utility - only used when explicitly needed
const cleanupAuthState = () => {
  try {
    if (typeof Storage !== 'undefined' && typeof localStorage !== 'undefined') {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            logger.warn('Failed to remove localStorage key:', key);
          }
        }
      });
    }
    
    if (typeof Storage !== 'undefined' && typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          try {
            sessionStorage.removeItem(key);
          } catch (e) {
            logger.warn('Failed to remove sessionStorage key:', key);
          }
        }
      });
    }
  } catch (error) {
    logger.warn('Cleanup error:', error);
  }
};

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCheckDone, setUserCheckDone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Memoized user check to prevent repeated calls
  const checkUser = useCallback(async () => {
    if (userCheckDone) return;
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        navigate("/");
      }
    } catch (error) {
      logger.warn('User check failed:', error);
    } finally {
      setUserCheckDone(true);
    }
  }, [navigate, userCheckDone]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only attempt sign in directly - avoid aggressive cleanup that can break sessions
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout')), 15000)
        )
      ]) as any;

      if (error) {
        // If session conflict, try cleanup and retry once
        if (error.message?.includes('session') || error.status === 400) {
          logger.info('Session conflict detected, cleaning up and retrying...');
          cleanupAuthState();
          await new Promise(resolve => setTimeout(resolve, 100));
          
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch {
            // Ignore signout errors
          }
          
          // Retry login
          const retryResult = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          
          if (retryResult.error) {
            throw retryResult.error;
          }
          
          if (retryResult.data.user && retryResult.data.session) {
            logger.info('Login successful after retry');
            toast({
              title: "Success",
              description: "Logged in successfully!",
            });
            setTimeout(() => {
              window.location.replace("/");
            }, 300);
            return;
          }
        }
        
        logger.error('Login error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "Login failed. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.user && data.session) {
        logger.info('Login successful');
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        
        // Redirect with small delay for session to propagate
        setTimeout(() => {
          window.location.replace("/");
        }, 300);
      } else {
        throw new Error('No user data received');
      }
    } catch (error: any) {
      logger.error('Login process error:', error);
      let errorMessage = "An unexpected error occurred";
      
      if (error.message === 'Login timeout') {
        errorMessage = "Login timed out. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            RealThingks CRM
          </CardTitle>
          <p className="text-sm text-foreground/70">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary/90 hover:bg-primary text-primary-foreground text-lg py-3" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
