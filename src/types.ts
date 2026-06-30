export type TaskCategory = 'Career' | 'Study' | 'Project' | 'Personal' | 'Administrative';

export interface ActionStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  timeBlock: string; // e.g., "00:00 - 00:15" or "First 15 Mins"
  steps: ActionStep[];
}

export interface Briefing {
  priorityTarget: string;
  riskAssessment: string;
  bottlenecks: string;
  recommendedNext: string;
  motivation: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  urgencyScore: number; // 1 to 10
  estimatedHours: number;
  deadline: string; // ISO date string or local time representation
  progress: number; // 0 to 100
  completed: boolean;
  milestones: Milestone[];
  briefing: Briefing;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string; // ISO timestamp
}

export interface TelemetryStats {
  streak: number;
  completedCount: number;
  timeSaved: number; // in hours or minutes, e.g. estimated hours saved
  focusSessions: number;
}
