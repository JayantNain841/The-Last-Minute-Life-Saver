import { Milestone, Briefing, Task, ChatMessage } from '../types';

export async function generateDecompositionPlan(
  prompt: string,
  category: string,
  hours: number
): Promise<{ milestones: Milestone[]; briefing: Briefing }> {
  try {
    const response = await fetch('/api/decompose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, category, hours }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate decomposition plan');
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Backend API error, fallback activated:', err);
    // Client-side quick recovery if fetch fails entirely
    return generateLocalFallback(prompt, category, hours);
  }
}

export async function generateRefocusPlan(
  currentTask: Task,
  progressInfo: string
): Promise<string> {
  try {
    const response = await fetch('/api/refocus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentTask, progressInfo }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate refocus instructions');
    }

    const data = await response.json();
    return data.text;
  } catch (err) {
    console.warn('Backend API error for refocus, local fallback activated:', err);
    return getLocalRefocusFallback(currentTask?.category, progressInfo);
  }
}

export async function sendChatMessage(
  messages: ChatMessage[],
  contextTask?: Task
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, contextTask }),
    });

    if (!response.ok) {
      throw new Error('Failed to get chat response');
    }

    const data = await response.json();
    return data.text;
  } catch (err) {
    console.warn('Backend API error for chat, fallback activated:', err);
    return "The tactical signal is slightly disrupted, but my core advice stands: eliminate all distractions, choose the very next uncompleted step, and work on it for exactly 15 minutes. Action beats anxiety every single time.";
  }
}

