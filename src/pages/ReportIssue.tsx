import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Send } from 'lucide-react';
import { IssuePriority } from '@/data/mockData';

const ReportIssue: React.FC = () => {
  const { currentUser } = useAuth();
  const { assets, assignments, setRepairRequests } = useData();
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');

  if (!currentUser) return null;

  const myAssignments = assignments.filter(a => a.userId === currentUser.id && !a.returnDate);
  const myAssets = myAssignments.map(a => assets.find(asset => asset.id === a.assetId)).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !description.trim()) {
      toast({ title: 'Missing Fields', description: 'Please select an asset and describe the issue.', variant: 'destructive' });
      return;
    }
    const now = new Date().toISOString().split('T')[0];
    setRepairRequests(prev => [...prev, {
      id: `req-${Date.now()}`,
      assetId: selectedAsset,
      userId: currentUser.id,
      description: description.trim(),
      priority,
      status: 'pending',
      adminRemarks: '',
      createdAt: now,
      updatedAt: now,
    }]);
    setSelectedAsset('');
    setDescription('');
    setPriority('medium');
    toast({ title: 'Issue Reported', description: 'Your issue has been submitted to the admin.' });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Report an Issue</h1>
        <p className="text-muted-foreground">Submit a repair request for your assigned assets</p>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> New Issue Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Select Asset *</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger><SelectValue placeholder="Choose your asset" /></SelectTrigger>
                <SelectContent>
                  {myAssets.map(a => a && (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.serialNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {myAssets.length === 0 && <p className="text-xs text-muted-foreground mt-1">No assets assigned to you.</p>}
            </div>
            <div>
              <Label>Describe the Problem *</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Explain the issue in detail..." rows={4} />
            </div>
            <div>
              <Label>Priority Level</Label>
              <Select value={priority} onValueChange={v => setPriority(v as IssuePriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="gradient-bg border-0 w-full">
              <Send className="w-4 h-4 mr-2" /> Submit Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIssue;
