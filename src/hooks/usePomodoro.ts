import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'work' | 'break';

interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
}

export const WORK_DURATION_OPTIONS = [15, 20, 25, 30, 35, 40, 45, 50, 60];
export const BREAK_DURATION_OPTIONS = [5, 10, 15, 20, 25, 30];

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
};

export const usePomodoro = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60); // in seconds
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
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

  return {
    // State
    settings,
    timeLeft,
    timerState,
    sessionType,
    sessionsCompleted,
    
    // Actions
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    updateSettings,
    
    // Utilities
    formatTime,
    getProgress,
  };
};

export type { TimerState, SessionType, PomodoroSettings };