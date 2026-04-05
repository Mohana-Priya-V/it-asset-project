import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { assetsApi } from '@/services/api';

interface ExpiryAlert {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  warranty: string;
  days_left: number;
  status: 'expired' | 'critical' | 'warning';
}

const StatusBadge: React.FC<{ status: 'expired' | 'critical' | 'warning'; daysLeft: number }> = ({ status, daysLeft }) => {
  const statusConfig = {
    expired: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴', label: 'Expired' },
    critical: { bg: 'bg-red-200', text: 'text-red-900', icon: '🟥', label: 'Critical' },
    warning: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟡', label: 'Warning' },
  };

  const config = statusConfig[status];
  const displayText = status === 'expired' ? `${config.label} ${config.icon}` : `${daysLeft} days left ${config.icon} ${config.label}`;

  return (
    <Badge className={`${config.bg} ${config.text} border-0`}>
      {displayText}
    </Badge>
  );
};

const ExpiryAlerts: React.FC = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Fetch expiry alerts on component mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await assetsApi.getExpiry();
        setAlerts(data);
      } catch (err: any) {
        console.error('[ExpiryAlerts] Fetch failed:', err);
        toast({
          title: 'Failed to load expiry alerts',
          description: err?.message || 'Could not fetch expiry data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // Filter alerts based on search and status
  const filtered = alerts.filter(a => {
    const matchSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const expiredCount = alerts.filter(a => a.status === 'expired').length;
  const criticalCount = alerts.filter(a => a.status === 'critical').length;
  const warningCount = alerts.filter(a => a.status === 'warning').length;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertCircle className="w-8 h-8 text-orange-500" />
          Asset Expiry Alerts
        </h1>
        <p className="text-muted-foreground mt-2">Monitor warranties expiring within 60 days</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">🔴 {expiredCount}</div>
              <p className="text-sm text-red-700 mt-2">Expired</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-100 border-red-300">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-800">🟥 {criticalCount}</div>
              <p className="text-sm text-red-900 mt-2">Critical (≤30 days)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">🟡 {warningCount}</div>
              <p className="text-sm text-orange-700 mt-2">Warning (≤60 days)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Expiry Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Label>Search</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or serial..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="expired">Expired 🔴</SelectItem>
                  <SelectItem value="critical">Critical 🟥</SelectItem>
                  <SelectItem value="warning">Warning 🟡</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {alerts.length === 0 ? 'No expiry alerts found' : 'No results matching your filters'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Warranty Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(alert => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.name}</TableCell>
                      <TableCell className="capitalize">{alert.type}</TableCell>
                      <TableCell className="text-sm">{alert.serialNumber}</TableCell>
                      <TableCell>{alert.warranty}</TableCell>
                      <TableCell className="font-semibold">{alert.days_left}</TableCell>
                      <TableCell>
                        <StatusBadge status={alert.status} daysLeft={alert.days_left} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Results count */}
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {alerts.length} results
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpiryAlerts;
