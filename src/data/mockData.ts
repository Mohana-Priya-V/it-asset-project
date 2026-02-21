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
  { id: 'user-2', name: 'Rajesh Kumar', email: 'rajesh@company.com', password: 'Rajesh@123', role: 'employee', department: 'IT', phone: '555-0101', status: 'active', createdAt: '2024-02-10', isFirstLogin: false },
  { id: 'user-3', name: 'Priya Sharma', email: 'priya@company.com', password: 'Priya@123', role: 'employee', department: 'HR', phone: '555-0102', status: 'active', createdAt: '2024-02-15', isFirstLogin: false },
  { id: 'user-4', name: 'Amit Patel', email: 'amit@company.com', password: 'Amit@1234', role: 'employee', department: 'Finance', phone: '555-0103', status: 'active', createdAt: '2024-03-01', isFirstLogin: false },
  { id: 'user-5', name: 'Sneha Reddy', email: 'sneha@company.com', password: 'Sneha@123', role: 'employee', department: 'Marketing', phone: '555-0104', status: 'active', createdAt: '2024-03-10', isFirstLogin: false },
  { id: 'user-6', name: 'Vikram Singh', email: 'vikram@company.com', password: 'Vikram@12', role: 'admin', department: 'IT', phone: '555-0105', status: 'active', createdAt: '2024-03-15', isFirstLogin: false },
  { id: 'user-7', name: 'Ananya Gupta', email: 'ananya@company.com', password: '', role: 'employee', department: 'Operations', phone: '555-0106', status: 'pending', createdAt: '2024-04-01', isFirstLogin: true },
  { id: 'user-8', name: 'Rohan Mehta', email: 'rohan@company.com', password: '', role: 'employee', department: 'IT', phone: '555-0107', status: 'pending', createdAt: '2024-04-05', isFirstLogin: true },
  { id: 'user-9', name: 'Kavita Joshi', email: 'kavita@company.com', password: 'Kavita@12', role: 'employee', department: 'HR', phone: '555-0108', status: 'inactive', createdAt: '2024-01-20', isFirstLogin: false },
  { id: 'user-10', name: 'Deepak Nair', email: 'deepak@company.com', password: 'Deepak@12', role: 'employee', department: 'Finance', phone: '555-0109', status: 'active', createdAt: '2024-04-10', isFirstLogin: false },
  { id: 'user-11', name: 'Meera Iyer', email: 'meera@company.com', password: 'Meera@123', role: 'employee', department: 'Marketing', phone: '555-0110', status: 'active', createdAt: '2024-04-15', isFirstLogin: false },
  { id: 'user-12', name: 'Arjun Das', email: 'arjun@company.com', password: 'Arjun@123', role: 'employee', department: 'Operations', phone: '555-0111', status: 'active', createdAt: '2024-05-01', isFirstLogin: false },
];