// Local Fallbacks for ultimate bulletproof robustness
function generateLocalFallback(prompt: string, category: string, hours: number) {
  const normalizedCategory = category || 'Study';
  const totalMins = Math.round((hours || 2) * 60);
  const chunk = Math.round(totalMins / 4);

  const fallbacks: Record<string, { milestones: Milestone[]; briefing: Briefing }> = {
    Study: {
      milestones: [
        {
          id: 'fb_s1',
          title: 'High-Yield Topic Triage',
          timeBlock: `0 - ${chunk} mins`,
          steps: [
            { id: 'fb_s1_1', text: `Locate the main exam handbook, syllabus guidelines, or rubrics for "${prompt}".`, completed: false },
            { id: 'fb_s1_2', text: 'Filter out the top 3 highest probability topics and ignore the rest of the secondary chapters.', completed: false },
            { id: 'fb_s1_3', text: 'Establish a silent workspace, mute notifications, and open a single scratchpad file.', completed: false }
          ]
        },
        {
          id: 'fb_s2',
          title: 'Active Synthesis Drill',
          timeBlock: `${chunk} - ${chunk * 2} mins`,
          steps: [
            { id: 'fb_s2_1', text: 'Write down key definitions or critical formulas from memory onto your scratchpad.', completed: false },
            { id: 'fb_s2_2', text: 'Formulate 2 mock questions based on the high-yield topics and answer them rapidly.', completed: false },
            { id: 'fb_s2_3', text: 'Compare answers to cheat sheets or summary notes, correcting major gaps immediately.', completed: false }
          ]
        },
        {
          id: 'fb_s3',
          title: 'Timed Simulation Sprint',
          timeBlock: `${chunk * 2} - ${chunk * 3} mins`,
          steps: [
            { id: 'fb_s3_1', text: 'Run a strict 15-minute exam rehearsal timer to build mental speed and combat anxiety.', completed: false },
            { id: 'fb_s3_2', text: 'Structure standard answers around clear bullet points or schematic diagrams.', completed: false },
            { id: 'fb_s3_3', text: 'Review visual formulas or memory triggers one final time.', completed: false }
          ]
        },
        {
          id: 'fb_s4',
          title: 'Submission Protocol Check',
          timeBlock: `${chunk * 3} - ${totalMins} mins`,
          steps: [
            { id: 'fb_s4_1', text: 'Check the official exam portal link, password credentials, or submit guidelines.', completed: false },
            { id: 'fb_s4_2', text: 'Verify physical needs: grab a bottle of water, prepare pencil/paper, and sit straight.', completed: false },
            { id: 'fb_s4_3', text: 'Do a 2-minute controlled box breathing countdown to lower physical cortisol.', completed: false }
          ]
        }
      ],
      briefing: {
        priorityTarget: 'Isolate the 20% high-yield concepts that deliver 80% of testing results.',
        riskAssessment: 'Falling into passive textbook reading instead of active testing and recall practice.',
        bottlenecks: 'Memory fatigue, testing panic, and wasting time on low-probability chapters.',
        recommendedNext: 'Close all open social tabs, turn your phone off, and find the high-yield outline.',
        motivation: 'Time is tight, but focus is your multiplier. You have solved tough problems before. Lock in now!'
      }
    },
    Career: {
      milestones: [
        {
          id: 'fb_c1',
          title: 'Target Intel Mining',
          timeBlock: `0 - ${chunk} mins`,
          steps: [
            { id: 'fb_c1_1', text: `Analyze the main job requirements and keywords for "${prompt}".`, completed: false },
            { id: 'fb_c1_2', text: 'Extract the company mission, core services, and key engineering or business hurdles.', completed: false },
            { id: 'fb_c1_3', text: 'Align your core competence profile with their topmost immediate bottleneck.', completed: false }
          ]
        },
        {
          id: 'fb_c2',
          title: 'STAR Story Selection',
          timeBlock: `${chunk} - ${chunk * 2} mins`,
          steps: [
            { id: 'fb_c2_1', text: 'Select 3 versatile career achievements representing conflict resolution, speed, and delivery.', completed: false },
            { id: 'fb_c2_2', text: 'Write down Situation-Task-Action-Result outlines for each story in bullet format.', completed: false },
            { id: 'fb_c2_3', text: 'Prepare the crucial 90-second customized "About Me" introduction.', completed: false }
          ]
        },
        {
          id: 'fb_c3',
          title: 'Defensive Interview Drills',
          timeBlock: `${chunk * 2} - ${chunk * 3} mins`,
          steps: [
            { id: 'fb_c3_1', text: 'Formulate answers for tough questions (e.g., failure story, salary, career gaps).', completed: false },
            { id: 'fb_c3_2', text: 'Structure exactly 2 highly strategic questions to ask the interviewer at the end.', completed: false },
            { id: 'fb_c3_3', text: 'Rehearse your answers aloud once with a stopwatch to stabilize your pacing.', completed: false }
          ]
        },
        {
          id: 'fb_c4',
          title: 'Setup & Final Grounding',
          timeBlock: `${chunk * 3} - ${totalMins} mins`,
          steps: [
            { id: 'fb_c4_1', text: 'Verify your microphone input, webcam elevation, and background lighting.', completed: false },
            { id: 'fb_c4_2', text: 'Place your physical resume and story notes directly adjacent to the camera lens.', completed: false },
            { id: 'fb_c4_3', text: 'Keep a glass of water nearby and take three slow, steady breaths before the lobby opens.', completed: false }
          ]
        }
      ],
      briefing: {
        priorityTarget: 'Present your past challenges as evidence of high adaptability and resourcefulness.',
        riskAssessment: 'Rambling or sounding scripted under high-stress questions.',
        bottlenecks: 'Speaking too rapidly, poor audio volume, or blanking out on behavioral prompts.',
        recommendedNext: 'Pull up the LinkedIn profiles of your interviewers and the job specification.',
        motivation: 'They requested to speak with you because they see value. Treat this as a mutual strategy session. You got this!'
      }
    },
    Project: {
      milestones: [
        {
          id: 'fb_p1',
          title: 'Scope Reduction & Scaffold Initializing',
          timeBlock: `0 - ${chunk} mins`,
          steps: [
            { id: 'fb_p1_1', text: `Isolate the Minimum Viable Scope (MVS) for "${prompt}" and eliminate nice-to-haves.`, completed: false },
            { id: 'fb_p1_2', text: 'Sketch a quick 5-box flowchart of how data moves from user input to output.', completed: false },
            { id: 'fb_p1_3', text: 'Initialize your code sandbox, verify server binds, and test basic compilation.', completed: false }
          ]
        },
        {
          id: 'fb_p2',
          title: 'Core Architecture Core Code',
          timeBlock: `${chunk} - ${chunk * 2} mins`,
          steps: [
            { id: 'fb_p2_1', text: 'Build or clone the absolute minimal files and mock data schemas.', completed: false },
            { id: 'fb_p2_2', text: 'Write the primary handler, function, or controller that resolves the main action.', completed: false },
            { id: 'fb_p2_3', text: 'Inject quick console logs or print lines to ensure successful endpoint connectivity.', completed: false }
          ]
        },
        {
          id: 'fb_p3',
          title: 'Get-it-Working Speed Sprint',
          timeBlock: `${chunk * 2} - ${chunk * 3} mins`,
          steps: [
            { id: 'fb_p3_1', text: 'Hardcode static variables for any slow-moving external API interfaces.', completed: false },
            { id: 'fb_p3_2', text: 'Write raw, working algorithmic logic rapidly. Do not spend time on code beauty now.', completed: false },
            { id: 'fb_p3_3', text: 'Tackle immediate compiler errors instantly so your project remains in a buildable state.', completed: false }
          ]
        },
        {
          id: 'fb_p4',
          title: 'UI Integration & Compilation Validation',
          timeBlock: `${chunk * 3} - ${totalMins} mins`,
          steps: [
            { id: 'fb_p4_1', text: 'Wire up a simple, high-visibility UI to interact with your core logic.', completed: false },
            { id: 'fb_p4_2', text: 'Remove debugging console.logs, add quick fallback states, and test compile.', completed: false },
            { id: 'fb_p4_3', text: 'Run the production build script to make sure it bundles without warnings.', completed: false }
          ]
        }
      ],
      briefing: {
        priorityTarget: 'Achieve a fully compiling, end-to-end operational code system.',
        riskAssessment: 'Getting stuck on fine-grained CSS layouts or complex database optimizations.',
        bottlenecks: 'Stale cached files, incorrect dependency configurations, or runtime reference crashes.',
        recommendedNext: 'Initialize your directory structure and write down the core algorithm.',
        motivation: 'Done is infinitely better than perfect. A compiling script is a win. Sprint to compiling!'
      }
    }
  };

  const defaultKey = fallbacks[normalizedCategory] ? normalizedCategory : 'Study';
  const defaultPlan = fallbacks[defaultKey] || fallbacks.Study;

  // Personal and Administrative fallbacks can adapt on the fly
  if (normalizedCategory === 'Personal' || normalizedCategory === 'Administrative') {
    return {
      milestones: defaultPlan.milestones.map((m, index) => {
        const customTitles = {
          Personal: ['Triage Core Issues', 'Actionable Steps Mapping', 'Execution & Launch', 'Decompress & Review'],
          Administrative: ['Document Harvesting', 'Fast Form Filling', 'Signature & Audit Check', 'Official File Submission']
        };
        const titleArr = customTitles[normalizedCategory as 'Personal' | 'Administrative'] || [];
        return {
          ...m,
          title: titleArr[index] || m.title,
          id: `fb_custom_${normalizedCategory}_${index}`
        };
      }),
      briefing: {
        priorityTarget: `[Rescue Mission] Isolate the single core outcome for "${prompt}".`,
        riskAssessment: 'Delaying action due to stress or trying to handle everything simultaneously.',
        bottlenecks: 'Disorganization, login delays, or emotional decision making.',
        recommendedNext: 'Locate any relevant documents, codes, or instructions immediately.',
        motivation: 'One step at a time. Speed is the variable that changes anxiety to agency. Go!'
      }
    };
  }

  return defaultPlan;
}

