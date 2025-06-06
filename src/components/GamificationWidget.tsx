import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { UserStats, DailyChallenge } from '../types/gamification';
import { LEVELS } from '../constants/gamification';
import { getCurrentLevel, getNextLevel } from '../utils/gamificationUtils';
import { GamificationDashboard } from './GamificationDashboard';
import { Trophy, Flame, Target, Star, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

interface GamificationWidgetProps {
  userStats: UserStats;
  dailyChallenge: DailyChallenge | null;
  pointsHistory: any[];
  onUpdateWeeklyGoal: (goal: number) => void;
  onResetData: () => void;
  compact?: boolean;
}

export const GamificationWidget: React.FC<GamificationWidgetProps> = ({
  userStats,
  dailyChallenge,
  pointsHistory,
  onUpdateWeeklyGoal,
  onResetData,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLevel = getCurrentLevel(userStats);
  const nextLevel = getNextLevel(userStats);
  
  const progressPercentage = nextLevel 
    ? (userStats.currentLevelProgress / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const weeklyProgressPercentage = (userStats.weeklyProgress / userStats.weeklyGoal) * 100;

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="h-auto p-2 flex items-center space-x-2">
            <div className="text-lg">{currentLevel.icon}</div>
            <div className="text-left">
              <div className="text-sm font-medium">{userStats.totalPoints} pts</div>
              <div className="text-xs text-muted-foreground">Level {userStats.level}</div>
            </div>
            {userStats.currentStreak > 0 && (
              <div className="flex items-center space-x-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs">{userStats.currentStreak}</span>
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gamification Dashboard</DialogTitle>
          </DialogHeader>
          <GamificationDashboard
            userStats={userStats}
            pointsHistory={pointsHistory}
            dailyChallenge={dailyChallenge}
            onUpdateWeeklyGoal={onUpdateWeeklyGoal}
            onResetData={onResetData}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">{currentLevel.icon}</div>
            <div>
              <h3 className="font-semibold">Level {userStats.level}</h3>
              <p className="text-sm text-muted-foreground">{currentLevel.title}</p>
            </div>
          </div>
          <Badge variant="secondary">
            {userStats.totalPoints} pts
          </Badge>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Level Progress</span>
            {nextLevel && (
              <span>{userStats.currentLevelProgress}/{nextLevel.minPoints - currentLevel.minPoints}</span>
            )}
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold">{userStats.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">{userStats.tasksCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">
                {userStats.achievements.filter(a => a.isUnlocked).length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Daily Challenge</span>
              </div>
              {dailyChallenge.isCompleted && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Done
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm">{dailyChallenge.title}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{dailyChallenge.progress}/{dailyChallenge.target}</span>
                <span>{dailyChallenge.points} pts</span>
              </div>
              <Progress 
                value={(dailyChallenge.progress / dailyChallenge.target) * 100} 
                className="h-1 mt-1" 
              />
            </div>
          </div>
        )}

        {/* Weekly Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Weekly Goal</span>
            </div>
            {weeklyProgressPercentage >= 100 && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Done
              </Badge>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{userStats.weeklyProgress}/{userStats.weeklyGoal} tasks</span>
              <span>{Math.round(weeklyProgressPercentage)}%</span>
            </div>
            <Progress value={weeklyProgressPercentage} className="h-1 mt-1" />
          </div>
        </div>

        {/* View Details Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" size="sm">
              View Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gamification Dashboard</DialogTitle>
            </DialogHeader>
            <GamificationDashboard
              userStats={userStats}
              pointsHistory={pointsHistory}
              dailyChallenge={dailyChallenge}
              onUpdateWeeklyGoal={onUpdateWeeklyGoal}
              onResetData={onResetData}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Mini widget for header
export const GamificationMiniWidget: React.FC<{
  userStats: UserStats;
  onClick: () => void;
}> = ({ userStats, onClick }) => {
  const currentLevel = getCurrentLevel(userStats);
  
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-auto p-2 flex items-center space-x-3 hover:bg-accent"
    >
      {/* Level Icon */}
      <div className="text-xl">{currentLevel.icon}</div>
      
      {/* Stats */}
      <div className="flex items-center space-x-3 text-sm">
        <div className="flex items-center space-x-1">
          <span className="font-medium">{userStats.totalPoints}</span>
          <span className="text-muted-foreground">pts</span>
        </div>
        
        {userStats.currentStreak > 0 && (
          <div className="flex items-center space-x-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span>{userStats.currentStreak}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span>{userStats.achievements.filter(a => a.isUnlocked).length}</span>
        </div>
      </div>
    </Button>
  );
};