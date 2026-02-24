import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Monitor, Users, AlertTriangle, ArrowLeftRight, Plus, UserPlus, Eye, TrendingUp, Clock, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(221,83%,53%)', 'hsl(262,83%,58%)', 'hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(199,89%,48%)'];

const AnimatedCounter: React.FC<{ end: number; label: string; icon: React.ReactNode; color: string }> = ({ end, label, icon, color }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <Card className="glass-card border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-display font-bold mt-1">{count}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const { users } = useAuth();
  const { assets, assignments, repairRequests, activities, departments } = useData();
  const navigate = useNavigate();

  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingIssues = repairRequests.filter(r => r.status === 'pending').length;
  const assignedAssets = assignments.filter(a => !a.returnDate).length;

  const assetsByType = Object.entries(
    assets.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const deptData = departments.map(d => ({
    name: d.name,
    employees: users.filter(u => u.department === d.name && u.status === 'active').length,
    assets: assets.filter(a => a.department === d.name).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your IT infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/assets')} className="gradient-bg border-0"><Plus className="w-4 h-4 mr-1" /> Add Asset</Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/users')}><UserPlus className="w-4 h-4 mr-1" /> Create User</Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/issues')}><Eye className="w-4 h-4 mr-1" /> View Issues</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCounter end={assets.length} label="Total Assets" icon={<Monitor className="w-6 h-6 text-white" />} color="bg-primary" />
        <AnimatedCounter end={activeUsers} label="Active Users" icon={<Users className="w-6 h-6 text-white" />} color="bg-accent" />
        <AnimatedCounter end={pendingIssues} label="Pending Issues" icon={<AlertTriangle className="w-6 h-6 text-white" />} color="bg-warning" />
        <AnimatedCounter end={assignedAssets} label="Assigned Assets" icon={<ArrowLeftRight className="w-6 h-6 text-white" />} color="bg-success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-0">
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Assets by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={assetsByType} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {assetsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Building2Icon /> Department Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="employees" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} name="Employees" />
                <Bar dataKey="assets" fill="hsl(262,83%,58%)" radius={[4, 4, 0, 0]} name="Assets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.slice(0, 6).map(act => (
              <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  act.type === 'assignment' ? 'bg-primary' : act.type === 'issue' ? 'bg-warning' : act.type === 'user' ? 'bg-accent' : 'bg-success'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{act.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(act.timestamp).toLocaleString()}</p>
                </div>
                <Badge variant="secondary" className="text-xs capitalize shrink-0">{act.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Building2Icon = () => <Building2 className="w-5 h-5" />;

export default AdminDashboard;
