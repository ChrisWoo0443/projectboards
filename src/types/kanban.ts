export interface Task {
    id: string;
    title: string;
    description: string;
    columnId: string;
    category: string; 
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date | string;
    createdAt: Date;
  }
  
  export interface Column {
    id: string;
    title: string;
    taskIds: string[];
  }
  
  export interface CreateTaskData {
    title: string;
    description: string;
    columnId: string;
    category: string;
    priority: Task['priority'];
    dueDate?: Date | string;
  }
  
  export type SortOption = 'dueDate' | 'priority' | 'category' | 'title' | 'createdAt';
  export type FilterOption = 'all' | 'column' | string;