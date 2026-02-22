import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { currentUser, setUsers } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  if (!currentUser) return null;

  const handleSave = () => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, name, phone } : u));
    toast({ title: 'Profile Updated' });
  };


  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground">View and update your profile</p>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <UserCircle className="w-5 h-5" /> Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold font-display">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-lg">{currentUser.name}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="capitalize">{currentUser.role}</Badge>
                <Badge className="status-active">{currentUser.status}</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input value={currentUser.email} disabled className="opacity-50" /></div>
            <div><Label>Department</Label><Input value={currentUser.department} disabled className="opacity-50" /></div>
          </div>
          <Button onClick={handleSave} className="gradient-bg border-0"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
        </CardContent>
      </Card>

    </div>
  );
};

export default ProfilePage;
