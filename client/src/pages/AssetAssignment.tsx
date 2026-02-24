import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeftRight, Undo2, Plus, Clock } from 'lucide-react';

const AssetAssignment: React.FC = () => {
  const { users, currentUser } = useAuth();
  const { assets, setAssets, assignments, setAssignments, assignmentHistory, setAssignmentHistory, departments } = useData();
  const { toast } = useToast();
  const [showAssign, setShowAssign] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const activeAssignments = assignments.filter(a => !a.returnDate);
  const availableAssets = assets.filter(a => a.status === 'available');
  const allEmployees = users.filter(u => u.role === 'employee' && u.status === 'active');
  const employees = selectedDepartment ? allEmployees.filter(u => u.department === selectedDepartment) : allEmployees;

  const handleAssign = () => {
    if (!selectedAsset || !selectedUser || !currentUser) return;
    const now = new Date().toISOString().split('T')[0];
    const newAssignment = { id: `assign-${Date.now()}`, assetId: selectedAsset, userId: selectedUser, assignedDate: now, returnDate: null, assignedBy: currentUser.id };
    setAssignments(prev => [...prev, newAssignment]);
    setAssets(prev => prev.map(a => a.id === selectedAsset ? { ...a, status: 'assigned' as const } : a));
    setAssignmentHistory(prev => [...prev, { id: `hist-${Date.now()}`, assetId: selectedAsset, userId: selectedUser, assignedDate: now, returnDate: null, action: 'assigned', performedBy: currentUser.id, timestamp: new Date().toISOString() }]);
    setShowAssign(false);
    setSelectedAsset('');
    setSelectedUser('');
    setSelectedDepartment('');
    toast({ title: 'Asset Assigned', description: 'Asset has been assigned successfully.' });
  };

  const handleReturn = (assignment: typeof assignments[0]) => {
    if (!currentUser) return;
    const now = new Date().toISOString().split('T')[0];
    setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, returnDate: now } : a));
    setAssets(prev => prev.map(a => a.id === assignment.assetId ? { ...a, status: 'available' as const } : a));
    setAssignmentHistory(prev => [...prev, { id: `hist-${Date.now()}`, assetId: assignment.assetId, userId: assignment.userId, assignedDate: assignment.assignedDate, returnDate: now, action: 'returned', performedBy: currentUser.id, timestamp: new Date().toISOString() }]);
    toast({ title: 'Asset Returned' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Asset Assignment</h1>
          <p className="text-muted-foreground">Assign and manage asset allocations</p>
        </div>
        <Button onClick={() => setShowAssign(true)} className="gradient-bg border-0" disabled={availableAssets.length === 0}>
          <Plus className="w-4 h-4 mr-2" /> Assign Asset
        </Button>
      </div>

      {/* Active Assignments */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><ArrowLeftRight className="w-5 h-5" /> Current Assignments ({activeAssignments.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAssignments.map(a => {
                const asset = assets.find(as => as.id === a.assetId);
                const user = users.find(u => u.id === a.userId);
                const assignedBy = users.find(u => u.id === a.assignedBy);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{asset?.name || 'Unknown'}<br /><span className="text-xs text-muted-foreground font-mono">{asset?.serialNumber}</span></TableCell>
                    <TableCell>{user?.name || 'Unknown'}<br /><span className="text-xs text-muted-foreground">{user?.department}</span></TableCell>
                    <TableCell className="text-sm">{a.assignedDate}</TableCell>
                    <TableCell className="text-sm">{assignedBy?.name || 'System'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleReturn(a)}>
                        <Undo2 className="w-3 h-3 mr-1" /> Return
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {activeAssignments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No active assignments.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> Assignment History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...assignmentHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(h => {
                const asset = assets.find(a => a.id === h.assetId);
                const user = users.find(u => u.id === h.userId);
                const by = users.find(u => u.id === h.performedBy);
                return (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{asset?.name || 'Unknown'}</TableCell>
                    <TableCell>{user?.name || 'Unknown'}</TableCell>
                    <TableCell><Badge className={h.action === 'assigned' ? 'status-assigned' : 'status-available'} variant="secondary">{h.action}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(h.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{by?.name || 'System'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Modal */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Assign Asset</DialogTitle>
            <DialogDescription>Select an available asset and assign it to an employee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Asset *</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>{availableAssets.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.serialNumber})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={(val) => { setSelectedDepartment(val); setSelectedUser(''); }}>
                <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Employee *</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map(u => <SelectItem key={u.id} value={u.id}>{u.name} - {u.department}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleAssign} className="gradient-bg border-0" disabled={!selectedAsset || !selectedUser}>Assign</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetAssignment;
