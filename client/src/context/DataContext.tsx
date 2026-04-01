import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Asset, Assignment, AssignmentHistory, RepairRequest, Activity,
  initialAssets, initialAssignments, initialAssignmentHistory,
  initialRepairRequests, initialActivities, departments, Department, User
} from '@/data/mockData';
import { usersApi, assetsApi, assignmentsApi, issuesApi, departmentsApi } from '@/services/api';

interface DataContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  assignmentHistory: AssignmentHistory[];
  setAssignmentHistory: React.Dispatch<React.SetStateAction<AssignmentHistory[]>>;
  repairRequests: RepairRequest[];
  setRepairRequests: React.Dispatch<React.SetStateAction<RepairRequest[]>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  departments: Department[];
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>(initialAssignmentHistory);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>(initialRepairRequests);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [departmentsList, setDepartmentsList] = useState<Department[]>(departments);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[DataContext] Starting fetch on mount...');
        
        // Fetch departments from backend
        console.log('[DataContext] Fetching departments...');
        const deptsData = await departmentsApi.getAll();
        console.log('[DataContext] Departments fetched:', deptsData);
        if (deptsData && deptsData.length > 0) {
          setDepartmentsList(deptsData);
        }
        
        // Fetch users from backend
        console.log('[DataContext] Fetching users...');
        const usersData = await usersApi.getAll();
        console.log('[DataContext] Users fetched:', usersData);
        setUsers(usersData || []);

        // Fetch assets from backend
        console.log('[DataContext] Fetching assets...');
        const assetsData = await assetsApi.getAll();
        console.log('[DataContext] Assets fetched:', assetsData);
        setAssets(assetsData || []);

        // Fetch assignments from backend
        console.log('[DataContext] Fetching assignments...');
        const assignmentsData = await assignmentsApi.getAll();
        console.log('[DataContext] Assignments fetched:', assignmentsData);
        setAssignments(assignmentsData || []);

        // Fetch issues from backend
        console.log('[DataContext] Fetching issues...');
        const issuesData = await issuesApi.getAll();
        console.log('[DataContext] Issues fetched:', issuesData);
        setRepairRequests(issuesData || []);
        
        console.log('[DataContext] Fetch complete');
      } catch (error) {
        console.error('[DataContext] Error fetching data from backend:', error);
        // Keep empty arrays on error instead of resetting to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{
      users, setUsers,
      assets, setAssets,
      assignments, setAssignments,
      assignmentHistory, setAssignmentHistory,
      repairRequests, setRepairRequests,
      activities, setActivities,
      departments: departmentsList,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
