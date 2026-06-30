import React from 'react';
import { Briefing } from '../types';
import { Target, AlertTriangle, HelpCircle, Activity, Lightbulb, Play } from 'lucide-react';

interface BriefingPanelProps {
  briefing: Briefing;
  onJumpToFocus: () => void;
}

export default function BriefingPanel({ briefing, onJumpToFocus }: BriefingPanelProps) {
  const isEmpty = !briefing.priorityTarget;

  return (
    <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full">
      {/* HUD Header Decor */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-right from-teal-400 via-cyan-500 to-transparent"></div>
      
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
        <div className="p-1.5 bg-teal-950 border border-teal-800/60 rounded text-teal-400">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-medium text-lg text-slate-100 tracking-wide flex items-center gap-2">
            STRATEGIC BRIEFING <span className="text-xs text-teal-400 font-mono border border-teal-500/30 px-1.5 py-0.5 rounded bg-teal-950/40 font-bold">TACTICAL HUD</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">CRITICAL ASSESSMENT &bull; RE-FOCUS ASSIGNMENT</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg h-[calc(100%-60px)]">
          <Activity className="w-10 h-10 mb-2 text-slate-600 animate-pulse" />
          <p className="font-mono text-xs">AWAITING MISSION START</p>
          <p className="text-[11px] text-slate-600 text-center px-4 mt-1">Strategic briefs materialize as soon as a task is initialized in Mission Control.</p>
        </div>
      ) : (
        <div className="space-y-4 font-sans text-sm">
          {/* Main 2-column or grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Priority Target */}
            <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60 hover:border-cyan-500/20 transition-all">
              <div className="flex items-center space-x-2 text-cyan-400 mb-1.5">
                <Target className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-mono font-bold tracking-wider">PRIORITY TARGET</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed leading-normal">
                {briefing.priorityTarget}
              </p>
            </div>

            {/* Risk Assessment */}
            <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60 hover:border-rose-500/20 transition-all">
              <div className="flex items-center space-x-2 text-rose-400 mb-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-mono font-bold tracking-wider">RISK ASSESSMENT</span>
              </div>
              <p className="text-slate-200 text-xs leading-normal">
                {briefing.riskAssessment}
              </p>
            </div>

            {/* Bottlenecks */}
            <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60 hover:border-amber-500/20 transition-all">
              <div className="flex items-center space-x-2 text-amber-400 mb-1.5">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-mono font-bold tracking-wider">BOTTLENECKS IDENTIFIED</span>
              </div>
              <p className="text-slate-200 text-xs leading-normal">
                {briefing.bottlenecks}
              </p>
            </div>

            {/* Motivation */}
            <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60 hover:border-teal-500/20 transition-all">
              <div className="flex items-center space-x-2 text-teal-400 mb-1.5">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-mono font-bold tracking-wider">OFFICER MOTIVATION</span>
              </div>
              <p className="text-slate-200 text-xs italic leading-normal">
                "{briefing.motivation}"
              </p>
            </div>

          </div>

          {/* Recommended Next Step - Highly highlighted full-width block */}
          <div className="mt-4 bg-teal-950/20 border border-teal-500/30 rounded-lg p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <span className="inline-block text-[9px] font-mono font-bold text-teal-400 border border-teal-400/40 px-1.5 py-0.5 rounded bg-teal-950/50 mb-2 tracking-wider">
              60-SECOND RECONNAISSANCE ACTION
            </span>
            
            <h4 className="text-slate-100 font-medium text-sm mb-1">
              Immediate Physical Step Required:
            </h4>
            
            <p className="text-teal-300 text-xs leading-relaxed font-sans mb-3">
              {briefing.recommendedNext}
            </p>

            <button
              onClick={onJumpToFocus}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-display font-bold text-xs uppercase py-2 px-4 rounded transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ENGAGE DISASTER RECOVERY TIMER</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
