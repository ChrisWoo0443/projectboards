import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Settings, Timer, Coffee } from 'lucide-react';
import { usePomodoro, WORK_DURATION_OPTIONS, BREAK_DURATION_OPTIONS } from '@/hooks/usePomodoro';

export const PomodoroTimer: React.FC = () => {
  const {
    settings,
    timeLeft,
    timerState,
    sessionType,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    stopTimer,
    updateSettings,
    formatTime,
    getProgress,
  } = usePomodoro();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    setIsSettingsOpen(false);
  };

  const getSessionIcon = () => {
    return sessionType === 'work' ? <Timer className="h-4 w-4" /> : <Coffee className="h-4 w-4" />;
  };

  const getSessionColor = () => {
    return sessionType === 'work' ? 'bg-blue-500' : 'bg-green-500';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getSessionIcon()}
            Pomodoro Timer
          </CardTitle>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Work Duration (minutes)
                  </label>
                  <Select
                    value={settings.workDuration.toString()}
                    onValueChange={(value) => 
                      handleUpdateSettings({ ...settings, workDuration: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_DURATION_OPTIONS.map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Break Duration (minutes)
                  </label>
                  <Select
                    value={settings.breakDuration.toString()}
                    onValueChange={(value) => 
                      handleUpdateSettings({ ...settings, breakDuration: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BREAK_DURATION_OPTIONS.map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant={sessionType === 'work' ? 'default' : 'secondary'} className={getSessionColor()}>
            {sessionType === 'work' ? 'Work Session' : 'Break Time'}
          </Badge>
          <Badge variant="outline">
            Sessions: {sessionsCompleted}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold mb-4">
            {formatTime(timeLeft)}
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>
        
        <div className="flex justify-center gap-2">
          {timerState === 'idle' && (
            <Button onClick={startTimer} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start
            </Button>
          )}
          
          {timerState === 'running' && (
            <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          
          {timerState === 'paused' && (
            <>
              <Button onClick={startTimer} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Resume
              </Button>
              <Button onClick={stopTimer} variant="outline" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
          
          {timerState === 'running' && (
            <Button onClick={stopTimer} variant="destructive" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Work: {settings.workDuration}min • Break: {settings.breakDuration}min</p>
        </div>
      </CardContent>
    </Card>
  );
};