import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TelemetryStats } from './types';
import MissionControl from './components/MissionControl';
import DecompositionEngine from './components/DecompositionEngine';
import BriefingPanel from './components/BriefingPanel';
import FocusRescue from './components/FocusRescue';
import ChatAssistant from './components/ChatAssistant';
import AnalyticsPanel from './components/AnalyticsPanel';
import { LayoutDashboard, Compass, Timer, Terminal, BarChart2, ShieldCheck, Clock, Radio, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Seeding standard high-yield tutorial/welcome task to showcase system immediately
const INITIAL_WELCOME_TASK: Task = {
  id: 'task_welcome_guide',
  title: 'Review System Capabilities & Execute Emergency Drill',
  category: 'Study',
  urgencyScore: 9,
  estimatedHours: 1.5,
  deadline: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(), // 1.5 hours from now
  progress: 16,
  completed: false,
  milestones: [
    {
      id: 'm1',
      title: 'Initialize Emergency HUD & Calibrate Comms',
      timeBlock: 'Mins 0 - 20',
      steps: [
        { id: 'm1_s1', text: 'Locate the Mission Control module on the top HUD nav bar.', completed: true },
        { id: 'm1_s2', text: 'Select an active crisis task deck from the available panels.', completed: true },
        { id: 'm1_s3', text: 'Review the tactical Briefing Panel below to identify bottlenecks.', completed: false }
      ]
    },
    {
      id: 'm2',
      title: 'Engage Distraction-Free Focus block',
      timeBlock: 'Mins 20 - 45',
      steps: [
        { id: 'm2_s1', text: 'Toggle to the Focus Rescue tab and start the 15-minute tactical block timer.', completed: false },
        { id: 'm2_s2', text: 'Locate your current single isolation target checkbox.', completed: false },
        { id: 'm2_s3', text: 'If stuck or experiencing friction, click "Calculate Micro-Recovery" for AI coaching.', completed: false }
      ]
    },
    {
      id: 'm3',
      title: 'Consult AI Tactical Co-pilot',
      timeBlock: 'Mins 45 - 70',
      steps: [
        { id: 'm3_s1', text: 'Open the Officer Terminal to interface directly with the Gemini chat system.', completed: false },
        { id: 'm3_s2', text: 'Trigger a mock interview sequence or ask for a study concept summary.', completed: false },
        { id: 'm3_s3', text: 'Adjust deadlines or prune secondary requirements via natural language conversation.', completed: false }
      ]
    },
    {
      id: 'm4',
      title: 'Deploy Completed Deliverable',
      timeBlock: 'Mins 70 - 90',
      steps: [
        { id: 'm4_s1', text: 'Complete all steps and check off the entire task matrix.', completed: false },
        { id: 'm4_s2', text: 'Check the Telemetry Analytics tab to review badges and performance stamina curves.', completed: false },
        { id: 'm4_s3', text: 'Celebrate saving your high-stakes deadline under pressure.', completed: false }
      ]
    }
  ],
  briefing: {
    priorityTarget: 'Survive the initial emergency welcome sequence and learn to decompose deadlines.',
    riskAssessment: 'Getting distracted by non-critical notifications, wasting time building custom layouts.',
    bottlenecks: 'Initial cognitive friction, unfamiliarity with the Tactical cyber dashboard controls.',
    recommendedNext: 'Toggle the checkable tasks inside the TACTICAL DECOMPOSITION accordion grid to start.',
    motivation: 'A perfect concept doesn\'t compile; a timely deliverable wins. Welcome to Last-Minute Rescue operations. Stand by!'
  }
};

export default function App() {
  // Global State Decks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mission' | 'decomp' | 'focus' | 'chat' | 'stats'>('mission');
  
  const [stats, setStats] = useState<TelemetryStats>({
    streak: 1,
    completedCount: 0,
    timeSaved: 0,
    focusSessions: 0
  });

  // Clocks
  const [currentTime, setCurrentTime] = useState<string>('');
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  // 1. Initial State Seed from LocalStorage
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('saver_tasks');
      const storedStats = localStorage.getItem('saver_stats');

      if (storedTasks) {
        const parsed = JSON.parse(storedTasks);
        setTasks(parsed);
        if (parsed.length > 0) {
          setActiveTaskId(parsed[0].id);
        }
      } else {
        // First load welcome task
        setTasks([INITIAL_WELCOME_TASK]);
        setActiveTaskId(INITIAL_WELCOME_TASK.id);
        localStorage.setItem('saver_tasks', JSON.stringify([INITIAL_WELCOME_TASK]));
      }

      if (storedStats) {
        setStats(JSON.parse(storedStats));
      } else {
        localStorage.setItem('saver_stats', JSON.stringify({
          streak: 1,
          completedCount: 0,
          timeSaved: 0,
          focusSessions: 0
        }));
      }
    } catch (e) {
      console.error("Failed to seed initial local state", e);
    }
  }, []);

  // Update UTC and local clock tick
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Compute countdown ticker every second
  useEffect(() => {
    const timer = setInterval(() => {
      const updatedCountdowns: Record<string, string> = {};
      
      tasks.forEach((task) => {
        const diffMs = new Date(task.deadline).getTime() - Date.now();
        
        if (diffMs <= 0) {
          updatedCountdowns[task.id] = 'DEADLINE REJECTED';
        } else {
          const totalSeconds = Math.floor(diffMs / 1000);
          const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
          const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
          const seconds = (totalSeconds % 60).toString().padStart(2, '0');
          updatedCountdowns[task.id] = `${hours}:${minutes}:${seconds}`;
        }
      });

      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks]);

  // Helper: Get currently active task
  const activeTask = tasks.find((t) => t.id === activeTaskId) || null;

  // Handle adding new task
  const handleAddTask = (newTask: Task) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    setActiveTaskId(newTask.id);
    localStorage.setItem('saver_tasks', JSON.stringify(updated));
    
    // Switch view immediately to Decomposition for immediate tactical breakdown
    setActiveTab('decomp');
  };

  // Handle deleting task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    localStorage.setItem('saver_tasks', JSON.stringify(updated));

    if (activeTaskId === taskId) {
      setActiveTaskId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Toggle a milestone step completed state
  const handleToggleStep = (taskId: string, milestoneId: string, stepId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;

      // Mutate step
      let totalStepsCount = 0;
      let completedStepsCount = 0;

      const updatedMilestones = task.milestones.map((m) => {
        const updatedSteps = m.steps.map((s) => {
          let updatedCompleted = s.completed;
          if (m.id === milestoneId && s.id === stepId) {
            updatedCompleted = !s.completed;
          }
          totalStepsCount++;
          if (updatedCompleted) completedStepsCount++;
          return { ...s, completed: updatedCompleted };
        });
        return { ...m, steps: updatedSteps };
      });

      const newProgress = totalStepsCount > 0 
        ? Math.round((completedStepsCount / totalStepsCount) * 100) 
        : 0;

      const previouslyCompleted = task.completed;
      const nowCompleted = newProgress === 100;

      // If task newly completed, trigger stats increment
      if (nowCompleted && !previouslyCompleted) {
        triggerTaskCompletionAward(task.estimatedHours);
      }

      return {
        ...task,
        milestones: updatedMilestones,
        progress: newProgress,
        completed: nowCompleted
      };
    });

    setTasks(updatedTasks);
    localStorage.setItem('saver_tasks', JSON.stringify(updatedTasks));
  };

  // Award user stats for completing a task
  const triggerTaskCompletionAward = (estimatedHours: number) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        completedCount: prev.completedCount + 1,
        timeSaved: prev.timeSaved + estimatedHours,
        streak: prev.streak + (prev.completedCount % 2 === 0 ? 1 : 0) // Slowly increment streak multiplier
      };
      localStorage.setItem('saver_stats', JSON.stringify(updated));
      return updated;
    });
  };

  // Award user stats for completing a focus session
  const handleFocusSessionComplete = (minutesSaved: number) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        focusSessions: prev.focusSessions + 1,
        timeSaved: prev.timeSaved + Number((minutesSaved / 60).toFixed(1))
      };
      localStorage.setItem('saver_stats', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectTask = (taskId: string) => {
    setActiveTaskId(taskId);
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col relative hud-grid">
      
      {/* Decorative Outer Aura Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[150px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* TACTICAL HEADER HUD */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md px-4 py-3.5 flex flex-col md:flex-row items-center justify-between sticky top-0 z-40">
        
        {/* Left header: App Title and logo */}
        <div className="flex items-center space-x-3 mb-2 md:mb-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-slate-950 font-bold tracking-wider text-sm shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            Ω
          </div>
          <div>
            <h1 className="font-display font-bold text-base tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 flex items-center gap-2">
              THE LAST-MINUTE LIFE SAVER <span className="text-[9px] text-cyan-400 font-mono border border-cyan-500/30 px-1.5 py-0.2 rounded bg-cyan-950/40 font-bold">V1.2</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">SECURE DIGITAL DEADLINE RESOLUTION ENGINE &bull; COGNITIVE TRACE</p>
          </div>
        </div>

        {/* Right header: Telemetry logs & clock */}
        <div className="flex items-center space-x-4 font-mono text-[10px]">
          <div className="hidden sm:flex items-center space-x-1.5 text-teal-400 bg-teal-950/40 border border-teal-500/20 px-2 py-1 rounded">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold tracking-wider">COMMS ONLINE</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SYS CLOCK:</span>
            <span className="font-bold text-cyan-400 tracking-wider font-mono">{currentTime || '10:46:44'}</span>
          </div>
        </div>

      </header>

      {/* CORE HUD TABS NAVIGATION */}
      <nav className="bg-slate-950/30 border-b border-slate-900 px-4 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex space-x-2 min-w-[500px]">
          <button
            onClick={() => setActiveTab('mission')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'mission'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.08)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-semibold">MISSION CONTROL</span>
          </button>

          <button
            onClick={() => setActiveTab('decomp')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'decomp'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.08)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="font-semibold">DECOMPOSITION ROADMAP</span>
          </button>

          <button
            onClick={() => setActiveTab('focus')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'focus'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.08)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Timer className="w-4 h-4 animate-pulse" />
            <span className="font-semibold">FOCUS RESCUE WINDOW</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.08)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span className="font-semibold">OFFICER TERMINAL</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-xs tracking-wider transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.08)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="font-semibold">TELEMETRY ANALYTICS</span>
          </button>
        </div>
      </nav>

      {/* MAIN VIEWPORT LAYOUT */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        
        {/* Dynamic Dual-Sidebar Setup on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Main Workspace Frame (9 columns on lg, full on tablet/mobile) */}
          <div className="lg:col-span-8 space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'mission' && (
                  <MissionControl
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                    onSelectTask={handleSelectTask}
                    activeTaskId={activeTaskId}
                    countdowns={countdowns}
                  />
                )}

                {activeTab === 'decomp' && (
                  <div className="space-y-5">
                    {activeTask ? (
                      <>
                        <DecompositionEngine
                          task={activeTask}
                          onToggleStep={handleToggleStep}
                        />
                        <BriefingPanel
                          briefing={activeTask.briefing}
                          onJumpToFocus={() => setActiveTab('focus')}
                        />
                      </>
                    ) : (
                      <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-8 text-center py-16">
                        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
                        <h4 className="font-display font-medium text-slate-300">NO ROADMAP CONSTRUCTED</h4>
                        <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
                          Construct a strategic rescue task inside Mission Control to generate a step-by-step 15-minute chronological execution roadmap.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'focus' && (
                  <FocusRescue
                    activeTask={activeTask}
                    onToggleStep={handleToggleStep}
                    onSessionComplete={handleFocusSessionComplete}
                  />
                )}

                {activeTab === 'chat' && (
                  <ChatAssistant activeTask={activeTask} />
                )}

                {activeTab === 'stats' && (
                  <AnalyticsPanel stats={stats} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT PERSISTENT SIDEBAR PANEL (Desktop-only: 4 columns) */}
          <div className="hidden lg:col-span-4 space-y-4 lg:sticky lg:top-[85px]">
            
            {/* Telemetry Status Core */}
            <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-500 block mb-2 uppercase">STAMINA DECK CITATIONS</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-teal-950 border border-teal-500/20 text-teal-400 rounded">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">Salvaged Hours</span>
                    <span className="text-[9px] font-mono text-slate-500">Cumulative Time</span>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-teal-400">{stats.timeSaved}h</span>
              </div>
            </div>

            {/* Quick Active Task Mini deck */}
            <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">ACTIVE TARGET DIRECTIVE</span>
                <span className="text-[9px] font-mono text-cyan-400">HUD PERSISTENCE</span>
              </div>

              {activeTask ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-slate-200 font-sans font-medium text-xs leading-normal line-clamp-2 pr-2">
                      {activeTask.title}
                    </h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-cyan-500/20 text-cyan-400 bg-cyan-950/40">
                      {activeTask.category}
                    </span>
                  </div>

                  {/* Countdown representation */}
                  <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-850">
                    <span className="text-[10px] font-mono text-slate-400">CRISIS TIME LIMIT:</span>
                    <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                      {countdowns[activeTask.id] || '00:00:00'}
                    </span>
                  </div>

                  {/* Quick completion checklist preview */}
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pt-1">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">STAGE OUTLINE CHECK:</span>
                    {activeTask.milestones.slice(0, 2).map((m, idx) => {
                      const doneCount = m.steps.filter((s) => s.completed).length;
                      return (
                        <div key={m.id} className="flex items-center justify-between text-[11px] bg-slate-900/30 p-1.5 rounded">
                          <span className="text-slate-400 truncate pr-1">
                            {idx + 1}. {m.title}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400 shrink-0 font-bold">
                            {doneCount}/3
                          </span>
                        </div>
                      );
                    })}
                    {activeTask.milestones.length > 2 && (
                      <p className="text-[9px] text-slate-500 text-center italic mt-0.5">
                        + {activeTask.milestones.length - 2} more stages. Click Decomp tab to view.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-mono text-center py-4 italic">
                  Awaiting directive initialization...
                </p>
              )}
            </div>

            {/* Quick coaching instructions box */}
            <div className="backdrop-blur-md bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">OPERATIVE PRINCIPLES</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Anxiety is caused by un-decomposed scope. Focus exclusively on the single physical action step shown in the Rescue Window. Action defeats panic.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-3 px-4 bg-slate-950/60 text-center font-mono text-[9px] text-slate-600 mt-10">
        <p>&copy; 2026 THE LAST-MINUTE LIFE SAVER. BUILT ON SERVER-SIDE INTEL GROUNDING &bull; GEMINI CO-PILOT CONFIG.</p>
      </footer>

    </div>
  );
}
