import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Monitor } from 'lucide-react';
import { Asset, AssetType, AssetStatus, departments } from '@/data/mockData';

const assetTypes: AssetType[] = ['laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'printer', 'phone', 'tablet', 'server', 'other'];

const statusMap: Record<string, string> = {
  available: 'status-available',
  assigned: 'status-assigned',
  under_repair: 'status-repair',
  retired: 'status-retired',
};

const AssetManagement: React.FC = () => {
  const { assets, setAssets, assignments } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const emptyForm: Omit<Asset, 'id'> = { name: '', type: 'laptop', serialNumber: '', purchaseDate: '', status: 'available', warrantyExpiry: '', department: '', description: '' };
  const [form, setForm] = useState(emptyForm);

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openCreate = () => { setEditAsset(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a: Asset) => { setEditAsset(a); setForm({ name: a.name, type: a.type, serialNumber: a.serialNumber, purchaseDate: a.purchaseDate, status: a.status, warrantyExpiry: a.warrantyExpiry, department: a.department, description: a.description }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.serialNumber || !form.department) {
      toast({ title: 'Missing Fields', description: 'Fill all required fields', variant: 'destructive' }); return;
    }
    if (!editAsset && assets.find(a => a.serialNumber === form.serialNumber)) {
      toast({ title: 'Duplicate', description: 'Serial number already exists', variant: 'destructive' }); return;
    }
    if (editAsset) {
      setAssets(prev => prev.map(a => a.id === editAsset.id ? { ...editAsset, ...form } : a));
      toast({ title: 'Asset Updated' });
    } else {
      setAssets(prev => [...prev, { id: `asset-${Date.now()}`, ...form }]);
      toast({ title: 'Asset Created' });
    }
    setShowModal(false);
  };

  const handleDelete = (asset: Asset) => {
    const isAssigned = assignments.some(a => a.assetId === asset.id && !a.returnDate);
    if (isAssigned) {
      toast({ title: 'Cannot Delete', description: 'Asset is currently assigned.', variant: 'destructive' }); return;
    }
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    toast({ title: 'Asset Deleted' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Asset Management</h1>
          <p className="text-muted-foreground">Manage IT assets and inventory</p>
        </div>
        <Button onClick={openCreate} className="gradient-bg border-0"><Plus className="w-4 h-4 mr-2" /> Add Asset</Button>
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or serial..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {assetTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="under_repair">Under Repair</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
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
                <TableHead>Type</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(asset => {
                const isAssigned = assignments.some(a => a.assetId === asset.id && !a.returnDate);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{asset.type}</TableCell>
                    <TableCell className="font-mono text-xs">{asset.serialNumber}</TableCell>
                    <TableCell>{asset.department}</TableCell>
                    <TableCell><Badge className={`${statusMap[asset.status]} text-xs capitalize`}>{asset.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-sm">{asset.warrantyExpiry}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(asset)}><Edit className="w-4 h-4" /></Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(asset)} disabled={isAssigned}>
                                <Trash2 className={`w-4 h-4 ${isAssigned ? 'text-muted-foreground' : 'text-destructive'}`} />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {isAssigned && <TooltipContent>Cannot delete assigned asset</TooltipContent>}
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No assets found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>{editAsset ? 'Update asset details.' : 'Add a new IT asset to inventory.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as AssetType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{assetTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Serial Number *</Label><Input value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} disabled={!!editAsset} /></div>
            <div><Label>Department *</Label>
              <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Purchase Date</Label><Input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></div>
              <div><Label>Warranty Expiry</Label><Input type="date" value={form.warrantyExpiry} onChange={e => setForm({ ...form, warrantyExpiry: e.target.value })} /></div>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as AssetStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="under_repair">Under Repair</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave} className="gradient-bg border-0">{editAsset ? 'Save Changes' : 'Add Asset'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetManagement;
