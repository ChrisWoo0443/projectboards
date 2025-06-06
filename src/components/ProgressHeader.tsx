import React from 'react';
import { Flame } from 'lucide-react';
import { UserStats, DailyChallenge } from '../types/gamification';
import { getCurrentLevel } from '../utils/gamificationUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { GamificationDashboard } from './GamificationDashboard';

interface ProgressHeaderProps {
  userStats: UserStats;
  dailyChallenge: DailyChallenge | null;
  pointsHistory: any[];
  onUpdateWeeklyGoal: (goal: number) => void;
  onResetData: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  userStats,
  dailyChallenge,
  pointsHistory,
  onUpdateWeeklyGoal,
  onResetData,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const currentLevel = getCurrentLevel(userStats);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center space-x-3 px-3 py-2 h-10 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
          {/* Level Icon and Info */}
          <div className="flex items-center space-x-2">
            <div className="text-xl">{currentLevel.icon}</div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">Lvl {userStats.level}</span>
              <span className="text-xs text-muted-foreground">{userStats.totalPoints} pts</span>
            </div>
          </div>
          
          {/* Streak */}
          {userStats.currentStreak > 0 && (
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{userStats.currentStreak}</span>
            </div>
          )}
        </div>
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
};