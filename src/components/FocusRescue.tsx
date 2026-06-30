import React, { useState, useEffect, useRef } from 'react';
import { Task, Milestone, ActionStep } from '../types';
import { Play, Pause, RotateCcw, AlertOctagon, Sparkles, Target, Zap, Shield, HelpCircle, CheckSquare, Square } from 'lucide-react';
import { generateRefocusPlan } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface FocusRescueProps {
  activeTask: Task | null;
  onToggleStep: (taskId: string, milestoneId: string, stepId: string) => void;
  onSessionComplete: (timeSavedMinutes: number) => void;
}

export default function FocusRescue({ activeTask, onToggleStep, onSessionComplete }: FocusRescueProps) {
  // Timer settings
  const [sessionLength, setSessionLength] = useState<number>(15 * 60); // Default 15 minutes in seconds
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerProgress, setTimerProgress] = useState<number>(100);

  // Re-focus helper
  const [customOverwhelmInfo, setCustomOverwhelmInfo] = useState<string>('');
  const [refocusAdvice, setRefocusAdvice] = useState<string>('');
  const [isRefocusLoading, setIsRefocusLoading] = useState<boolean>(false);
  const [isAdviceOpen, setIsAdviceOpen] = useState<boolean>(false);

  // Active step details
  const [activeStep, setActiveStep] = useState<{ milestone: Milestone; step: ActionStep } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer when session length changes
  useEffect(() => {
    setSecondsLeft(sessionLength);
    setIsTimerRunning(false);
  }, [sessionLength]);

  // Find the very first uncompleted action step in the active task
  useEffect(() => {
    if (!activeTask) {
      setActiveStep(null);
      return;
    }

    let found = false;
    for (const milestone of activeTask.milestones) {
      for (const step of milestone.steps) {
        if (!step.completed) {
          setActiveStep({ milestone, step });
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      setActiveStep(null);
    }
  }, [activeTask]);

  // Core countdown ticker
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer completed!
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            onSessionComplete(Math.round(sessionLength / 60));
            alert("Focus block completed! Your streak multiplier is active. Log your progress in Mission Control.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, sessionLength, onSessionComplete]);

  // Compute timer circular or bar progress percentage
  useEffect(() => {
    setTimerProgress((secondsLeft / sessionLength) * 100);
  }, [secondsLeft, sessionLength]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsLeft(sessionLength);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Call Gemini to get tactical recovery suggestions
  const handleRefocusRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    setIsRefocusLoading(true);
    setRefocusAdvice('');
    setIsAdviceOpen(true);

    const promptText = customOverwhelmInfo.trim() || "Feeling anxious, losing momentum on the current step.";
    try {
      const advice = await generateRefocusPlan(activeTask, promptText);
      setRefocusAdvice(advice);
    } catch (err) {
      setRefocusAdvice("Controlled fallback reset: Stop, turn off all screens except your main workspace, write one line of code or one sentence, and count that as a success. Micro-actions build compound velocity.");
    } finally {
      setIsRefocusLoading(false);
    }
  };

  if (!activeTask) {
    return (
      <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 shadow-2xl h-full flex flex-col items-center justify-center text-center">
        <AlertOctagon className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
        <h3 className="font-display font-medium text-lg text-slate-300">FOCUS RESCUE OFFLINE</h3>
        <p className="text-xs text-slate-500 font-mono mt-1 max-w-sm">
          No active rescue mission loaded. Select or initialize a task in Mission Control to trigger high-intensity tactical isolation.
        </p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-[#0d1428]/80 border border-cyan-500/20 rounded-xl p-5 shadow-[0_0_25px_rgba(6,182,212,0.08)] relative overflow-hidden h-full">
      {/* Decorative Neon Laser Border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      
      {/* Sub header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-medium text-base text-slate-100 tracking-wide flex items-center gap-2">
              DISTRACTION-FREE ISOLATION <span className="text-[10px] text-cyan-400 font-mono border border-cyan-500/40 px-1.5 py-0.2 bg-cyan-950/60 rounded">ACTIVE</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">MISSION OPERATIVE MODE &bull; POMODORO PROTOCOL</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-mono block">MISSION TIME REMAINING</span>
          <span className="text-xs text-rose-400 font-mono font-bold animate-pulse">CRITICAL BOUNDS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Pomodoro Timer and Isolation View */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Timer Display */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative">
            
            {/* HUD Circle Visualizer representation */}
            <div className="relative w-44 h-44 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="rgba(15, 23, 42, 0.8)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke={isTimerRunning ? "#22d3ee" : "#14b8a6"}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="276.4"
                  animate={{ strokeDashoffset: 276.4 - (276.4 * timerProgress) / 100 }}
                  transition={{ duration: 0.5, ease: "linear" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-mono font-bold tracking-widest text-slate-100 glow-cyan">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest mt-1">
                  {isTimerRunning ? "ISOLATION LIVE" : "TIMER INACTIVE"}
                </span>
              </div>
            </div>

            {/* Timer Controllers */}
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() => setSessionLength(10 * 60)}
                className={`text-[10px] font-mono border px-2.5 py-1 rounded cursor-pointer ${
                  sessionLength === 10 * 60 ? 'border-cyan-400 bg-cyan-950/40 text-cyan-400' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                10M SPRINT
              </button>
              <button
                onClick={() => setSessionLength(15 * 60)}
                className={`text-[10px] font-mono border px-2.5 py-1 rounded cursor-pointer ${
                  sessionLength === 15 * 60 ? 'border-cyan-400 bg-cyan-950/40 text-cyan-400' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                15M TACTICAL
              </button>
              <button
                onClick={() => setSessionLength(25 * 60)}
                className={`text-[10px] font-mono border px-2.5 py-1 rounded cursor-pointer ${
                  sessionLength === 25 * 60 ? 'border-cyan-400 bg-cyan-950/40 text-cyan-400' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                25M CLIMAX
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTimer}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isTimerRunning
                    ? 'bg-rose-500/20 border border-rose-500 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSE CONFLICT</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ENGAGE BLOCK</span>
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="p-2 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* SINGLE TASK ONLY CONTAINER */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center space-x-1.5 text-cyan-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">CURRENT ISOLATION TARGET</span>
            </div>

            {activeStep ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 font-bold">
                    {activeStep.milestone.timeBlock}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    Milestone: {activeStep.milestone.title}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded border border-slate-800/60 flex items-start space-x-3">
                  <button
                    onClick={() => onToggleStep(activeTask.id, activeStep.milestone.id, activeStep.step.id)}
                    type="button"
                    className="mt-0.5 shrink-0 focus:outline-none"
                  >
                    <Square className="w-5 h-5 text-cyan-400 hover:text-cyan-300" />
                  </button>
                  <div className="flex-1">
                    <p className="text-slate-100 text-xs leading-relaxed font-medium">
                      {activeStep.step.text}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">
                      &bull; Complete this single action step to advance. Ignore all other code.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-slate-500 font-mono text-xs">
                🎉 ALL COGNITIVE ROADMAP CHECKBOXES MET!
                <p className="text-[10px] text-slate-600 font-sans mt-1">Excellent disaster recovery. Save your task metrics now.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: AI Help Me Re-Focus panel */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-amber-400 mb-3">
              <Zap className="w-4.5 h-4.5 text-amber-400" />
              <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-slate-200">TACTICAL RECOVERY ASSISTANCE</h4>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal mb-3">
              Feeling stuck, blocked, or experiencing deadline-induced panic? Tell the officer what's going wrong for an instant, specialized micro-refocus adjustment.
            </p>

            <form onSubmit={handleRefocusRequest} className="space-y-3">
              <textarea
                value={customOverwhelmInfo}
                onChange={(e) => setCustomOverwhelmInfo(e.target.value)}
                placeholder="E.g., I'm stuck on writing the database controller, or I am feeling dizzy and stressed out..."
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/60 placeholder-slate-600 min-h-[60px] resize-none font-sans"
              />

              <button
                type="submit"
                disabled={isRefocusLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 font-display font-semibold text-[11px] py-2 px-3 rounded flex items-center justify-center space-x-2 tracking-wide cursor-pointer uppercase transition-all"
              >
                {isRefocusLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>RECOGNIZING SOLUTION STATUS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CALCULATE MICRO-RECOVERY</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Collapsible/Animated Advice Output Box */}
          <AnimatePresence>
            {isAdviceOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-cyan-950/15 border border-cyan-500/30 rounded-xl p-4 relative"
              >
                <button
                  onClick={() => setIsAdviceOpen(false)}
                  className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 font-mono text-[10px] uppercase border border-slate-800 px-1 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>

                <div className="flex items-center space-x-1.5 text-cyan-400 mb-1.5">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-mono font-bold tracking-wider">OFFICER RE-FOCUS DIRECTIVES</span>
                </div>

                {isRefocusLoading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-3 bg-cyan-950/40 rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-cyan-950/40 rounded animate-pulse w-4/5"></div>
                    <div className="h-3 bg-cyan-950/40 rounded animate-pulse w-2/3"></div>
                  </div>
                ) : (
                  <p className="text-slate-200 text-xs leading-relaxed font-sans font-medium bg-slate-950/50 p-3 rounded border border-cyan-500/10">
                    {refocusAdvice}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
