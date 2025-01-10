import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  description: string;
  emotionalState: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

class TaskManagementService {
  private readonly TASKS_STORAGE_KEY = '@tasks';
  private readonly TASK_ANALYTICS_KEY = '@task_analytics';

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    try {
      const tasks = await this.getAllTasks();
      tasks.push(newTask);
      await AsyncStorage.setItem(this.TASKS_STORAGE_KEY, JSON.stringify(tasks));
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(this.TASKS_STORAGE_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  async completeTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = true;
        tasks[taskIndex].completedAt = new Date();
        await AsyncStorage.setItem(this.TASKS_STORAGE_KEY, JSON.stringify(tasks));
        await this.updateTaskAnalytics(tasks[taskIndex]);
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error;
    }
  }

  async getTasksByEmotionalState(emotionalState: string): Promise<Task[]> {
    try {
      const tasks = await this.getAllTasks();
      return tasks.filter((task) => task.emotionalState === emotionalState);
    } catch (error) {
      console.error('Failed to get tasks by emotional state:', error);
      return [];
    }
  }

  async suggestTasks(emotionalState: string): Promise<Task[]> {
    const suggestions: Partial<Task>[] = {
      happy: [
        {
          title: 'Challenge Yourself',
          description: 'Take on a challenging task while your energy is high',
          priority: 'high',
          tags: ['productivity', 'growth'],
        },
        {
          title: 'Share Your Joy',
          description: 'Connect with friends or family',
          priority: 'medium',
          tags: ['social', 'wellbeing'],
        },
      ],
      sad: [
        {
          title: 'Mindful Moment',
          description: 'Take a few minutes for mindfulness or meditation',
          priority: 'high',
          tags: ['wellbeing', 'mindfulness'],
        },
        {
          title: 'Gentle Exercise',
          description: 'Go for a short walk or do light stretching',
          priority: 'medium',
          tags: ['health', 'exercise'],
        },
      ],
      stressed: [
        {
          title: 'Breathing Exercise',
          description: 'Practice deep breathing for 5 minutes',
          priority: 'high',
          tags: ['wellbeing', 'stress-relief'],
        },
        {
          title: 'Break Time',
          description: 'Take a short break from current tasks',
          priority: 'medium',
          tags: ['wellbeing', 'stress-relief'],
        },
      ],
    };

    const emotionalSuggestions = suggestions[emotionalState as keyof typeof suggestions] || [];
    return emotionalSuggestions.map((suggestion) => ({
      ...suggestion,
      id: Date.now().toString(),
      emotionalState,
      completed: false,
      createdAt: new Date(),
    })) as Task[];
  }

  private async updateTaskAnalytics(task: Task): Promise<void> {
    try {
      const analyticsJson = await AsyncStorage.getItem(this.TASK_ANALYTICS_KEY);
      const analytics = analyticsJson ? JSON.parse(analyticsJson) : {
        completedTasks: 0,
        tasksByEmotion: {},
        completionRates: {},
      };

      // Update analytics
      analytics.completedTasks++;
      analytics.tasksByEmotion[task.emotionalState] = 
        (analytics.tasksByEmotion[task.emotionalState] || 0) + 1;

      // Calculate completion time
      if (task.completedAt && task.createdAt) {
        const completionTime = new Date(task.completedAt).getTime() - 
                             new Date(task.createdAt).getTime();
        analytics.completionRates[task.emotionalState] = 
          analytics.completionRates[task.emotionalState] || [];
        analytics.completionRates[task.emotionalState].push(completionTime);
      }

      await AsyncStorage.setItem(this.TASK_ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to update task analytics:', error);
    }
  }

  async getTaskAnalytics() {
    try {
      const analyticsJson = await AsyncStorage.getItem(this.TASK_ANALYTICS_KEY);
      return analyticsJson ? JSON.parse(analyticsJson) : null;
    } catch (error) {
      console.error('Failed to get task analytics:', error);
      return null;
    }
  }
}

export default new TaskManagementService();