export const initialAssets: Asset[] = [
  { id: 'asset-1', name: 'Dell Latitude 5540', type: 'laptop', serialNumber: 'DL-5540-001', purchaseDate: '2024-01-10', status: 'assigned', warrantyExpiry: '2027-01-10', department: 'IT', description: '15.6" FHD, i7, 16GB RAM, 512GB SSD' },
  { id: 'asset-2', name: 'Dell Latitude 5540', type: 'laptop', serialNumber: 'DL-5540-002', purchaseDate: '2024-01-10', status: 'assigned', warrantyExpiry: '2027-01-10', department: 'HR', description: '15.6" FHD, i7, 16GB RAM, 512GB SSD' },
  { id: 'asset-3', name: 'HP ProDesk 400', type: 'desktop', serialNumber: 'HP-PD400-001', purchaseDate: '2023-06-15', status: 'available', warrantyExpiry: '2026-06-15', department: 'Finance', description: 'i5, 8GB RAM, 256GB SSD' },
  { id: 'asset-4', name: 'Dell UltraSharp 27"', type: 'monitor', serialNumber: 'DU-27-001', purchaseDate: '2024-02-01', status: 'assigned', warrantyExpiry: '2027-02-01', department: 'IT', description: '4K UHD, USB-C Hub' },
  { id: 'asset-5', name: 'MacBook Pro 14"', type: 'laptop', serialNumber: 'MBP-14-001', purchaseDate: '2024-03-01', status: 'assigned', warrantyExpiry: '2027-03-01', department: 'Marketing', description: 'M3 Pro, 18GB RAM, 512GB SSD' },
  { id: 'asset-6', name: 'HP LaserJet Pro', type: 'printer', serialNumber: 'HP-LJ-001', purchaseDate: '2023-09-01', status: 'available', warrantyExpiry: '2025-09-01', department: 'HR', description: 'Color LaserJet, Network enabled' },
  { id: 'asset-7', name: 'Logitech MX Keys', type: 'keyboard', serialNumber: 'LG-MXK-001', purchaseDate: '2024-01-20', status: 'assigned', warrantyExpiry: '2026-01-20', department: 'IT', description: 'Wireless, Backlit' },
  { id: 'asset-8', name: 'iPhone 15 Pro', type: 'phone', serialNumber: 'IP-15P-001', purchaseDate: '2024-04-01', status: 'assigned', warrantyExpiry: '2026-04-01', department: 'Operations', description: '256GB, Space Black' },
  { id: 'asset-9', name: 'Dell Latitude 7440', type: 'laptop', serialNumber: 'DL-7440-001', purchaseDate: '2024-02-15', status: 'under_repair', warrantyExpiry: '2027-02-15', department: 'Finance', description: '14" FHD+, i7, 32GB RAM, 1TB SSD' },
  { id: 'asset-10', name: 'Samsung Galaxy Tab S9', type: 'tablet', serialNumber: 'SG-TS9-001', purchaseDate: '2024-05-01', status: 'available', warrantyExpiry: '2026-05-01', department: 'Marketing', description: '11", 128GB, Wi-Fi' },
  { id: 'asset-11', name: 'HP ProBook 450', type: 'laptop', serialNumber: 'HP-PB450-001', purchaseDate: '2023-08-01', status: 'retired', warrantyExpiry: '2025-08-01', department: 'HR', description: '15.6" FHD, i5, 8GB RAM' },
  { id: 'asset-12', name: 'Logitech MX Master 3S', type: 'mouse', serialNumber: 'LG-MXM-001', purchaseDate: '2024-01-20', status: 'assigned', warrantyExpiry: '2026-01-20', department: 'IT', description: 'Wireless, Ergonomic' },
  { id: 'asset-13', name: 'Dell OptiPlex 7010', type: 'desktop', serialNumber: 'DO-7010-001', purchaseDate: '2024-06-01', status: 'available', warrantyExpiry: '2027-06-01', department: 'Operations', description: 'i7, 16GB RAM, 512GB SSD' },
  { id: 'asset-14', name: 'LG 34" UltraWide', type: 'monitor', serialNumber: 'LG-34UW-001', purchaseDate: '2024-03-15', status: 'assigned', warrantyExpiry: '2027-03-15', department: 'IT', description: 'WQHD, USB-C, 34"' },
  { id: 'asset-15', name: 'Canon ImageRunner', type: 'printer', serialNumber: 'CN-IR-001', purchaseDate: '2023-11-01', status: 'available', warrantyExpiry: '2026-11-01', department: 'Finance', description: 'A3/A4, Network Scanner' },
  { id: 'asset-16', name: 'ThinkPad X1 Carbon', type: 'laptop', serialNumber: 'TP-X1C-001', purchaseDate: '2024-07-01', status: 'available', warrantyExpiry: '2027-07-01', department: 'IT', description: '14" 2.8K OLED, i7, 32GB RAM' },
  { id: 'asset-17', name: 'Dell PowerEdge R750', type: 'server', serialNumber: 'DP-R750-001', purchaseDate: '2024-01-05', status: 'assigned', warrantyExpiry: '2029-01-05', department: 'IT', description: 'Xeon Gold, 128GB RAM, RAID' },
  { id: 'asset-18', name: 'iPad Pro 12.9"', type: 'tablet', serialNumber: 'IP-PRO-001', purchaseDate: '2024-06-15', status: 'assigned', warrantyExpiry: '2026-06-15', department: 'HR', description: 'M2, 256GB, Wi-Fi + Cellular' },
  { id: 'asset-19', name: 'Logitech C920 Webcam', type: 'other', serialNumber: 'LG-C920-001', purchaseDate: '2024-02-01', status: 'available', warrantyExpiry: '2026-02-01', department: 'IT', description: '1080p HD, Autofocus' },
  { id: 'asset-20', name: 'HP EliteBook 840', type: 'laptop', serialNumber: 'HP-EB840-001', purchaseDate: '2024-08-01', status: 'available', warrantyExpiry: '2027-08-01', department: 'Marketing', description: '14" FHD, i7, 16GB RAM' },
];

export const initialAssignments: Assignment[] = [
  { id: 'assign-1', assetId: 'asset-1', userId: 'user-2', assignedDate: '2024-02-15', returnDate: null, assignedBy: 'user-1' },
  { id: 'assign-2', assetId: 'asset-2', userId: 'user-3', assignedDate: '2024-02-20', returnDate: null, assignedBy: 'user-1' },
  { id: 'assign-3', assetId: 'asset-4', userId: 'user-2', assignedDate: '2024-02-15', returnDate: null, assignedBy: 'user-1' },
  { id: 'assign-4', assetId: 'asset-5', userId: 'user-5', assignedDate: '2024-03-15', returnDate: null, assignedBy: 'user-1' },
  { id: 'assign-5', assetId: 'asset-7', userId: 'user-2', assignedDate: '2024-02-15', returnDate: null, assignedBy: 'user-1' },
  { id: 'assign-6', assetId: 'asset-8', userId: 'user-12', assignedDate: '2024-05-10', returnDate: null, assignedBy: 'user-6' },
  { id: 'assign-7', assetId: 'asset-12', userId: 'user-2', assignedDate: '2024-02-15', returnDate: null, assignedBy: 'user-1' },
  { id: 'assign-8', assetId: 'asset-14', userId: 'user-6', assignedDate: '2024-04-01', returnDate: null, assignedBy: 'user-1' },
  { id: 'assign-9', assetId: 'asset-17', userId: 'user-1', assignedDate: '2024-01-15', returnDate: null, assignedBy: 'user-1' },
  { id: 'assign-10', assetId: 'asset-18', userId: 'user-3', assignedDate: '2024-07-01', returnDate: null, assignedBy: 'user-6' },
];

