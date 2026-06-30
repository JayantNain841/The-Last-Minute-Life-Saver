import React from 'react';
import { TelemetryStats } from '../types';
import { Award, Zap, Trophy, TrendingUp, Compass, Clock, Flame } from 'lucide-react';

interface AnalyticsPanelProps {
  stats: TelemetryStats;
}

export default function AnalyticsPanel({ stats }: AnalyticsPanelProps) {
  // Define badges based on stats
  const badges = [
    {
      id: 'b1',
      title: 'Zero Panic Operator',
      desc: 'First successful high-stakes crisis resolution completed.',
      condition: stats.completedCount >= 1,
      icon: Trophy,
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/20'
    },
    {
      id: 'b2',
      title: 'Deep Focus Specialist',
      desc: 'Engaged and survived at least 1 high-intensity Pomodoro block.',
      condition: stats.focusSessions >= 1,
      icon: Flame,
      color: 'text-rose-400 border-rose-500/40 bg-rose-950/20'
    },
    {
      id: 'b3',
      title: 'Clutch Time Salvager',
      desc: 'Recovered and salvaged more than 3 hours of high-risk deadlines.',
      condition: stats.timeSaved >= 3,
      icon: Clock,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20'
    },
    {
      id: 'b4',
      title: 'Relentless Executioner',
      desc: 'Maintained a solid 2x or greater multi-day completion velocity.',
      condition: stats.streak >= 2,
      icon: Zap,
      color: 'text-teal-400 border-teal-500/40 bg-teal-950/20'
    }
  ];

  // Calculate generic index metrics
  const totalBadgesUnlocked = badges.filter(b => b.condition).length;
  const tacticalEfficiencyScore = Math.min(
    100,
    Math.round((stats.completedCount * 15) + (stats.focusSessions * 10) + (stats.timeSaved * 4) + 10)
  );

  return (
    <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full">
      {/* Decorative Border Glow */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-400 via-cyan-400 to-transparent"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-slate-950 border border-slate-800 rounded text-teal-400">
            <TrendingUp className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="font-display font-medium text-base text-slate-100 tracking-wide flex items-center gap-2">
              TELEMETRY &amp; GAMIFICATION <span className="text-[10px] text-teal-400 font-mono border border-teal-500/30 px-1.5 py-0.2 rounded bg-teal-950/40 font-bold">LIVE METRICS</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">OPERATOR VELOCITY &bull; BADGE DEPLOYMENTS</p>
          </div>
        </div>
      </div>

      {/* Grid Metrics Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        
        {/* Streak multiplier */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 relative overflow-hidden group">
          <div className="absolute top-1 right-2 opacity-5 font-mono text-3xl font-bold text-teal-400 group-hover:scale-110 transition-transform">STREAK</div>
          <span className="text-[10px] font-mono text-slate-400 block mb-1">STREAK MULTIPLIER</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-teal-400 glow-teal">{stats.streak}x</span>
            <span className="text-[10px] text-teal-500/80 font-mono">VELOCITY</span>
          </div>
        </div>

        {/* Tasks completed */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 relative overflow-hidden group">
          <div className="absolute top-1 right-2 opacity-5 font-mono text-3xl font-bold text-cyan-400 group-hover:scale-110 transition-transform">SAVED</div>
          <span className="text-[10px] font-mono text-slate-400 block mb-1">RESCUED OBJECTIVES</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-cyan-400 glow-cyan">{stats.completedCount}</span>
            <span className="text-[10px] text-cyan-500/80 font-mono">TASKS</span>
          </div>
        </div>

        {/* Time saved */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 relative overflow-hidden group">
          <div className="absolute top-1 right-2 opacity-5 font-mono text-3xl font-bold text-rose-400 group-hover:scale-110 transition-transform">HOURS</div>
          <span className="text-[10px] font-mono text-slate-400 block mb-1">EST. HOURS SALVAGED</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-rose-400 glow-rose">{stats.timeSaved}h</span>
            <span className="text-[10px] text-rose-500/80 font-mono">TIME SAVED</span>
          </div>
        </div>

        {/* Focus sessions */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 relative overflow-hidden group">
          <div className="absolute top-1 right-2 opacity-5 font-mono text-3xl font-bold text-amber-400 group-hover:scale-110 transition-transform">FOCUS</div>
          <span className="text-[10px] font-mono text-slate-400 block mb-1">FOCUS SESSIONS</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-mono font-bold text-amber-400">{stats.focusSessions}</span>
            <span className="text-[10px] text-amber-500/80 font-mono">COMPLETED</span>
          </div>
        </div>

      </div>

      {/* Center Row: Custom SVG Curve + Tactical Efficiency bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
        
        {/* Tactical Efficiency curve block */}
        <div className="md:col-span-7 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">HUD COGNITIVE SYNERGY SCORE</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{tacticalEfficiencyScore}% INDEX</span>
            </div>
            
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800/60 mb-4">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500 transition-all duration-500" 
                style={{ width: `${tacticalEfficiencyScore}%` }}
              />
            </div>
          </div>

          {/* SVG Micro Area Chart representing mental stamina projection */}
          <div className="pt-2">
            <span className="text-[9px] font-mono text-slate-500 block mb-2 uppercase">STAMINA DECAY VS TACTICAL ACTION SPEED</span>
            <div className="relative h-24 w-full bg-slate-950/80 border border-slate-800 rounded p-1">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                {/* Grid guidelines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(34, 211, 238, 0.05)" strokeWidth="0.5" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(34, 211, 238, 0.05)" strokeWidth="0.5" />
                
                {/* Unrecovered fatigue path (red/pink line) */}
                <path
                  d="M 0,25 C 20,24 40,28 60,29 C 80,30 90,29 100,30"
                  fill="none"
                  stroke="rgba(244, 63, 94, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Tactical speed recovery curve (cyan line) */}
                <path
                  d={`M 0,28 Q 15,10 40,15 T 70,5 T 100,${30 - (tacticalEfficiencyScore / 4.5)}`}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />

                {/* Indicator dot */}
                <circle cx="100" cy={30 - (tacticalEfficiencyScore / 4.5)} r="1.5" fill="#22d3ee" className="animate-ping" />
              </svg>
              <div className="absolute bottom-1 left-2 text-[8px] font-mono text-slate-500">T-MINUS INCREMENTAL VELOCITY</div>
              <div className="absolute top-1 right-2 text-[8px] font-mono text-cyan-400 uppercase">SIGNAL SYNERGY ENGAGED</div>
            </div>
          </div>
        </div>

        {/* Medals and unlocking index */}
        <div className="md:col-span-5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">MEDAL INVENTORY</span>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 border border-teal-500/20 px-1.5 py-0.2 rounded font-bold">
              {totalBadgesUnlocked}/4 UNLOCKED
            </span>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal mb-3">
            Earn official military-grade crisis recovery citations by completing your active milestones and focus sessions on time.
          </p>

          <div className="flex items-center space-x-3 justify-center py-2 bg-slate-950/60 border border-slate-800/40 rounded-lg">
            {badges.map((b) => {
              const IconComp = b.icon;
              return (
                <div 
                  key={b.id} 
                  className={`p-2.5 rounded-lg border transition-transform hover:scale-105 relative group ${
                    b.condition 
                      ? b.color
                      : 'border-slate-900 bg-slate-900/10 text-slate-700'
                  }`}
                  title={`${b.title}: ${b.desc}`}
                >
                  <IconComp className="w-5 h-5" />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 bg-slate-950 text-slate-100 text-[9px] p-2 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-normal">
                    <p className="font-bold uppercase text-[10px] text-slate-200 mb-0.5">{b.title}</p>
                    <p className="text-slate-400">{b.desc}</p>
                    <p className="text-[8px] font-mono mt-1 font-semibold text-teal-400">
                      {b.condition ? 'CITATIVE STATUS: UNLOCKED' : 'CITATIVE STATUS: ENCRYPTED'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Badges details grid */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono text-slate-500 block uppercase">BADGES MATRIX</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {badges.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div 
                key={badge.id}
                className={`p-3 rounded-lg border flex items-center space-x-3 ${
                  badge.condition 
                    ? 'border-slate-800 bg-slate-900/20' 
                    : 'border-slate-950 bg-slate-950/20 opacity-40'
                }`}
              >
                <div className={`p-2 rounded-lg border shrink-0 ${
                  badge.condition ? badge.color : 'bg-slate-900 border-slate-800 text-slate-700'
                }`}>
                  <IconComponent className="w-4.5 h-4.5" />
                </div>
                <div className="truncate">
                  <h4 className={`text-xs font-semibold ${badge.condition ? 'text-slate-200' : 'text-slate-600'}`}>
                    {badge.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
