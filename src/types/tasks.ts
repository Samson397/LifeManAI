import type { EmotionState } from './emotions';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  suggestedByAI?: boolean;
  emotionalContext: {
    createdDuring: EmotionState;
    completedDuring?: EmotionState;
  };
}

export interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  getTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksByEmotion: (emotion: EmotionState['dominantEmotion']) => Task[];
}
