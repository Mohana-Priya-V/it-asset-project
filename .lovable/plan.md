

# 🖥️ IT Asset Management System — Frontend UI Plan

## Design Style
Modern glassmorphism with gradient backgrounds, frosted glass cards, blur effects, and clean typography. Dark/light mode support.

---

## Pages & Features

### 1. Login Page
- Clean login form with email & password
- "First Time Login?" link that opens a set-password flow
- Glassmorphism card centered on a gradient background
- Client-side password validation (8+ chars, uppercase, lowercase, number, special char)
- Mock authentication that routes to Admin or Employee dashboard based on selected role

### 2. Admin Dashboard
- **Stats overview cards**: Total assets, active users, pending issues, assigned assets (with animated counters)
- **Recent activity feed**: Latest assignments, issue reports, user registrations
- **Quick action buttons**: Add Asset, Create User, View Issues
- Charts: Asset distribution by type, department breakdown (using Recharts)

### 3. Employee Dashboard
- **My Assets**: Cards showing currently assigned assets with details
- **My Issues**: List of submitted repair requests with status badges
- **Quick actions**: Report an Issue button
- Simpler layout focused on personal data

### 4. User Management (Admin)
- Table view of all users with search & filter by role/department/status
- Create User modal (Name, Email, Role, Department, Phone)
- Edit User modal
- Activate/Deactivate toggle with confirmation dialog
- Status badges (Active/Inactive)

### 5. Asset Management (Admin)
- Table view with search & filters (type, status, department)
- Add/Edit Asset modals (Name, Type, Serial Number, Purchase Date, Status, Warranty)
- Status badges: Available, Assigned, Under Repair, Retired
- Prevent deletion of assigned assets (disabled button with tooltip)

### 6. Asset Assignment (Admin)
- Assign asset to employee form (select asset → select employee)
- Current assignments table with return action
- Assignment history log with timestamps

### 7. Department View (Admin)
- Department cards showing employee count & asset count
- Click to drill into department details
- Filter assignments and issues by department

### 8. Issue / Repair Requests
- **Employee view**: Submit issue form (select asset, describe problem, priority level), view own requests with status
- **Admin view**: All requests table with filters (status, priority, department), update status workflow (Pending → In Progress → Resolved / Rejected), add remarks

### 9. Profile Page
- View & edit own profile (name, phone, password change)
- Password change with current password verification (mock)

---

## Layout & Navigation
- **Sidebar** navigation with glassmorphism styling, collapsible to icon-only mode
- Admin sidebar: Dashboard, Users, Assets, Assignments, Departments, Issues, Profile
- Employee sidebar: Dashboard, My Assets, Report Issue, Profile
- Top header bar with user avatar, role badge, and notifications bell (with counter)

---

## Mock Data
- Pre-populated with realistic sample data (10+ users, 20+ assets, departments like IT/HR/Finance, sample issues)
- All CRUD operations work in-memory using React state
- Toast notifications for all actions (create, update, delete, assign)

---

## Key UI Details
- Responsive design (desktop-first, mobile-friendly)
- Animated page transitions (fade-in)
- Status badges with color coding throughout
- Confirmation dialogs for destructive actions
- Form validation with inline error messages
- Empty states with illustrations for tables with no data

