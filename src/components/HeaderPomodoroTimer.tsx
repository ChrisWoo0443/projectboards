import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Settings, Timer, Coffee, ChevronDown, RotateCcw } from 'lucide-react';
import { usePomodoro, WORK_DURATION_OPTIONS, BREAK_DURATION_OPTIONS } from '@/hooks/usePomodoro';

export const HeaderPomodoroTimer: React.FC = () => {
  const {
    settings,
    timeLeft,
    timerState,
    sessionType,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    updateSettings,
    formatTime,
    getProgress,
  } = usePomodoro();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getSessionIcon = () => {
    return sessionType === 'work' ? <Timer className="h-3 w-3" /> : <Coffee className="h-3 w-3" />;
  };

  const getTimerButtonVariant = () => {
    if (timerState === 'running') return 'default';
    if (timerState === 'paused') return 'secondary';
    return 'outline';
  };

  const getTimerButtonText = () => {
    if (timerState === 'idle') return 'Timer';
    return formatTime(timeLeft);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={getTimerButtonVariant()} 
          className="flex items-center gap-2 min-w-[100px]"
        >
          {getSessionIcon()}
          <span className="font-mono text-sm">{getTimerButtonText()}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {getSessionIcon()}
                Pomodoro Timer
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={sessionType === 'work' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {sessionType === 'work' ? 'Work' : 'Break'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Sessions: {sessionsCompleted}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {showSettings && (
              <div className="space-y-3 p-3 bg-muted rounded-lg">
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Work Duration
                  </label>
                  <Select
                    value={settings.workDuration.toString()}
                    onValueChange={(value) => 
                      updateSettings({ ...settings, workDuration: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_DURATION_OPTIONS.map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Break Duration
                  </label>
                  <Select
                    value={settings.breakDuration.toString()}
                    onValueChange={(value) => 
                      updateSettings({ ...settings, breakDuration: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BREAK_DURATION_OPTIONS.map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-3xl font-mono font-bold mb-2">
                {formatTime(timeLeft)}
              </div>
              <Progress value={getProgress()} className="h-1.5 mb-3" />
            </div>
            
            <div className="flex justify-center gap-2">
              {timerState === 'idle' && (
                <>
                  <Button onClick={startTimer} size="sm" className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Start
                  </Button>
                  <Button onClick={resetTimer} variant="outline" size="sm" className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                </>
              )}
              
              {timerState === 'running' && (
                <>
                  <Button onClick={pauseTimer} variant="outline" size="sm" className="flex items-center gap-1">
                    <Pause className="h-3 w-3" />
                    Pause
                  </Button>
                  <Button onClick={stopTimer} variant="destructive" size="sm" className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    Stop
                  </Button>
                  <Button onClick={resetTimer} variant="outline" size="sm" className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                </>
              )}
              
              {timerState === 'paused' && (
                <>
                  <Button onClick={startTimer} size="sm" className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Resume
                  </Button>
                  <Button onClick={stopTimer} variant="outline" size="sm" className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    Stop
                  </Button>
                  <Button onClick={resetTimer} variant="outline" size="sm" className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                </>
              )}
            </div>
            
            <div className="text-center text-xs text-muted-foreground">
              <p>Work: {settings.workDuration}min • Break: {settings.breakDuration}min</p>
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};