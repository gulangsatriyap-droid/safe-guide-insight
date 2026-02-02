import { useState, useEffect, useCallback } from 'react';

export interface AutoConfirmState {
  isAutoConfirmed: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number; // 0-100, decreases as time runs out
}

interface UseAutoConfirmCountdownProps {
  /** Initial countdown time in seconds */
  initialSeconds?: number;
  /** Whether the countdown should run (e.g., only for AI-labeled items not yet human-annotated) */
  shouldRun: boolean;
  /** Whether already manually annotated by human (stops countdown) */
  isHumanAnnotated?: boolean;
  /** Callback when auto-confirm triggers */
  onAutoConfirm?: () => void;
}

/**
 * Hook to manage auto-confirm countdown for AI-labeled reports
 * When countdown reaches 0, the AI classification becomes final and locked
 */
export function useAutoConfirmCountdown({
  initialSeconds = 60, // Default 1 minute for demo; in production could be hours
  shouldRun,
  isHumanAnnotated = false,
  onAutoConfirm,
}: UseAutoConfirmCountdownProps): AutoConfirmState {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isAutoConfirmed, setIsAutoConfirmed] = useState(false);

  // Reset when props change
  useEffect(() => {
    if (isHumanAnnotated) {
      // If human annotated, countdown is irrelevant
      return;
    }
    if (!shouldRun) {
      setRemainingSeconds(initialSeconds);
      setIsAutoConfirmed(false);
    }
  }, [shouldRun, isHumanAnnotated, initialSeconds]);

  // Countdown logic
  useEffect(() => {
    if (!shouldRun || isHumanAnnotated || isAutoConfirmed) {
      return;
    }

    if (remainingSeconds <= 0) {
      setIsAutoConfirmed(true);
      onAutoConfirm?.();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldRun, isHumanAnnotated, isAutoConfirmed, remainingSeconds, onAutoConfirm]);

  const progress = (remainingSeconds / initialSeconds) * 100;

  return {
    isAutoConfirmed,
    remainingSeconds,
    totalSeconds: initialSeconds,
    progress,
  };
}

/**
 * Format seconds to MM:SS display
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get urgency level based on remaining time
 */
export function getUrgencyLevel(remainingSeconds: number, totalSeconds: number): 'normal' | 'warning' | 'critical' {
  const percentRemaining = (remainingSeconds / totalSeconds) * 100;
  if (percentRemaining <= 20) return 'critical';
  if (percentRemaining <= 50) return 'warning';
  return 'normal';
}
