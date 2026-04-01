import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Eye, EyeOff, Shield, ArrowLeft, CheckCircle2, Circle, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activationEmail, setActivationEmail] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, activateAccount } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordPolicy = (pw: string) => {
    const errors: string[] = [];
    if (pw.length < 8) errors.push('Min 8 characters');
    if (!/[A-Z]/.test(pw)) errors.push('Uppercase letter');
    if (!/[a-z]/.test(pw)) errors.push('Lowercase letter');
    if (!/[0-9]/.test(pw)) errors.push('Number');
    if (!/[!@#$%^&*]/.test(pw)) errors.push('Special character (!@#$%^&*)');
    return errors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast({ title: 'Welcome back!', description: result.message });
        navigate('/dashboard');
      } else {
        toast({ title: 'Login Failed', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Login Error', description: 'An error occurred during login', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = passwordPolicy(newPassword);
    if (errors.length > 0) {
      toast({ title: 'Weak Password', description: `Missing: ${errors.join(', ')}`, variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Mismatch', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const result = await activateAccount(activationEmail, newPassword);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        setIsFirstTime(false);
        setActivationEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({ title: 'Activation Failed', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Activation Error', description: 'An error occurred during activation', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const pwErrors = passwordPolicy(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-info/8 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg shadow-lg shadow-primary/25 mb-4">
            <Monitor className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">IT Asset Manager</h1>
          <p className="text-muted-foreground mt-2">Manage your IT infrastructure efficiently</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card backdrop-blur-xl shadow-xl shadow-primary/5 p-8">
          {!isFirstTime ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-11 bg-secondary/50 border-border/50 pr-10 focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-bg border-0 text-primary-foreground font-semibold h-11 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : 'Sign In'}
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setIsFirstTime(true)} className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-4 transition-colors">
                  First Time Login?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleActivation} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-xl font-display font-semibold text-foreground">Activate Account</h2>
                <p className="text-muted-foreground text-sm mt-1">Set your password for the first time</p>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Registered Email</Label>
                <Input
                  type="email"
                  placeholder="your.email@company.com"
                  value={activationEmail}
                  onChange={e => setActivationEmail(e.target.value)}
                  className="h-11 bg-secondary/50 border-border/50 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Set Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="h-11 bg-secondary/50 border-border/50 pr-10 focus:border-primary/50"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-1 mt-2">
                    {['Min 8 characters', 'Uppercase letter', 'Lowercase letter', 'Number', 'Special character (!@#$%^&*)'].map(rule => {
                      const pass = !pwErrors.includes(rule);
                      return (
                        <p key={rule} className={`text-xs flex items-center gap-1.5 ${pass ? 'text-success' : 'text-muted-foreground'}`}>
                          {pass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />} {rule}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="h-11 bg-secondary/50 border-border/50 focus:border-primary/50"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">Passwords do not match</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-bg border-0 text-primary-foreground font-semibold h-11 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating...</> : 'Activate Account'}
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setIsFirstTime(false)} className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-1 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
