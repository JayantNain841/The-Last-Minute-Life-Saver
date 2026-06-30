import React, { useState } from 'react';
import { Milestone, Task } from '../types';
import { CheckSquare, Square, ChevronDown, ChevronUp, Zap, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DecompositionEngineProps {
  task: Task;
  onToggleStep: (taskId: string, milestoneId: string, stepId: string) => void;
}

export default function DecompositionEngine({ task, onToggleStep }: DecompositionEngineProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(
    task.milestones[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedMilestone(expandedMilestone === id ? null : id);
  };

  const getMilestoneProgress = (m: Milestone) => {
    const completed = m.steps.filter((s) => s.completed).length;
    return Math.round((completed / m.steps.length) * 100);
  };

  return (
    <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full">
      {/* HUD Header Glow */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-right from-cyan-500 via-teal-400 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-950 border border-cyan-800/60 rounded text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-medium text-lg text-slate-100 tracking-wide flex items-center gap-2">
              TACTICAL DECOMPOSITION <span className="text-xs text-cyan-400 font-mono border border-cyan-500/30 px-1.5 py-0.5 rounded bg-cyan-950/40">AI ENGINE</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">CHRONOLOGICAL ROADMAP &bull; SPEED-STAGED</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-mono block">TASK INTEGRITY</span>
          <span className="text-sm font-mono text-cyan-400 font-bold">{task.progress}% COMPLETE</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full mb-6 overflow-hidden border border-slate-800/40">
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-500 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${task.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {task.milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-lg">
          <Clock className="w-10 h-10 mb-2 text-slate-600" />
          <p className="font-mono text-xs">NO DECOMPOSITION MATRIX DETECTED</p>
          <p className="text-[11px] text-slate-600 text-center px-4 mt-1">Please enter your task objective in Mission Control to synthesize a strategic roadmap.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {task.milestones.map((milestone, idx) => {
            const isExpanded = expandedMilestone === milestone.id;
            const mProgress = getMilestoneProgress(milestone);
            const isMilestoneCompleted = mProgress === 100;

            return (
              <div 
                key={milestone.id}
                className={`border rounded-lg transition-all duration-300 ${
                  isMilestoneCompleted 
                    ? 'border-teal-500/30 bg-teal-950/5' 
                    : isExpanded 
                      ? 'border-cyan-500/40 bg-slate-950/40' 
                      : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/20'
                }`}
              >
                {/* Milestone Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(milestone.id)}
                  className="w-full text-left p-4 flex items-center justify-between focus:outline-none"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`font-mono text-xs px-2 py-1 rounded font-bold shrink-0 border ${
                      isMilestoneCompleted 
                        ? 'bg-teal-950 text-teal-400 border-teal-500/40' 
                        : 'bg-cyan-950 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {milestone.timeBlock}
                    </div>
                    <div className="truncate pr-2">
                      <h4 className={`text-sm font-medium ${isMilestoneCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {idx + 1}. {milestone.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        {isMilestoneCompleted ? (
                          <span className="text-teal-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> STAGE COMPLETE</span>
                        ) : (
                          <span>EXECUTION WINDOW &bull; {milestone.steps.filter(s => s.completed).length}/3 ACTIONS</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-2 shrink-0">
                    <div className="w-12 text-right">
                      <span className={`text-xs font-mono font-bold ${isMilestoneCompleted ? 'text-teal-400' : 'text-cyan-400'}`}>
                        {mProgress}%
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Milestone Steps Accordion */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-800/50"
                    >
                      <div className="p-4 space-y-3 bg-slate-950/30">
                        {milestone.steps.map((step) => (
                          <div 
                            key={step.id}
                            onClick={() => onToggleStep(task.id, milestone.id, step.id)}
                            className={`flex items-start space-x-3 p-2 rounded cursor-pointer transition-all ${
                              step.completed 
                                ? 'bg-teal-950/10 hover:bg-teal-950/20 text-slate-400' 
                                : 'hover:bg-slate-800/40 text-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              className="mt-0.5 shrink-0 focus:outline-none"
                            >
                              {step.completed ? (
                                <CheckSquare className="w-4.5 h-4.5 text-teal-400" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-cyan-400 hover:text-cyan-300" />
                              )}
                            </button>
                            <span className={`text-xs font-sans select-none leading-relaxed flex-1 ${step.completed ? 'line-through text-slate-500' : ''}`}>
                              {step.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
