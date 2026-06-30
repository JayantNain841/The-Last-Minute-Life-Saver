import React, { useState, useRef } from 'react';
import { Task, TaskCategory } from '../types';
import { generateDecompositionPlan } from '../services/gemini';
import { Plus, Trash2, Calendar, Clock, AlertCircle, FileText, Upload, ShieldAlert, Sparkles, FolderOpen, Flame, Play } from 'lucide-react';

interface MissionControlProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  activeTaskId: string | null;
  countdowns: Record<string, string>;
}

export default function MissionControl({
  tasks,
  onAddTask,
  onDeleteTask,
  onSelectTask,
  activeTaskId,
  countdowns
}: MissionControlProps) {
  // Form State
  const [prompt, setPrompt] = useState<string>('');
  const [category, setCategory] = useState<TaskCategory>('Study');
  const [urgencyScore, setUrgencyScore] = useState<number>(8);
  const [estimatedHours, setEstimatedHours] = useState<number>(3);
  const [deadlineTime, setDeadlineTime] = useState<string>('');
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; content?: string } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  // Handle manual file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Process file details
  const processFile = (file: File) => {
    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    
    // Simulate parsing the text content to augment prompt if it's a text file
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          content: text.substring(0, 300) // Keep the first 300 characters
        });
      };
      reader.readAsText(file);
    } else {
      setUploadedFile({
        name: file.name,
        size: sizeStr
      });
    }
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit and create the strategic decomposition plan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    const targetObjective = prompt.trim();
    if (!targetObjective) {
      setErrorText('Operational error: You must enter a critical objective scenario first.');
      return;
    }

    if (!deadlineTime) {
      setErrorText('Operational error: You must configure a deadline target timestamp.');
      return;
    }

    setIsLoading(true);

    // If a file context was uploaded, augment the prompt before sending to AI
    let augmentedPrompt = targetObjective;
    if (uploadedFile) {
      augmentedPrompt += ` [CONTEXT ATTACHED: File name is "${uploadedFile.name}".`;
      if (uploadedFile.content) {
        augmentedPrompt += ` Core contents snippet: "${uploadedFile.content}"`;
      }
      augmentedPrompt += ']';
    }

    try {
      // Call Gemini Service
      const plan = await generateDecompositionPlan(augmentedPrompt, category, estimatedHours);

      const newTask: Task = {
        id: 'task_' + Date.now().toString(),
        title: targetObjective,
        category: category,
        urgencyScore: urgencyScore,
        estimatedHours: estimatedHours,
        deadline: new Date(deadlineTime).toISOString(),
        progress: 0,
        completed: false,
        milestones: plan.milestones,
        briefing: plan.briefing
      };

      onAddTask(newTask);
      
      // Reset form fields
      setPrompt('');
      setUploadedFile(null);
      setDeadlineTime('');
    } catch (err) {
      setErrorText('Failed to construct tactical roadmap. Comms server is currently offline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: Tactical Plan Generator Form */}
      <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glowing header bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-teal-400 to-transparent"></div>
        
        <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
          <div className="p-1.5 bg-cyan-950 border border-cyan-850 rounded text-cyan-400 animate-pulse">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-slate-100 tracking-wide uppercase">
              RESCUE SEQUENCE GENERATOR
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">INITIALIZE NEW CRISIS DECOMPOSITION ROADMAP</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Main objective prompt input */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
              PANIC OBJECTIVE SCENARIO (THE CRISIS)
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. DSA assignment due in 3 hours, or Front-end Dev technical interview tomorrow morning..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 text-xs font-sans focus:ring-1 focus:ring-cyan-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                TACTICAL SECTOR CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 text-xs cursor-pointer font-sans"
              >
                <option value="Study">📚 Study / Exams / Homework</option>
                <option value="Career">🎙️ Career / Job Interviews / Resumes</option>
                <option value="Project">💻 Code Project / Engineering Sprints</option>
                <option value="Personal">🌟 Personal Emergency / Conflicts</option>
                <option value="Administrative">📑 Admin Tasks / Taxes / Government Filing</option>
              </select>
            </div>

            {/* Target deadline */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> TARGET DEADLINE TIMESTAMP
              </label>
              <input
                type="datetime-local"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 text-xs font-mono cursor-pointer"
                required
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Urgency Score slider */}
            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider">URGENCY COEFFICIENT (1-10)</span>
                <span className={`font-bold px-1.5 py-0.2 rounded ${urgencyScore >= 8 ? 'text-rose-400 bg-rose-950/40' : 'text-cyan-400 bg-cyan-950/40'}`}>
                  {urgencyScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={urgencyScore}
                onChange={(e) => setUrgencyScore(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-mono uppercase">
                <span>Routine</span>
                <span className="text-rose-500/70">Extreme Panic</span>
              </div>
            </div>

            {/* Estimated Hours remaining */}
            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider">ESTIMATED EXECUTING HOURS</span>
                <span className="text-cyan-400 font-bold">
                  {estimatedHours} Hours
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full accent-teal-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-500 font-mono uppercase">
                <span>30 Mins</span>
                <span>12 Hours Limit</span>
              </div>
            </div>

          </div>

          {/* FILE UPLOAD CARD */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
              ATTACH CRISIS REFERENCE MATERIALS (OPTIONAL SYLLABUS, RUBRICS, CODES)
            </span>
            
            <div
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-3.5 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-950/20' 
                  : uploadedFile 
                    ? 'border-teal-500/30 bg-teal-950/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx,image/*"
                className="hidden"
              />

              {uploadedFile ? (
                <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded border border-teal-500/20 text-left">
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="p-1.5 bg-teal-950/40 border border-teal-500/30 rounded text-teal-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs text-slate-200 font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{uploadedFile.size} &bull; PARSED INTELLIGENCE</p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded font-mono text-[9px] uppercase border border-slate-900 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1 text-slate-500">
                  <Upload className="w-5 h-5 text-slate-400 animate-bounce" />
                  <p className="text-xs text-slate-300 font-medium font-sans">
                    Drag and drop file here, or <span className="text-cyan-400 hover:underline">browse files</span>
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    SUPPORTED: PDF, DOCX, TXT, IMAGES &bull; AUTO CONTEXT COMPRESSION
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error and Loading indicators */}
          {errorText && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-[11px] flex items-start space-x-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-rose-400" />
              <span>{errorText}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-display font-bold uppercase py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] flex items-center justify-center space-x-2 text-xs tracking-wider cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <span>TACTICAL COMPILATION IN PROGRESS (GEMINI ENGAGED)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                <span>SYNTHESIZE DEFENSIVE PLAN</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* SECTION 2: Active Task HUD Grid */}
      <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        
        <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
          <div className="p-1.5 bg-cyan-950 border border-cyan-850 rounded text-cyan-400">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-slate-100 tracking-wide uppercase">
              ACTIVE CRISIS DECKS
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">REAL-TIME TIME-TO-COLLAPSE COUNTDOWNS</p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
            <AlertCircle className="w-9 h-9 mb-2 text-slate-600 animate-pulse" />
            <p className="font-mono text-xs text-slate-400">NO SECURE TARGET DECKS ENGAGED</p>
            <p className="text-[11px] text-slate-600 text-center max-w-xs mt-1">
              Initialize a panic scenario above. A chronological 4-stage rescue pipeline will be compiled automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const isActive = task.id === activeTaskId;
              const isUrgent = task.urgencyScore >= 8;
              const remainingTimeStr = countdowns[task.id] || '--:--:--';

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={`border rounded-xl p-4 transition-all duration-300 relative cursor-pointer group flex flex-col justify-between ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-950/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
                  }`}
                >
                  {/* Glowing micro marker for active deck */}
                  {isActive && (
                    <div className="absolute top-0 right-10 w-16 h-[2px] bg-cyan-400 glow-cyan"></div>
                  )}

                  {/* Header info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isUrgent
                          ? 'bg-rose-950/40 text-rose-400 border-rose-500/20 animate-pulse'
                          : 'bg-cyan-950/40 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {task.category.toUpperCase()} &bull; URGENCY {task.urgencyScore}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task.id);
                        }}
                        className="p-1 border border-transparent hover:border-rose-500/40 text-slate-600 hover:text-rose-400 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Purge Task Deck"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-slate-200 font-sans font-semibold text-xs leading-normal mb-3 group-hover:text-cyan-300 transition-colors">
                      {task.title}
                    </h4>
                  </div>

                  {/* Countdown telemetry bar */}
                  <div className="space-y-2 mt-auto">
                    <div className="bg-slate-950/80 rounded-lg border border-slate-900 p-2 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[10px]">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>TIME TO DEADLINE:</span>
                      </div>
                      <span className={`font-mono text-xs font-bold tracking-widest ${
                        remainingTimeStr.includes('-') 
                          ? 'text-slate-500' 
                          : isUrgent 
                            ? 'text-rose-400 animate-pulse glow-rose' 
                            : 'text-cyan-400'
                      }`}>
                        {remainingTimeStr}
                      </span>
                    </div>

                    {/* Progress tracking line */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">PIPELINE METRICS:</span>
                      <span className="text-slate-300 font-semibold">{task.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-800/40">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