export const initialAssignmentHistory: AssignmentHistory[] = [
  { id: 'hist-1', assetId: 'asset-1', userId: 'user-2', assignedDate: '2024-02-15', returnDate: null, action: 'assigned', performedBy: 'user-1', timestamp: '2024-02-15T09:00:00' },
  { id: 'hist-2', assetId: 'asset-2', userId: 'user-3', assignedDate: '2024-02-20', returnDate: null, action: 'assigned', performedBy: 'user-1', timestamp: '2024-02-20T10:00:00' },
  { id: 'hist-3', assetId: 'asset-11', userId: 'user-9', assignedDate: '2024-01-25', returnDate: '2024-06-01', action: 'returned', performedBy: 'user-1', timestamp: '2024-06-01T14:00:00' },
  { id: 'hist-4', assetId: 'asset-5', userId: 'user-5', assignedDate: '2024-03-15', returnDate: null, action: 'assigned', performedBy: 'user-1', timestamp: '2024-03-15T11:00:00' },
  { id: 'hist-5', assetId: 'asset-8', userId: 'user-12', assignedDate: '2024-05-10', returnDate: null, action: 'assigned', performedBy: 'user-6', timestamp: '2024-05-10T09:30:00' },
];

export const initialRepairRequests: RepairRequest[] = [
  { id: 'req-1', assetId: 'asset-9', userId: 'user-4', description: 'Laptop screen flickering intermittently, especially when on battery power.', priority: 'high', status: 'in_progress', adminRemarks: 'Sent to Dell service center for screen replacement.', createdAt: '2024-06-15', updatedAt: '2024-06-18' },
  { id: 'req-2', assetId: 'asset-1', userId: 'user-2', description: 'Keyboard spacebar sometimes requires multiple presses to register.', priority: 'medium', status: 'pending', adminRemarks: '', createdAt: '2024-07-01', updatedAt: '2024-07-01' },
  { id: 'req-3', assetId: 'asset-5', userId: 'user-5', description: 'Battery drains very quickly, lasts only about 2 hours.', priority: 'high', status: 'pending', adminRemarks: '', createdAt: '2024-07-10', updatedAt: '2024-07-10' },
  { id: 'req-4', assetId: 'asset-2', userId: 'user-3', description: 'WiFi keeps disconnecting randomly during video calls.', priority: 'medium', status: 'resolved', adminRemarks: 'WiFi driver updated and antenna checked. Issue resolved.', createdAt: '2024-05-20', updatedAt: '2024-05-25' },
  { id: 'req-5', assetId: 'asset-8', userId: 'user-12', description: 'Phone charging port is loose, cable falls out easily.', priority: 'low', status: 'rejected', adminRemarks: 'Physical inspection shows no damage. Please use original cable.', createdAt: '2024-06-01', updatedAt: '2024-06-03' },
  { id: 'req-6', assetId: 'asset-4', userId: 'user-2', description: 'Monitor has a dead pixel cluster in the top-right corner.', priority: 'low', status: 'pending', adminRemarks: '', createdAt: '2024-07-15', updatedAt: '2024-07-15' },
];

export const activityTypes = ['assignment', 'issue', 'user', 'asset'] as const;

export interface Activity {
  id: string;
  type: typeof activityTypes[number];
  message: string;
  timestamp: string;
  userId: string;
}

export const initialActivities: Activity[] = [
  { id: 'act-1', type: 'assignment', message: 'Dell Latitude 5540 assigned to Rajesh Kumar', timestamp: '2024-07-15T10:30:00', userId: 'user-1' },
  { id: 'act-2', type: 'issue', message: 'New repair request for MacBook Pro 14" by Sneha Reddy', timestamp: '2024-07-15T09:15:00', userId: 'user-5' },
  { id: 'act-3', type: 'user', message: 'New employee Ananya Gupta registered', timestamp: '2024-07-14T16:00:00', userId: 'user-1' },
  { id: 'act-4', type: 'asset', message: 'ThinkPad X1 Carbon added to inventory', timestamp: '2024-07-14T14:30:00', userId: 'user-1' },
  { id: 'act-5', type: 'issue', message: 'WiFi issue on Dell Latitude 5540 resolved', timestamp: '2024-07-14T11:00:00', userId: 'user-6' },
  { id: 'act-6', type: 'assignment', message: 'iPad Pro returned by Priya Sharma', timestamp: '2024-07-13T15:45:00', userId: 'user-6' },
  { id: 'act-7', type: 'user', message: 'Rohan Mehta account created', timestamp: '2024-07-13T10:00:00', userId: 'user-1' },
  { id: 'act-8', type: 'asset', message: 'HP EliteBook 840 added to inventory', timestamp: '2024-07-12T09:00:00', userId: 'user-6' },
];
