import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { UserStats, Achievement, PointsTransaction, DailyChallenge } from '../types/gamification';
import { LEVELS } from '../constants/gamification';
import { Trophy, Target, Flame, Calendar, Star, Award, TrendingUp, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface GamificationDashboardProps {
  userStats: UserStats;
  pointsHistory: PointsTransaction[];
  dailyChallenge: DailyChallenge | null;
  onUpdateWeeklyGoal: (goal: number) => void;
  onResetData: () => void;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  userStats,
  pointsHistory,
  dailyChallenge,
  onUpdateWeeklyGoal,
  onResetData,
}) => {
  const currentLevel = LEVELS.find(level => level.level === userStats.level) || LEVELS[0];
  const nextLevel = LEVELS.find(level => level.level === userStats.level + 1);
  
  const unlockedAchievements = userStats.achievements.filter(a => a.isUnlocked);
  const lockedAchievements = userStats.achievements.filter(a => !a.isUnlocked);
  
  const progressPercentage = nextLevel 
    ? (userStats.currentLevelProgress / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const weeklyProgressPercentage = (userStats.weeklyProgress / userStats.weeklyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">{currentLevel.icon}</div>
              <div>
                <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">Level {userStats.level}</p>
                <p className="text-sm text-muted-foreground">{currentLevel.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.tasksCompleted}</p>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Level Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {userStats.level} - {currentLevel.title}</span>
              {nextLevel && (
                <span>Next: Level {nextLevel.level} - {nextLevel.title}</span>
              )}
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentLevel.minPoints + userStats.currentLevelProgress} points</span>
              {nextLevel && <span>{nextLevel.minPoints} points needed</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Daily Challenge */}
          {dailyChallenge && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Daily Challenge</span>
                  {dailyChallenge.isCompleted && (
                    <Badge variant="secondary" className="ml-auto">
                      <Star className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{dailyChallenge.title}</h4>
                    <p className="text-sm text-muted-foreground">{dailyChallenge.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{dailyChallenge.progress}/{dailyChallenge.target}</span>
                    </div>
                    <Progress 
                      value={(dailyChallenge.progress / dailyChallenge.target) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      {dailyChallenge.points} points
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Weekly Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tasks Completed This Week</span>
                    <span>{userStats.weeklyProgress}/{userStats.weeklyGoal}</span>
                  </div>
                  <Progress value={weeklyProgressPercentage} className="h-3" />
                </div>
                {weeklyProgressPercentage >= 100 && (
                  <Badge variant="secondary" className="w-fit">
                    <Star className="h-3 w-3 mr-1" />
                    Goal Achieved!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Best Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <span className="text-2xl font-bold">{userStats.longestStreak}</span>
                  <span className="text-muted-foreground">days</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-purple-500" />
                  <span className="text-2xl font-bold">{unlockedAchievements.length}</span>
                  <span className="text-muted-foreground">/ {userStats.achievements.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="space-y-4">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Unlocked Achievements ({unlockedAchievements.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="grid gap-3">
                      {unlockedAchievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-3 p-3 rounded-lg border bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                        >
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            {achievement.unlockedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Unlocked {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">
                            {achievement.points} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Locked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Locked Achievements ({lockedAchievements.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="grid gap-3">
                    {lockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border opacity-60"
                      >
                        <div className="text-2xl grayscale">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.maxProgress && achievement.maxProgress > 1 && (
                            <div className="mt-2">
                              <Progress 
                                value={((achievement.progress || 0) / achievement.maxProgress) * 100} 
                                className="h-1" 
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {achievement.progress || 0} / {achievement.maxProgress}
                              </p>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline">
                          {achievement.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {pointsHistory.length > 0 ? (
                  <div className="space-y-2">
                    {pointsHistory.slice(0, 20).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.timestamp), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          +{transaction.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No activity yet. Complete some tasks to see your progress!
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gamification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Weekly Goal</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={userStats.weeklyGoal}
                    onChange={(e) => onUpdateWeeklyGoal(parseInt(e.target.value) || 1)}
                    className="flex h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="text-sm text-muted-foreground">tasks per week</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="destructive" 
                  onClick={onResetData}
                  className="w-full"
                >
                  Reset All Progress
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will permanently delete all your gamification progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};