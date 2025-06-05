import { Column } from '../types/kanban';

// Default board configuration
export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', taskIds: [] },
  { id: 'in-progress', title: 'In Progress', taskIds: [] },
  { id: 'review', title: 'Review', taskIds: [] },
  { id: 'done', title: 'Done', taskIds: [] },
];

// Task priorities
export const TASK_PRIORITIES = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
} as const;

// Task priorities array for UI components
export const TASK_PRIORITIES_ARRAY = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

// Task categories
export const TASK_CATEGORIES = [
  'General',
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Finance',
  'Education',
  'Travel',
] as const;

// Default task values
export const DEFAULT_TASK_VALUES = {
  CATEGORY: 'General',
  PRIORITY: TASK_PRIORITIES.LOW,
  DESCRIPTION: '',
} as const;

// Drag and drop types
export const DRAG_TYPES = {
  TASK: 'task',
  COLUMN: 'column',
} as const;

// View types
export const VIEW_TYPES = {
  BOARD: 'board',
  LIST: 'list',
  CALENDAR: 'calendar',
} as const;

// Toast messages
export const TOAST_MESSAGES = {
  BOARD_CREATED: (name: string) => ({
    title: 'Board created',
    description: `${name} has been created successfully.`,
  }),
  BOARD_DELETED: {
    title: 'Board deleted',
    description: 'The board has been deleted successfully.',
  },
  BOARD_DELETE_ERROR: {
    title: 'Cannot delete board',
    description: 'You must have at least one board.',
    variant: 'destructive' as const,
  },
  LOAD_ERROR: {
    title: 'Error loading boards',
    description: 'Failed to load your boards. Using default board.',
    variant: 'destructive' as const,
  },
  SAVE_ERROR: {
    title: 'Error saving changes',
    description: 'Failed to save your changes.',
    variant: 'destructive' as const,
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_COLLAPSED_DEFAULT: true,
  SEARCH_PLACEHOLDER: 'Search tasks...',
  TASK_CARD_ANIMATION_DURATION: 200,
} as const;