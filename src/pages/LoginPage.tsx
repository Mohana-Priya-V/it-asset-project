import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Eye, EyeOff, Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activationEmail, setActivationEmail] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      toast({ title: 'Welcome back!', description: result.message });
      const user = JSON.parse(JSON.stringify(result));
      // Navigate based on role from auth context
      navigate('/dashboard');
    } else {
      toast({ title: 'Login Failed', description: result.message, variant: 'destructive' });
    }
  };

  const handleActivation = (e: React.FormEvent) => {
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
    const result = activateAccount(activationEmail, newPassword);
    if (result.success) {
      toast({ title: 'Success!', description: result.message });
      setIsFirstTime(false);
      setActivationEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({ title: 'Activation Failed', description: result.message, variant: 'destructive' });
    }
  };

  const pwErrors = passwordPolicy(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(262_83%_58%_/_0.3),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(221_83%_53%_/_0.2),_transparent_50%)]" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl mb-4">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">IT Asset Manager</h1>
          <p className="text-white/70 mt-2">Manage your IT infrastructure efficiently</p>
        </div>

        {/* Glass card */}
        <div className="glass-card p-8 bg-white/10 border-white/20">
          {!isFirstTime ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/90">Email</Label>
                <Input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10 focus:border-white/40"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-white text-primary hover:bg-white/90 font-semibold h-11">
                Sign In
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setIsFirstTime(true)} className="text-white/70 hover:text-white text-sm underline underline-offset-4">
                  First Time Login?
                </button>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Demo Credentials</p>
                <p className="text-white/70 text-xs">Admin: admin@company.com / Admin@123</p>
                <p className="text-white/70 text-xs">Admin 2: vikram@company.com / Vikram@12</p>
                <p className="text-white/70 text-xs">Employee: rajesh@company.com / Rajesh@123</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleActivation} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-xl font-display font-semibold text-white">Activate Account</h2>
                <p className="text-white/60 text-sm mt-1">Set your password for the first time</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">Registered Email</Label>
                <Input
                  type="email"
                  placeholder="your.email@company.com"
                  value={activationEmail}
                  onChange={e => setActivationEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">Set Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-1 mt-2">
                    {['Min 8 characters', 'Uppercase letter', 'Lowercase letter', 'Number', 'Special character (!@#$%^&*)'].map(rule => {
                      const pass = !pwErrors.includes(rule);
                      return (
                        <p key={rule} className={`text-xs flex items-center gap-1 ${pass ? 'text-green-400' : 'text-white/40'}`}>
                          {pass ? '✓' : '○'} {rule}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-white text-primary hover:bg-white/90 font-semibold h-11">
                Activate Account
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setIsFirstTime(false)} className="text-white/70 hover:text-white text-sm underline underline-offset-4">
                  ← Back to Login
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
