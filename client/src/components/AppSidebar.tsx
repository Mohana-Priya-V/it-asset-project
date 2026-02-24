import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { NavLink } from '@/components/NavLink';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Monitor, ArrowLeftRight, Building2,
  AlertTriangle, UserCircle, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/assets', icon: Monitor, label: 'Assets' },
  { to: '/assignments', icon: ArrowLeftRight, label: 'Assignments' },
  { to: '/departments', icon: Building2, label: 'Departments' },
  { to: '/issues', icon: AlertTriangle, label: 'Issues' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

const employeeLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-assets', icon: Monitor, label: 'My Assets' },
  { to: '/report-issue', icon: AlertTriangle, label: 'Report Issue' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;
  const links = currentUser.role === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`glass-sidebar h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} shrink-0 sticky top-0`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/30">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">ITAM</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {links.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
              activeClassName=""
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border/30">
        {!collapsed ? (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <Badge variant="secondary" className="text-xs capitalize mt-0.5">{currentUser.role}</Badge>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} className={`w-full justify-start text-muted-foreground hover:text-destructive ${collapsed ? 'px-0 justify-center' : ''}`}>
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
