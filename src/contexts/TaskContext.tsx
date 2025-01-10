import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuid } from 'uuid';
import { useEmotion } from './EmotionContext';
import type { Task, TaskContextType } from '../types/tasks';
import type { EmotionState } from '../types/emotions';

const TaskContext = createContext<TaskContextType | null>(null);

const TASKS_STORAGE_KEY = 'tasks_data';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { emotionalState } = useEmotion();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: uuid(),
      createdAt: new Date(),
      emotionalContext: {
        createdDuring: emotionalState,
      },
      completed: false,
    };

    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  }, [emotionalState]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      );
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== id);
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id
          ? {
              ...task,
              completed: true,
              emotionalContext: {
                ...task.emotionalContext,
                completedDuring: emotionalState,
              },
            }
          : task
      )
    );
  }, [emotionalState]);

  const getTasks = useCallback(() => tasks, [tasks]);

  const getTaskById = useCallback(
    (id: string) => tasks.find(task => task.id === id),
    [tasks]
  );

  const getTasksByEmotion = useCallback(
    (emotion: EmotionState['dominantEmotion']) =>
      tasks.filter(
        task =>
          task.emotionalContext.createdDuring.dominantEmotion === emotion ||
          task.emotionalContext.completedDuring?.dominantEmotion === emotion
      ),
    [tasks]
  );

  const getSuggestedTasks = useCallback(() => {
    const currentEmotion = emotionalState.currentEmotion.dominantEmotion;

    // Return tasks that were successfully completed in similar emotional states
    return tasks.filter(task =>
      task.completed &&
      task.emotionalContext.completedDuring?.dominantEmotion === currentEmotion &&
      // Find similar uncompleted tasks
      tasks.some(t =>
        !t.completed &&
        t.priority === task.priority &&
        (t.tags?.some(tag => task.tags?.includes(tag)) ?? false)
      )
    );
  }, [tasks, emotionalState]);

  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    getTasks,
    getTaskById,
    getTasksByEmotion,
    getSuggestedTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;
