export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'productivity' | 'consistency' | 'milestone' | 'special';
  points: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  isUnlocked: boolean;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  currentLevelProgress: number;
  nextLevelThreshold: number;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  achievements: Achievement[];
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
}

export interface PointsTransaction {
  id: string;
  type: 'task_completed' | 'streak_bonus' | 'achievement' | 'daily_goal';
  points: number;
  description: string;
  timestamp: Date;
  taskId?: string;
  achievementId?: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  points: number;
  isCompleted: boolean;
  date: Date;
  type: 'complete_tasks' | 'high_priority' | 'category_focus' | 'streak';
}

export interface WeeklyStats {
  week: string; // ISO week string
  tasksCompleted: number;
  pointsEarned: number;
  achievementsUnlocked: number;
  streakDays: number;
}