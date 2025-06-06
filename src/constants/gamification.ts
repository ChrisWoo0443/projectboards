import { Achievement, LevelInfo } from '../types/gamification';

// Points system
export const POINTS = {
  TASK_COMPLETED: 10,
  HIGH_PRIORITY_TASK: 15,
  TASK_ON_TIME: 5,
  DAILY_STREAK: 20,
  WEEKLY_GOAL: 50,
  ACHIEVEMENT_BONUS: 100,
} as const;

// Level system
export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Beginner', minPoints: 0, maxPoints: 99, color: '#94a3b8', icon: '🌱' },
  { level: 2, title: 'Organizer', minPoints: 100, maxPoints: 249, color: '#60a5fa', icon: '📋' },
  { level: 3, title: 'Achiever', minPoints: 250, maxPoints: 499, color: '#34d399', icon: '🎯' },
  { level: 4, title: 'Productivity Pro', minPoints: 500, maxPoints: 999, color: '#fbbf24', icon: '⚡' },
  { level: 5, title: 'Task Master', minPoints: 1000, maxPoints: 1999, color: '#f97316', icon: '🏆' },
  { level: 6, title: 'Efficiency Expert', minPoints: 2000, maxPoints: 3999, color: '#ef4444', icon: '🚀' },
  { level: 7, title: 'Legendary Planner', minPoints: 4000, maxPoints: 7999, color: '#8b5cf6', icon: '👑' },
  { level: 8, title: 'Productivity Guru', minPoints: 8000, maxPoints: 15999, color: '#ec4899', icon: '🧙‍♂️' },
  { level: 9, title: 'Task Deity', minPoints: 16000, maxPoints: 31999, color: '#06b6d4', icon: '⭐' },
  { level: 10, title: 'Ultimate Organizer', minPoints: 32000, maxPoints: Infinity, color: '#d946ef', icon: '💎' },
];

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'isUnlocked' | 'progress'>[] = [
  // Productivity achievements
  {
    id: 'first_task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎉',
    category: 'productivity',
    points: 50,
    maxProgress: 1,
  },
  {
    id: 'task_10',
    title: 'Task Warrior',
    description: 'Complete 10 tasks',
    icon: '⚔️',
    category: 'productivity',
    points: 100,
    maxProgress: 10,
  },
  {
    id: 'task_50',
    title: 'Productivity Machine',
    description: 'Complete 50 tasks',
    icon: '🤖',
    category: 'productivity',
    points: 200,
    maxProgress: 50,
  },
  {
    id: 'task_100',
    title: 'Century Club',
    description: 'Complete 100 tasks',
    icon: '💯',
    category: 'milestone',
    points: 500,
    maxProgress: 100,
  },
  {
    id: 'high_priority_master',
    title: 'Priority Master',
    description: 'Complete 20 high-priority tasks',
    icon: '🔥',
    category: 'productivity',
    points: 150,
    maxProgress: 20,
  },
  
  // Consistency achievements
  {
    id: 'streak_3',
    title: 'Getting Consistent',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'consistency',
    points: 75,
    maxProgress: 3,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '📅',
    category: 'consistency',
    points: 150,
    maxProgress: 7,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🗓️',
    category: 'consistency',
    points: 300,
    maxProgress: 30,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a task before 9 AM',
    icon: '🌅',
    category: 'special',
    points: 25,
    maxProgress: 1,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🦉',
    category: 'special',
    points: 25,
    maxProgress: 1,
  },
  
  // Milestone achievements
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'milestone',
    points: 250,
    maxProgress: 1,
  },
  {
    id: 'level_10',
    title: 'Legendary Status',
    description: 'Reach the maximum level',
    icon: '👑',
    category: 'milestone',
    points: 1000,
    maxProgress: 1,
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete all tasks in a board',
    icon: '✨',
    category: 'special',
    points: 100,
    maxProgress: 1,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete 5 tasks in one day',
    icon: '💨',
    category: 'productivity',
    points: 75,
    maxProgress: 5,
  },
  {
    id: 'category_explorer',
    title: 'Category Explorer',
    description: 'Complete tasks in 5 different categories',
    icon: '🗂️',
    category: 'special',
    points: 100,
    maxProgress: 5,
  },
];

// Daily challenges
export const DAILY_CHALLENGE_TYPES = {
  COMPLETE_TASKS: 'complete_tasks',
  HIGH_PRIORITY: 'high_priority',
  CATEGORY_FOCUS: 'category_focus',
  STREAK: 'streak',
} as const;

// Weekly goal default
export const DEFAULT_WEEKLY_GOAL = 10;

// Streak calculation
export const STREAK_RESET_HOURS = 24;

// Level calculation helper
export const calculateLevel = (points: number): LevelInfo => {
  return LEVELS.find(level => points >= level.minPoints && points <= level.maxPoints) || LEVELS[0];
};

// Points to next level
export const getPointsToNextLevel = (currentPoints: number): number => {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevel = LEVELS.find(level => level.level === currentLevel.level + 1);
  return nextLevel ? nextLevel.minPoints - currentPoints : 0;
};