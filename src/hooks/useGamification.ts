import { useState, useEffect, useCallback } from 'react';
import { UserStats, Achievement, PointsTransaction, DailyChallenge } from '../types/gamification';
import { Task } from '../types/kanban';
import { ACHIEVEMENTS, calculateLevel, DEFAULT_WEEKLY_GOAL } from '../constants/gamification';
import {
  updateUserStatsAfterTaskCompletion,
  generateDailyChallenge,
  calculateWeeklyProgress,
  calculateStreak,
} from '../utils/gamificationUtils';

const STORAGE_KEY = 'projectboards_gamification';

// Default user stats
const getDefaultUserStats = (): UserStats => {
  const level = calculateLevel(0);
  return {
    totalPoints: 0,
    level: level.level,
    currentLevelProgress: 0,
    nextLevelThreshold: level.maxPoints + 1,
    tasksCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      isUnlocked: false,
      progress: 0,
    })),
    weeklyGoal: DEFAULT_WEEKLY_GOAL,
    weeklyProgress: 0,
  };
};

export const useGamification = (tasks: Task[]) => {
  const [userStats, setUserStats] = useState<UserStats>(getDefaultUserStats);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [awardedTaskIds, setAwardedTaskIds] = useState<Set<string>>(new Set());

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserStats(parsed.userStats || getDefaultUserStats());
        setPointsHistory(parsed.pointsHistory || []);
        setAwardedTaskIds(new Set(parsed.awardedTaskIds || []));
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load gamification data:', error);
        setIsLoaded(true);
      }
    } else {
      setIsLoaded(true);
    }
  }, []);

  // Save data to localStorage
  const saveData = useCallback((stats: UserStats, history: PointsTransaction[], taskIds: Set<string>) => {
    try {
      const dataToSave = {
        userStats: stats,
        pointsHistory: history,
        awardedTaskIds: Array.from(taskIds),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save gamification data:', error);
    }
  }, []);

  // Update stats when tasks change
  useEffect(() => {
    if (!isLoaded) return;

    const streaks = calculateStreak(tasks);
    const weeklyProgress = calculateWeeklyProgress(tasks, userStats.weeklyGoal);
    const completedTasks = tasks.filter(task => task.completed).length;

    // Update stats if they've changed
    if (
      userStats.currentStreak !== streaks.current ||
      userStats.longestStreak !== streaks.longest ||
      userStats.weeklyProgress !== weeklyProgress ||
      userStats.tasksCompleted !== completedTasks
    ) {
      const updatedStats = {
        ...userStats,
        currentStreak: streaks.current,
        longestStreak: Math.max(userStats.longestStreak, streaks.longest),
        weeklyProgress,
        tasksCompleted: completedTasks,
      };
      setUserStats(updatedStats);
      saveData(updatedStats, pointsHistory, awardedTaskIds);
    }
  }, [tasks, userStats, pointsHistory, isLoaded, saveData, awardedTaskIds]);

  // Generate daily challenge
  useEffect(() => {
    if (!isLoaded) return;
    
    const today = new Date();
    const challenge = generateDailyChallenge(tasks, today);
    setDailyChallenge(challenge);
  }, [tasks, isLoaded]);

  // Handle task completion
  const handleTaskCompletion = useCallback((task: Task) => {
    if (!task.completed) return;
    
    // Prevent duplicate point awards for the same task
    if (awardedTaskIds.has(task.id)) {
      return;
    }

    const previousLevel = userStats.level;
    const { updatedStats, pointsEarned, newAchievements } = updateUserStatsAfterTaskCompletion(
      userStats,
      task,
      tasks
    );

    // Create points transaction
    const transaction: PointsTransaction = {
      id: `transaction-${Date.now()}`,
      type: 'task_completed',
      points: pointsEarned,
      description: `Completed: ${task.title}`,
      timestamp: new Date(),
      taskId: task.id,
    };

    const newHistory = [transaction, ...pointsHistory].slice(0, 100); // Keep last 100 transactions
    const newAwardedTaskIds = new Set([...awardedTaskIds, task.id]);

    setUserStats(updatedStats);
    setPointsHistory(newHistory);
    setAwardedTaskIds(newAwardedTaskIds);
    saveData(updatedStats, newHistory, newAwardedTaskIds);

    // Show level up notification
    if (updatedStats.level > previousLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }

    // Show achievement notifications
    if (newAchievements.length > 0) {
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          setShowAchievement(achievement);
          setTimeout(() => setShowAchievement(null), 3000);
        }, index * 1000);
      });
    }
  }, [userStats, tasks, pointsHistory, saveData]);

  // Update weekly goal
  const updateWeeklyGoal = useCallback((newGoal: number) => {
    const updatedStats = {
      ...userStats,
      weeklyGoal: newGoal,
    };
    setUserStats(updatedStats);
    saveData(updatedStats, pointsHistory, awardedTaskIds);
  }, [userStats, pointsHistory, saveData, awardedTaskIds]);

  // Reset gamification data
  const resetGamification = useCallback(() => {
    const defaultStats = getDefaultUserStats();
    const emptyTaskIds = new Set<string>();
    setUserStats(defaultStats);
    setPointsHistory([]);
    setAwardedTaskIds(emptyTaskIds);
    saveData(defaultStats, [], emptyTaskIds);
  }, [saveData]);

  // Get achievement by ID
  const getAchievement = useCallback((id: string): Achievement | undefined => {
    return userStats.achievements.find(achievement => achievement.id === id);
  }, [userStats.achievements]);

  // Get unlocked achievements
  const getUnlockedAchievements = useCallback((): Achievement[] => {
    return userStats.achievements.filter(achievement => achievement.isUnlocked);
  }, [userStats.achievements]);

  // Get locked achievements
  const getLockedAchievements = useCallback((): Achievement[] => {
    return userStats.achievements.filter(achievement => !achievement.isUnlocked);
  }, [userStats.achievements]);

  // Get recent points history
  const getRecentPointsHistory = useCallback((limit: number = 10): PointsTransaction[] => {
    return pointsHistory.slice(0, limit);
  }, [pointsHistory]);

  return {
    // State
    userStats,
    pointsHistory,
    dailyChallenge,
    showLevelUp,
    showAchievement,
    isLoaded,

    // Actions
    handleTaskCompletion,
    updateWeeklyGoal,
    resetGamification,

    // Getters
    getAchievement,
    getUnlockedAchievements,
    getLockedAchievements,
    getRecentPointsHistory,

    // Notifications
    setShowLevelUp,
    setShowAchievement,
  };
};