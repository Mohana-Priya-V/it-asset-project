import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Monitor, Building2, ChevronRight, ArrowLeft } from 'lucide-react';

const DepartmentView: React.FC = () => {
  const { users } = useAuth();
  const { assets, departments, assignments } = useData();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  if (selectedDept) {
    const deptUsers = users.filter(u => u.department === selectedDept);
    const deptAssets = assets.filter(a => a.department === selectedDept);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDept(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">{selectedDept}</h1>
            <p className="text-muted-foreground">{deptUsers.length} employees · {deptAssets.length} assets</p>
          </div>
        </div>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Users className="w-5 h-5" /> Employees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deptUsers.length === 0 && <p className="text-muted-foreground text-sm">No employees in this department.</p>}
            {deptUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold">{u.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant="secondary" className="capitalize">{u.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Monitor className="w-5 h-5" /> Assigned Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deptAssets.length === 0 && <p className="text-muted-foreground text-sm">No assets assigned to this department.</p>}
            {deptAssets.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{a.serialNumber}</p>
                </div>
                <Badge variant="secondary" className="capitalize">{a.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Departments</h1>
        <p className="text-muted-foreground">View departments, employees, and assigned assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const deptUsers = users.filter(u => u.department === dept.name && u.status === 'active');
          const deptAssets = assets.filter(a => a.department === dept.name);

          return (
            <Card
              key={dept.id}
              className="glass-card border-0 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedDept(dept.name)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{dept.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {deptUsers.length} employees</span>
                  <span className="flex items-center gap-1"><Monitor className="w-4 h-4" /> {deptAssets.length} assets</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentView;
