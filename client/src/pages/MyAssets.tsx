import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor } from 'lucide-react';

const statusColors: Record<string, string> = {
  available: 'status-available',
  assigned: 'status-assigned',
  under_repair: 'status-repair',
  retired: 'status-retired',
};

const MyAssets: React.FC = () => {
  const { currentUser } = useAuth();
  const { assets, assignments } = useData();

  if (!currentUser) return null;

  const myAssignments = assignments.filter(a => a.userId === currentUser.id && !a.returnDate);
  const myAssets = myAssignments.map(a => {
    const asset = assets.find(as => as.id === a.assetId);
    return asset ? { ...asset, assignedDate: a.assignedDate } : null;
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">My Assets</h1>
        <p className="text-muted-foreground">Assets currently assigned to you</p>
      </div>

      {myAssets.length === 0 ? (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No assets are currently assigned to you.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myAssets.map(asset => asset && (
            <Card key={asset.id} className="glass-card border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="font-display text-base">{asset.name}</CardTitle>
                  <Badge className={`${statusColors[asset.status]} text-xs capitalize`}>{asset.status.replace('_', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{asset.type}</span></div>
                  <div><span className="text-muted-foreground">Serial:</span> <span className="font-mono text-xs">{asset.serialNumber}</span></div>
                  <div><span className="text-muted-foreground">Dept:</span> {asset.department}</div>
                  <div><span className="text-muted-foreground">Warranty:</span> {asset.warrantyExpiry}</div>
                </div>
                <p className="text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2">{asset.description}</p>
                <p className="text-xs text-muted-foreground">Assigned: {(asset as any).assignedDate}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssets;
