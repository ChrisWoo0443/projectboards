import { Task } from '../types/kanban';
import { UserStats, Achievement, PointsTransaction, DailyChallenge } from '../types/gamification';
import { POINTS, ACHIEVEMENTS, calculateLevel, getPointsToNextLevel, DAILY_CHALLENGE_TYPES, DEFAULT_WEEKLY_GOAL } from '../constants/gamification';
import { format, isToday, differenceInDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

/**
 * Calculate points for completing a task
 */
export const calculateTaskPoints = (task: Task): number => {
  let points = POINTS.TASK_COMPLETED;
  
  // Bonus for high priority tasks
  if (task.priority === 'high') {
    points += POINTS.HIGH_PRIORITY_TASK - POINTS.TASK_COMPLETED;
  }
  
  // Bonus for completing on time (if due date exists and task completed before/on due date)
  if (task.dueDate && task.completed) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    if (now <= dueDate) {
      points += POINTS.TASK_ON_TIME;
    }
  }
  
  return points;
};

/**
 * Calculate current streak based on task completion history
 */
export const calculateStreak = (tasks: Task[]): { current: number; longest: number } => {
  const completedTasks = tasks
    .filter(task => task.completed && task.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (completedTasks.length === 0) {
    return { current: 0, longest: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  // Check if there's activity today or yesterday to maintain streak
  const today = new Date();
  const hasActivityToday = completedTasks.some(task => isToday(new Date(task.createdAt)));
  const hasActivityYesterday = completedTasks.some(task => {
    const taskDate = new Date(task.createdAt);
    return differenceInDays(today, taskDate) === 1;
  });

  if (hasActivityToday) {
    currentStreak = 1;
    lastDate = today;
  } else if (hasActivityYesterday) {
    currentStreak = 1;
    lastDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  }

  // Calculate streaks by grouping tasks by day
  const tasksByDay = new Map<string, Task[]>();
  completedTasks.forEach(task => {
    const dayKey = format(new Date(task.createdAt), 'yyyy-MM-dd');
    if (!tasksByDay.has(dayKey)) {
      tasksByDay.set(dayKey, []);
    }
    tasksByDay.get(dayKey)!.push(task);
  });

  const sortedDays = Array.from(tasksByDay.keys()).sort().reverse();
  
  // Calculate current streak
  if (sortedDays.length > 0) {
    const todayKey = format(today, 'yyyy-MM-dd');
    const yesterdayKey = format(new Date(today.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    let streakStart = -1;
    if (sortedDays[0] === todayKey) {
      streakStart = 0;
    } else if (sortedDays[0] === yesterdayKey) {
      streakStart = 0;
    }
    
    if (streakStart >= 0) {
      currentStreak = 1;
      for (let i = streakStart + 1; i < sortedDays.length; i++) {
        const currentDay = new Date(sortedDays[i]);
        const previousDay = new Date(sortedDays[i - 1]);
        if (differenceInDays(previousDay, currentDay) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const currentDay = new Date(sortedDays[i]);
    const previousDay = new Date(sortedDays[i - 1]);
    if (differenceInDays(previousDay, currentDay) === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { current: currentStreak, longest: longestStreak };
};

/**
 * Check and unlock achievements based on user stats and tasks
 */
export const checkAchievements = (userStats: UserStats, tasks: Task[]): Achievement[] => {
  const newAchievements: Achievement[] = [];
  const completedTasks = tasks.filter(task => task.completed);
  const unlockedAchievementIds = userStats.achievements.filter(a => a.isUnlocked).map(a => a.id);

  ACHIEVEMENTS.forEach(achievementTemplate => {
    if (unlockedAchievementIds.includes(achievementTemplate.id)) {
      return; // Already unlocked
    }

    let shouldUnlock = false;
    let progress = 0;

    switch (achievementTemplate.id) {
      case 'first_task':
        shouldUnlock = completedTasks.length >= 1;
        progress = Math.min(completedTasks.length, 1);
        break;
      
      case 'task_10':
        progress = completedTasks.length;
        shouldUnlock = completedTasks.length >= 10;
        break;
      
      case 'task_50':
        progress = completedTasks.length;
        shouldUnlock = completedTasks.length >= 50;
        break;
      
      case 'task_100':
        progress = completedTasks.length;
        shouldUnlock = completedTasks.length >= 100;
        break;
      
      case 'high_priority_master':
        const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
        progress = highPriorityCompleted;
        shouldUnlock = highPriorityCompleted >= 20;
        break;
      
      case 'streak_3':
        progress = userStats.currentStreak;
        shouldUnlock = userStats.currentStreak >= 3;
        break;
      
      case 'streak_7':
        progress = userStats.currentStreak;
        shouldUnlock = userStats.currentStreak >= 7;
        break;
      
      case 'streak_30':
        progress = userStats.currentStreak;
        shouldUnlock = userStats.currentStreak >= 30;
        break;
      
      case 'early_bird':
        const earlyTasks = completedTasks.filter(task => {
          const hour = new Date(task.createdAt).getHours();
          return hour < 9;
        });
        progress = earlyTasks.length > 0 ? 1 : 0;
        shouldUnlock = earlyTasks.length > 0;
        break;
      
      case 'night_owl':
        const lateTasks = completedTasks.filter(task => {
          const hour = new Date(task.createdAt).getHours();
          return hour >= 22;
        });
        progress = lateTasks.length > 0 ? 1 : 0;
        shouldUnlock = lateTasks.length > 0;
        break;
      
      case 'level_5':
        progress = userStats.level >= 5 ? 1 : 0;
        shouldUnlock = userStats.level >= 5;
        break;
      
      case 'level_10':
        progress = userStats.level >= 10 ? 1 : 0;
        shouldUnlock = userStats.level >= 10;
        break;
      
      case 'speed_demon':
        const today = new Date();
        const todayTasks = completedTasks.filter(task => isToday(new Date(task.createdAt)));
        progress = todayTasks.length;
        shouldUnlock = todayTasks.length >= 5;
        break;
      
      case 'category_explorer':
        const uniqueCategories = new Set(completedTasks.map(task => task.category));
        progress = uniqueCategories.size;
        shouldUnlock = uniqueCategories.size >= 5;
        break;
    }

    if (shouldUnlock) {
      newAchievements.push({
        ...achievementTemplate,
        isUnlocked: true,
        unlockedAt: new Date(),
        progress: achievementTemplate.maxProgress,
      });
    }
  });

  return newAchievements;
};

/**
 * Calculate weekly progress
 */
export const calculateWeeklyProgress = (tasks: Task[], weeklyGoal: number = DEFAULT_WEEKLY_GOAL): number => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  
  const thisWeekCompleted = tasks.filter(task => {
    if (!task.completed || !task.createdAt) return false;
    const taskDate = new Date(task.createdAt);
    return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
  }).length;
  
  return thisWeekCompleted;
};

/**
 * Generate daily challenge
 */
export const generateDailyChallenge = (tasks: Task[], date: Date = new Date()): DailyChallenge => {
  const challenges = [
    {
      type: DAILY_CHALLENGE_TYPES.COMPLETE_TASKS,
      title: 'Task Crusher',
      description: 'Complete 3 tasks today',
      target: 3,
      points: 30,
    },
    {
      type: DAILY_CHALLENGE_TYPES.HIGH_PRIORITY,
      title: 'Priority Focus',
      description: 'Complete 2 high-priority tasks',
      target: 2,
      points: 40,
    },
    {
      type: DAILY_CHALLENGE_TYPES.CATEGORY_FOCUS,
      title: 'Category Master',
      description: 'Complete tasks in 3 different categories',
      target: 3,
      points: 35,
    },
  ];
  
  // Select challenge based on date (deterministic)
  const challengeIndex = date.getDate() % challenges.length;
  const selectedChallenge = challenges[challengeIndex];
  
  // Calculate current progress
  const todayTasks = tasks.filter(task => 
    task.completed && isToday(new Date(task.createdAt))
  );
  
  let progress = 0;
  switch (selectedChallenge.type) {
    case DAILY_CHALLENGE_TYPES.COMPLETE_TASKS:
      progress = todayTasks.length;
      break;
    case DAILY_CHALLENGE_TYPES.HIGH_PRIORITY:
      progress = todayTasks.filter(t => t.priority === 'high').length;
      break;
    case DAILY_CHALLENGE_TYPES.CATEGORY_FOCUS:
      progress = new Set(todayTasks.map(t => t.category)).size;
      break;
  }
  
  return {
    id: `challenge-${format(date, 'yyyy-MM-dd')}`,
    title: selectedChallenge.title,
    description: selectedChallenge.description,
    target: selectedChallenge.target,
    progress: Math.min(progress, selectedChallenge.target),
    points: selectedChallenge.points,
    isCompleted: progress >= selectedChallenge.target,
    date,
    type: selectedChallenge.type as any,
  };
};

/**
 * Update user stats after task completion
 */
export const updateUserStatsAfterTaskCompletion = (
  userStats: UserStats,
  task: Task,
  allTasks: Task[]
): { updatedStats: UserStats; pointsEarned: number; newAchievements: Achievement[] } => {
  const pointsEarned = calculateTaskPoints(task);
  const streaks = calculateStreak(allTasks);
  const newTotalPoints = userStats.totalPoints + pointsEarned;
  const newLevel = calculateLevel(newTotalPoints);
  const weeklyProgress = calculateWeeklyProgress(allTasks, userStats.weeklyGoal);
  
  const updatedStats: UserStats = {
    ...userStats,
    totalPoints: newTotalPoints,
    level: newLevel.level,
    currentLevelProgress: newTotalPoints - newLevel.minPoints,
    nextLevelThreshold: getPointsToNextLevel(newTotalPoints),
    tasksCompleted: userStats.tasksCompleted + 1,
    currentStreak: streaks.current,
    longestStreak: Math.max(userStats.longestStreak, streaks.longest),
    lastActivityDate: new Date(),
    weeklyProgress,
  };
  
  const newAchievements = checkAchievements(updatedStats, allTasks);
  
  // Add achievement points
  if (newAchievements.length > 0) {
    const achievementPoints = newAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
    updatedStats.totalPoints += achievementPoints;
    updatedStats.achievements = [...userStats.achievements, ...newAchievements];
  }
  
  return {
    updatedStats,
    pointsEarned: pointsEarned + (newAchievements.length > 0 ? newAchievements.reduce((sum, a) => sum + a.points, 0) : 0),
    newAchievements,
  };
};