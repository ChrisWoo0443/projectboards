import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Settings, Timer, Coffee, ChevronDown, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'work' | 'break';

interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
}

const WORK_DURATION_OPTIONS = [15, 20, 25, 30, 35, 40, 45, 50, 60];
const BREAK_DURATION_OPTIONS = [5, 10, 15, 20, 25, 30];

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
};

export const HeaderPomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60); // in seconds
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setTimeLeft(parsed.workDuration * 60);
      } catch (error) {
        console.error('Failed to load Pomodoro settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: PomodoroSettings) => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
  };

  // Timer logic
  useEffect(() => {
    if (timerState === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, timeLeft]);

  // Handle session completion
  useEffect(() => {
    if (timeLeft === 0 && timerState === 'running') {
      handleSessionComplete();
    }
  }, [timeLeft, timerState]);

  const handleSessionComplete = () => {
    setTimerState('idle');
    
    if (sessionType === 'work') {
      setSessionsCompleted(prev => prev + 1);
      setSessionType('break');
      setTimeLeft(settings.breakDuration * 60);
      
      toast({
        title: "Work session complete! 🎉",
        description: `Time for a ${settings.breakDuration}-minute break!`,
      });
      
      playNotificationSound();
    } else {
      setSessionType('work');
      setTimeLeft(settings.workDuration * 60);
      
      toast({
        title: "Break time over! ⚡",
        description: `Ready for another ${settings.workDuration}-minute work session?`,
      });
      
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not available');
    }
  };

  const startTimer = () => {
    setTimerState('running');
  };

  const pauseTimer = () => {
    setTimerState('paused');
  };

  const stopTimer = () => {
    setTimerState('idle');
    setSessionType('work');
    setTimeLeft(settings.workDuration * 60);
  };

  const resetTimer = () => {
    setTimerState('idle');
    setTimeLeft(sessionType === 'work' ? settings.workDuration * 60 : settings.breakDuration * 60);
  };

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Reset timer if idle
    if (timerState === 'idle') {
      setTimeLeft(sessionType === 'work' ? newSettings.workDuration * 60 : newSettings.breakDuration * 60);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = sessionType === 'work' ? settings.workDuration * 60 : settings.breakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

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