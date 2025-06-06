import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Trophy, Star, Target, Zap } from 'lucide-react';
import { Achievement } from '@/types/gamification';
import { LEVELS } from '@/constants/gamification';
import { getAchievementCategoryColor } from '@/utils/colorUtils';
import { cn } from '@/lib/utils';

interface LevelUpNotificationProps {
  level: number;
  show: boolean;
  onClose: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  level,
  show,
  onClose,
}) => {
  const levelInfo = LEVELS.find(l => l.level === level) || LEVELS[0];

  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-500">
      <Card className="w-80 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wide">Level Up!</span>
              </div>
              <h3 className="text-lg font-bold mt-1">
                Level {level} - {levelInfo.title}
              </h3>
              <p className="text-sm opacity-90 mt-1">
                You've reached a new level! {levelInfo.icon}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface AchievementNotificationProps {
  achievement: Achievement | null;
  show: boolean;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  show,
  onClose,
}) => {
  useEffect(() => {
    if (show && achievement) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, achievement, onClose]);

  if (!show || !achievement) return null;



  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-500">
      <Card className={cn(
        "w-80 text-white border-0 shadow-lg bg-gradient-to-r",
        getAchievementCategoryColor(achievement.category)
      )}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {achievement.icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wide">Achievement Unlocked!</span>
              </div>
              <h3 className="text-lg font-bold mt-1">
                {achievement.title}
              </h3>
              <p className="text-sm opacity-90 mt-1">
                {achievement.description}
              </p>
              <div className="flex items-center justify-between mt-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  +{achievement.points} points
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white border-white/30 capitalize">
                  {achievement.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface PointsNotificationProps {
  points: number;
  description: string;
  show: boolean;
  onClose: () => void;
}

export const PointsNotification: React.FC<PointsNotificationProps> = ({
  points,
  description,
  show,
  onClose,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-40 animate-in slide-in-from-right-full duration-300">
      <Card className="w-64 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <div>
              <p className="font-medium">+{points} points</p>
              <p className="text-sm opacity-90">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Combined notifications component
interface GamificationNotificationsProps {
  userLevel: number;
  showLevelUp: boolean;
  showAchievement: Achievement | null;
  onCloseLevelUp: () => void;
  onCloseAchievement: () => void;
}

export const GamificationNotifications: React.FC<GamificationNotificationsProps> = ({
  userLevel,
  showLevelUp,
  showAchievement,
  onCloseLevelUp,
  onCloseAchievement,
}) => {
  return (
    <>
      <LevelUpNotification
        level={userLevel}
        show={showLevelUp}
        onClose={onCloseLevelUp}
      />
      <AchievementNotification
        achievement={showAchievement}
        show={!!showAchievement}
        onClose={onCloseAchievement}
      />
    </>
  );
};