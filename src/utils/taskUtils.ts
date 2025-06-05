import { Task } from '../types/kanban';
import { SortOption, FilterOption } from '../types/kanban';

/**
 * Filter tasks based on search query
 */
export const filterTasksBySearch = (tasks: Task[], searchQuery: string): Task[] => {
  if (!searchQuery.trim()) return tasks;
  
  const query = searchQuery.toLowerCase();
  return tasks.filter(task =>
    task.title.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query) ||
    task.category.toLowerCase().includes(query)
  );
};

/**
 * Sort tasks based on the specified option
 */
export const sortTasks = (tasks: Task[], sortBy: SortOption, sortOrder: 'asc' | 'desc' = 'asc'): Task[] => {
  return [...tasks].sort((a, b) => {
    let result = 0;
    
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        result = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        result = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      
      case 'category':
        result = a.category.localeCompare(b.category);
        break;
      
      case 'title':
        result = a.title.localeCompare(b.title);
        break;
      
      case 'createdAt':
        result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
      
      default:
        return 0;
    }
    
    return sortOrder === 'desc' ? -result : result;
  });
};

/**
 * Filter tasks by column
 */
export const filterTasksByColumn = (tasks: Task[], columnId: string): Task[] => {
  return tasks.filter(task => task.columnId === columnId);
};

/**
 * Check if a task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  return task.dueDate ? new Date() > new Date(task.dueDate) : false;
};

/**
 * Get tasks that are due soon (within next 3 days)
 */
export const getTasksDueSoon = (tasks: Task[]): Task[] => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate <= threeDaysFromNow && dueDate >= new Date();
  });
};

/**
 * Get overdue tasks
 */
export const getOverdueTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(isTaskOverdue);
};

/**
 * Generate a unique task ID
 */
export const generateTaskId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a unique column ID
 */
export const generateColumnId = (): string => {
  return `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get category color based on category name
 */
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'General': 'bg-gray-100 text-gray-800',
    'Work': 'bg-blue-100 text-blue-800',
    'Personal': 'bg-green-100 text-green-800',
    'Shopping': 'bg-yellow-100 text-yellow-800',
    'Health': 'bg-red-100 text-red-800',
    'Finance': 'bg-purple-100 text-purple-800',
    'Education': 'bg-indigo-100 text-indigo-800',
    'Travel': 'bg-pink-100 text-pink-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

/**
 * Get priority color based on priority level
 */
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  return colors[priority];
};