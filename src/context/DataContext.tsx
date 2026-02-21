import React, { createContext, useContext, useState } from 'react';
import {
  Asset, Assignment, AssignmentHistory, RepairRequest, Activity,
  initialAssets, initialAssignments, initialAssignmentHistory,
  initialRepairRequests, initialActivities, departments, Department
} from '@/data/mockData';

interface DataContextType {
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>(initialAssignmentHistory);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>(initialRepairRequests);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  return (
    <DataContext.Provider value={{
      assets, setAssets,
      assignments, setAssignments,
      assignmentHistory, setAssignmentHistory,
      repairRequests, setRepairRequests,
      activities, setActivities,
      departments
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
