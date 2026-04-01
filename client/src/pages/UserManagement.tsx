import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Search, Edit, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { User, Role, departments } from '@/data/mockData';
import { usersApi } from '@/services/api';

const UserManagement: React.FC = () => {
  const { users: authUsers, setUsers: setAuthUsers } = useAuth();
  const { users: dataUsers, setUsers: setDataUsers, loading: dataLoading } = useData();
  // Use dataUsers (fetched from backend on mount) for display, fall back to authUsers
  const users = dataUsers && dataUsers.length > 0 ? dataUsers : authUsers;
  const setUsers = dataUsers && dataUsers.length > 0 ? setDataUsers : setAuthUsers;
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'employee' as Role, department: '', phone: '' });
  const [loading, setLoading] = useState(false);

  // Fetch fresh users from backend when component mounts
  useEffect(() => {
    const fetchFreshUsers = async () => {
      try {
        console.log('[UserManagement] Fetching fresh users on mount...');
        const freshUsers = await usersApi.getAll();
        console.log('[UserManagement] Fresh users received:', freshUsers);
        if (freshUsers && freshUsers.length > 0) {
          console.log(`[UserManagement] Setting ${freshUsers.length} users to state`);
          setDataUsers(freshUsers);
        } else {
          console.warn('[UserManagement] No users returned from backend');
        }
      } catch (error) {
        console.error('[UserManagement] Error fetching fresh users on mount:', error);
      }
    };
    fetchFreshUsers();
  }, [setDataUsers]);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Log updates (after filtered is defined)
  useEffect(() => {
    console.log('[UserManagement] Data state updated:', { 
      totalUsers: users.length, 
      dataCount: dataUsers?.length || 0, 
      filteredCount: filtered.length
    });
  }, [users.length, dataUsers?.length, filtered.length]);

  

  // Move logging effect here, after filtered is defined
  useEffect(() => {
    console.log('[UserManagement] Filter or data changed:', { 
      totalUsers: users.length, 
      filteredCount: filtered.length,
      filters: { search, roleFilter, statusFilter }
    });
  }, [filtered]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.department) {
      toast({ title: 'Missing Fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    if (users.find(u => u.email === form.email)) {
      toast({ title: 'Duplicate', description: 'Email already exists', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      // Send department name to backend (backend will map to id)
      const result = await usersApi.create({
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department
      });

      // Add the new user to the local state using backend response
      const created = result;
      const newUser: User = {
        id: `user-${created.id || Date.now()}`,
        name: created.name || form.name,
        email: created.email || form.email,
        role: created.role || form.role,
        department: created.department || form.department,
        phone: created.phone || '',
        password: '',
        status: created.status || 'pending',
        createdAt: created.created_at || new Date().toISOString().split('T')[0],
        isFirstLogin: true,
      };

      setUsers(prev => [...prev, newUser]);
      setShowCreate(false);
      setForm({ name: '', email: '', role: 'employee', department: '', phone: '' });
      toast({ 
        title: 'User Created', 
        description: `${newUser.name} has been created and can activate their account.` 
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      const detail = error?.detail || error?.error || error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      toast({ 
        title: 'Error', 
        description: detail || 'Failed to create user. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    
    try {
      setLoading(true);
      // Call backend API to update user (send department name)
      await usersApi.update(editUser.id, {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        department: editUser.department
      });
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u));
      setShowEdit(false);
      setEditUser(null);
      toast({ title: 'User Updated', description: 'User details have been updated.' });
    } catch (error: any) {
      console.error('Error updating user:', error);
      const detail = error?.detail || error?.error || error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      toast({ 
        title: 'Error', 
        description: detail || 'Failed to update user. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user: User) => {
    if (user.role === 'admin' && users.filter(u => u.role === 'admin' && u.status === 'active').length <= 1 && user.status === 'active') {
      toast({ title: 'Cannot Deactivate', description: 'At least one admin must remain active.', variant: 'destructive' });
      return;
    }
    
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      // Call backend API (if status field is supported)
      // For now, update local state
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast({ title: `User ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`, description: `${user.name} is now ${newStatus}.` });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive' 
      });
    }
  };

  const statusBadge = (status: string) => {
    const cls = status === 'active' ? 'status-active' : status === 'inactive' ? 'status-inactive' : 'status-pending';
    return <Badge className={`${cls} text-xs capitalize`}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and roles</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gradient-bg border-0"><UserPlus className="w-4 h-4 mr-2" /> Create User</Button>
      </div>

      {/* Filters */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize text-xs">{user.role}</Badge></TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{statusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditUser({ ...user }); setShowEdit(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(user)}>
                        {user.status === 'active' ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Create New User</DialogTitle>
            <DialogDescription>User will set their own password on first login.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Department *</Label>
              <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate} disabled={loading} className="gradient-bg border-0">{loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create User'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Edit User</DialogTitle>
            <DialogDescription>Update user details below.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div><Label>Full Name</Label><Input value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={editUser.email} disabled className="opacity-50" /></div>
              <div><Label>Role</Label>
                <Select value={editUser.role} onValueChange={v => setEditUser({ ...editUser, role: v as Role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Department</Label>
                <Select value={editUser.department} onValueChange={v => setEditUser({ ...editUser, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Phone</Label><Input value={editUser.phone} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={handleUpdate} disabled={loading} className="gradient-bg border-0">{loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
