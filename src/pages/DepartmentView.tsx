import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Monitor, Building2 } from 'lucide-react';

const DepartmentView: React.FC = () => {
  const { users } = useAuth();
  const { assets, departments, assignments, repairRequests } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Departments</h1>
        <p className="text-muted-foreground">Overview of departments, employees, and assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const deptUsers = users.filter(u => u.department === dept.name && u.status === 'active');
          const deptAssets = assets.filter(a => a.department === dept.name);
          const deptIssues = repairRequests.filter(r => {
            const asset = assets.find(a => a.id === r.assetId);
            return asset?.department === dept.name && (r.status === 'pending' || r.status === 'in_progress');
          });

          return (
            <Card key={dept.id} className="glass-card border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  {dept.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Employees</span>
                  </div>
                  <Badge variant="secondary" className="font-mono">{deptUsers.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Assets</span>
                  </div>
                  <Badge variant="secondary" className="font-mono">{deptAssets.length}</Badge>
                </div>
                {deptIssues.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                    <span className="text-sm text-warning">Open Issues</span>
                    <Badge className="status-pending font-mono">{deptIssues.length}</Badge>
                  </div>
                )}

                {/* Employee list */}
                {deptUsers.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Team Members</p>
                    <div className="space-y-1">
                      {deptUsers.slice(0, 5).map(u => (
                        <div key={u.id} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-semibold">{u.name.charAt(0)}</div>
                          <span className="truncate">{u.name}</span>
                          <Badge variant="secondary" className="text-xs capitalize ml-auto">{u.role}</Badge>
                        </div>
                      ))}
                      {deptUsers.length > 5 && <p className="text-xs text-muted-foreground">+{deptUsers.length - 5} more</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentView;
