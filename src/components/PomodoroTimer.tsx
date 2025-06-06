import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Settings, Timer, Coffee } from 'lucide-react';
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

export const PomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60); // in seconds
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
      
      // Play notification sound (optional)
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
    // Create a simple beep sound
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

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Reset timer if idle
    if (timerState === 'idle') {
      setTimeLeft(sessionType === 'work' ? newSettings.workDuration * 60 : newSettings.breakDuration * 60);
    }
    
    setIsSettingsOpen(false);
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
                      updateSettings({ ...settings, workDuration: parseInt(value) })
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
                      updateSettings({ ...settings, breakDuration: parseInt(value) })
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