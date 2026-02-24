export type Role = 'admin' | 'employee';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type AssetStatus = 'available' | 'assigned' | 'under_repair' | 'retired';
export type AssetType = 'laptop' | 'desktop' | 'monitor' | 'keyboard' | 'mouse' | 'printer' | 'phone' | 'tablet' | 'server' | 'other';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
  isFirstLogin: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  serialNumber: string;
  purchaseDate: string;
  status: AssetStatus;
  warrantyExpiry: string;
  department: string;
  description: string;
}

export interface Assignment {
  id: string;
  assetId: string;
  userId: string;
  assignedDate: string;
  returnDate: string | null;
  assignedBy: string;
}

export interface AssignmentHistory {
  id: string;
  assetId: string;
  userId: string;
  assignedDate: string;
  returnDate: string | null;
  action: 'assigned' | 'returned';
  performedBy: string;
  timestamp: string;
}

export interface RepairRequest {
  id: string;
  assetId: string;
  userId: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  adminRemarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
}

export const departments: Department[] = [
  { id: 'dept-1', name: 'IT' },
  { id: 'dept-2', name: 'HR' },
  { id: 'dept-3', name: 'Finance' },
  { id: 'dept-4', name: 'Marketing' },
  { id: 'dept-5', name: 'Operations' },
];

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@company.com', password: 'Admin@123', role: 'admin', department: 'IT', phone: '555-0100', status: 'active', createdAt: '2024-01-15', isFirstLogin: false },
];

export const initialAssets: Asset[] = [];

export const initialAssignments: Assignment[] = [];

export const initialAssignmentHistory: AssignmentHistory[] = [];

export const initialRepairRequests: RepairRequest[] = [];

export const activityTypes = ['assignment', 'issue', 'user', 'asset'] as const;

export interface Activity {
  id: string;
  type: typeof activityTypes[number];
  message: string;
  timestamp: string;
  userId: string;
}

export const initialActivities: Activity[] = [];
