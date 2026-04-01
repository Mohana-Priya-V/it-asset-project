import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Search, MessageSquare } from 'lucide-react';
import { IssueStatus } from '@/data/mockData';
import { issuesApi } from '@/services/api';

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

const IssueManagement: React.FC = () => {
  const { users } = useAuth();
  const { assets, repairRequests, setRepairRequests } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showRemarks, setShowRemarks] = useState(false);
  const [selectedReq, setSelectedReq] = useState<typeof repairRequests[0] | null>(null);
  const [remarks, setRemarks] = useState('');
  const [newStatus, setNewStatus] = useState<IssueStatus>('pending');

  const filtered = repairRequests.filter(r => {
    const asset = assets.find(a => a.id === r.assetId);
    const user = users.find(u => u.id === r.userId);
    const matchSearch = (asset?.name || '').toLowerCase().includes(search.toLowerCase()) || (user?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const openRemarks = (req: typeof repairRequests[0]) => {
    setSelectedReq(req);
    setRemarks(req.adminRemarks);
    setNewStatus(req.status);
    setShowRemarks(true);
  };

  const handleUpdate = async () => {
    if (!selectedReq) return;
    try {
      const updated = await issuesApi.update(selectedReq.id, {
        status: newStatus,
        adminRemarks: remarks,
      });
      setRepairRequests(prev => prev.map(r => r.id === selectedReq.id ? updated : r));
      setShowRemarks(false);
      toast({ title: 'Issue Updated', description: `Status changed to ${newStatus.replace('_', ' ')}` });
    } catch (err: any) {
      console.error('[IssueManagement] Failed to update issue:', err);
      toast({
        title: 'Update Failed',
        description: err?.detail || err?.message || 'Could not update issue',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Issue Management</h1>
        <p className="text-muted-foreground">Track and resolve repair requests</p>
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by asset or user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(req => {
                const asset = assets.find(a => a.id === req.assetId);
                const user = users.find(u => u.id === req.userId);
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{asset?.name || 'Unknown'}</TableCell>
                    <TableCell>{user?.name || 'Unknown'}<br /><span className="text-xs text-muted-foreground">{user?.department}</span></TableCell>
                    <TableCell 
  className="max-w-[250px] truncate text-sm"
  title={req.description}
>
  {req.description}
</TableCell>

                    <TableCell><Badge className={`${priorityColors[req.priority]} text-xs capitalize`}>{req.priority}</Badge></TableCell>
                    <TableCell><Badge className={`${statusColors[req.status]} text-xs capitalize`}>{req.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-sm">{req.createdAt}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openRemarks(req)}>
                        <MessageSquare className="w-3 h-3 mr-1" /> Update
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No issues found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showRemarks} onOpenChange={setShowRemarks}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Update Issue</DialogTitle>
            <DialogDescription>Change status and add remarks.</DialogDescription>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm font-medium">{assets.find(a => a.id === selectedReq.assetId)?.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedReq.description}</p>
              </div>
              <div><Label>Status</Label>
                <Select value={newStatus} onValueChange={v => setNewStatus(v as IssueStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Admin Remarks</Label>
                <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks or resolution notes..." rows={3} />
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={handleUpdate} className="gradient-bg border-0">Update Issue</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssueManagement;
