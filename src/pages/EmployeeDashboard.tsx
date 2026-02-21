import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Monitor, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'status-pending',
  in_progress: 'status-repair',
  resolved: 'status-available',
  rejected: 'status-inactive',
};

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'status-pending',
  high: 'status-repair',
  critical: 'status-inactive',
};

const EmployeeDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { assets, assignments, repairRequests } = useData();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const myAssignments = assignments.filter(a => a.userId === currentUser.id && !a.returnDate);
  const myAssets = myAssignments.map(a => assets.find(asset => asset.id === a.assetId)).filter(Boolean);
  const myIssues = repairRequests.filter(r => r.userId === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Welcome, {currentUser.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's your personal dashboard</p>
        </div>
        <Button onClick={() => navigate('/report-issue')} className="gradient-bg border-0">
          <AlertTriangle className="w-4 h-4 mr-2" /> Report an Issue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">My Assets</p>
              <p className="text-2xl font-display font-bold">{myAssets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Issues</p>
              <p className="text-2xl font-display font-bold">{myIssues.filter(i => i.status !== 'resolved' && i.status !== 'rejected').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-display font-bold">{myIssues.filter(i => i.status === 'resolved').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Assets */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Monitor className="w-5 h-5" /> My Assets</CardTitle></CardHeader>
        <CardContent>
          {myAssets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assets assigned to you yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssets.map(asset => asset && (
                <div key={asset.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{asset.type} • {asset.serialNumber}</p>
                    </div>
                    <Badge className="status-assigned text-xs">Assigned</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{asset.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Warranty: {asset.warrantyExpiry}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Issues */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> My Issues</CardTitle></CardHeader>
        <CardContent>
          {myIssues.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No issues reported.</p>
          ) : (
            <div className="space-y-3">
              {myIssues.map(issue => {
                const asset = assets.find(a => a.id === issue.assetId);
                return (
                  <div key={issue.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{asset?.name || 'Unknown Asset'}</p>
                        <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                        {issue.adminRemarks && (
                          <p className="text-xs text-muted-foreground mt-2 italic">Admin: {issue.adminRemarks}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${statusColors[issue.status]} text-xs capitalize`}>{issue.status.replace('_', ' ')}</Badge>
                        <Badge className={`${priorityColors[issue.priority]} text-xs capitalize`}>{issue.priority}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Reported: {issue.createdAt}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