function getLocalRefocusFallback(category?: string, progressInfo?: string): string {
  const normCategory = category || 'Study';
  const p = (progressInfo || '').toLowerCase();

  if (p.includes('overwhelmed') || p.includes('panic') || p.includes('stress')) {
    return "Operational Warning: Cortisol spike detected. Close your eyes and inhale for 4 seconds, hold for 4, exhale for 4. Now, look only at the first milestone step. Ignore everything else. Work on that single checkbox for 10 minutes.";
  }

  const guidelines: Record<string, string> = {
    Study: "Bypass the detailed explanatory chapters. Go straight to the bullet points or summarize the main equations. Open a scratchpad, write them 3 times, then do a quick active quiz. Action breaks the block.",
    Career: "Remember, interviews are won on communication, not robotic perfection. If feeling stuck on your pitch, bullet down your top story using: Situation -> Action -> Impact. Read it out loud once, and focus on steady pacing.",
    Project: "Bypass any third-party API integration or complex database call. Hardcode a dummy JSON data return in your controller file. Validate that your core interface compiles and displays. Mocking is the ultimate rescue strategy.",
    Personal: "Draft a clean, concise, 2-sentence response outlining what is ready, and what is the exact timeline for the next part. Clear communication immediately reduces personal friction.",
    Administrative: "Locate only the fields with red asterisks or labeled 'Required'. Leave optional sections blank. Fill out the core data, save, upload the PDFs, and click Submit. Precision beats completion."
  };

  return guidelines[normCategory] || "Halt secondary operations. Take exactly one minute to stand up, stretch, and drink a glass of water. Select the very next checkable step and execute it with 100% effort for 15 minutes. Speed is security.";
}
