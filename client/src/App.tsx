import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import UserManagement from "@/pages/UserManagement";
import AssetManagement from "@/pages/AssetManagement";
import AssetAssignment from "@/pages/AssetAssignment";
import DepartmentView from "@/pages/DepartmentView";
import ExpiryAlerts from "@/pages/ExpiryAlerts";
import IssueManagement from "@/pages/IssueManagement";
import ReportIssue from "@/pages/ReportIssue";
import MyAssets from "@/pages/MyAssets";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/assets" element={<AssetManagement />} />
                <Route path="/assignments" element={<AssetAssignment />} />
                <Route path="/departments" element={<DepartmentView />} />
                <Route path="/expiry-alerts" element={<ExpiryAlerts />} />
                <Route path="/issues" element={<IssueManagement />} />
                <Route path="/report-issue" element={<ReportIssue />} />
                <Route path="/my-assets" element={<MyAssets />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
