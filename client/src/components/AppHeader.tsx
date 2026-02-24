import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';

const AppHeader: React.FC = () => {
  const { currentUser } = useAuth();
  const { repairRequests } = useData();

  if (!currentUser) return null;

  const pendingCount = repairRequests.filter(r => r.status === 'pending').length;

  return (
    <header className="h-16 glass-card rounded-none border-x-0 border-t-0 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 bg-muted/50 border-0 h-9" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
              {pendingCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
