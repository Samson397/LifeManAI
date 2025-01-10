export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  emotionalImpact?: {
    before: string;
    after: string;
    impact: number;
  };
}

export interface TaskFilter {
  completed?: boolean;
  priority?: Task['priority'];
  tags?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  highPriority: number;
  positiveImpact: number;
  negativeImpact: number;
}

export interface TaskManagementState {
  tasks: Task[];
  filters: TaskFilter;
  stats: TaskStats;
}
